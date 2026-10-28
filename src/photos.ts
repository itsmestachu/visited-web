import { useEffect, useState } from "react";

type StoredPhoto = {
  id: string;
  full: Blob;
  thumb: Blob;
  createdAt: number;
};

export type PhotoSize = "full" | "thumb";

const DB_NAME = "visited-map";
const STORE = "photos";
const FULL_MAX = 1920;
const THUMB_MAX = 400;

let dbPromise: Promise<IDBDatabase> | null = null;

const db = () => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
};

const run = async <T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>) => {
  const database = await db();
  return new Promise<T>((resolve, reject) => {
    const req = fn(database.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

const resize = async (bitmap: ImageBitmap, max: number, quality: number) => {
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Encoding failed"))), "image/jpeg", quality),
  );
};

export const savePhoto = async (file: File): Promise<string> => {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const [full, thumb] = await Promise.all([resize(bitmap, FULL_MAX, 0.85), resize(bitmap, THUMB_MAX, 0.75)]);
  bitmap.close();
  const photo: StoredPhoto = { id: crypto.randomUUID(), full, thumb, createdAt: Date.now() };
  await run("readwrite", (s) => s.put(photo));
  return photo.id;
};

export const deletePhoto = (id: string) => run("readwrite", (s) => s.delete(id));

const urlCache = new Map<string, string>();

const getUrl = async (id: string, size: PhotoSize) => {
  const key = `${id}:${size}`;
  const cached = urlCache.get(key);
  if (cached) return cached;
  const photo = await run<StoredPhoto | undefined>("readonly", (s) => s.get(id));
  if (!photo) return null;
  const url = URL.createObjectURL(photo[size]);
  urlCache.set(key, url);
  return url;
};

export const forgetPhotoUrls = (id: string) => {
  for (const size of ["full", "thumb"] as const) {
    const key = `${id}:${size}`;
    const url = urlCache.get(key);
    if (url) URL.revokeObjectURL(url);
    urlCache.delete(key);
  }
};

export const usePhotoUrl = (id: string, size: PhotoSize) => {
  const [state, setState] = useState<{ key: string; url: string | null } | null>(null);
  const key = `${id}:${size}`;
  useEffect(() => {
    let alive = true;
    getUrl(id, size).then((url) => {
      if (alive) setState({ key, url });
    });
    return () => {
      alive = false;
    };
  }, [id, size, key]);
  return state && state.key === key ? state.url : null;
};
