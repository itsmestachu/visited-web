import type { AppData } from "../../store/store.types";
import { parseData } from "../../store/store.persistence";
import { readPhotos, replaceAllPhotos } from "../photoStorage/photoStorage";

const APP = "visited-map";
const FORMAT = 1;

type BackupPhoto = { id: string; createdAt: number; full: string; thumb: string };

type BackupFile = {
  app: typeof APP;
  format: number;
  exportedAt: string;
  data: AppData;
  photos: BackupPhoto[];
};

export type Backup = { data: AppData; photos: BackupPhoto[]; exportedAt?: string };

export class BackupError extends Error {}

const toDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const toBlob = async (dataUrl: string) => (await fetch(dataUrl)).blob();

const download = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const exportBackup = async (data: AppData) => {
  const stored = await readPhotos(Object.values(data.places).flatMap((p) => p.photos));
  const photos = await Promise.all(
    stored.map(async (p) => ({ id: p.id, createdAt: p.createdAt, full: await toDataUrl(p.full), thumb: await toDataUrl(p.thumb) })),
  );
  const exportedAt = new Date().toISOString();
  const file: BackupFile = { app: APP, format: FORMAT, exportedAt, data, photos };
  download(new Blob([JSON.stringify(file)], { type: "application/json" }), `mapa-podrozy-${exportedAt.slice(0, 10)}.json`);
};

export const readBackup = async (file: File): Promise<Backup> => {
  let parsed: Partial<BackupFile> | null;
  try {
    parsed = JSON.parse(await file.text());
  } catch {
    parsed = null;
  }
  if (parsed?.app !== APP || typeof parsed.format !== "number") throw new BackupError("To nie jest plik kopii zapasowej mapy podróży.");
  if (parsed.format > FORMAT) throw new BackupError("Ta kopia pochodzi z nowszej wersji aplikacji.");
  const data = parseData(parsed.data);
  if (!data || !Array.isArray(parsed.photos)) throw new BackupError("Plik kopii jest uszkodzony.");
  return { data, photos: parsed.photos, exportedAt: parsed.exportedAt };
};

export const restoreBackup = async (backup: Backup) => {
  const photos = await Promise.all(
    backup.photos.map(async (p) => ({ id: p.id, createdAt: p.createdAt, full: await toBlob(p.full), thumb: await toBlob(p.thumb) })),
  );
  await replaceAllPhotos(photos);
  return backup.data;
};
