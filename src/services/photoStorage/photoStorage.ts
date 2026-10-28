import { resizeToJpeg } from "./photoStorage.resize";

export type PhotoSize = "full" | "thumb";

export type StoredPhoto = {
  id: string;
  full: Blob;
  thumb: Blob;
  createdAt: number;
};

const DB_NAME = "visited-map";
const STORE = "photos";
const FULL_MAX = 1920;
const THUMB_MAX = 400;

let dbPromise: Promise<IDBDatabase> | null = null;

const openDb = () => {
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
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

const urlCache = new Map<string, string>();

const forgetUrls = (id: string) => {
  for (const size of ["full", "thumb"] as const) {
    const key = `${id}:${size}`;
    const url = urlCache.get(key);
    if (url) URL.revokeObjectURL(url);
    urlCache.delete(key);
  }
};

export const savePhoto = async (file: File): Promise<string> => {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const [full, thumb] = await Promise.all([resizeToJpeg(bitmap, FULL_MAX, 0.85), resizeToJpeg(bitmap, THUMB_MAX, 0.75)]);
  bitmap.close();
  const photo: StoredPhoto = { id: crypto.randomUUID(), full, thumb, createdAt: Date.now() };
  await run("readwrite", (s) => s.put(photo));
  return photo.id;
};

export const deletePhoto = async (id: string) => {
  forgetUrls(id);
  await run("readwrite", (s) => s.delete(id));
};

export const readPhotos = async (ids: string[]) => {
  const photos = await Promise.all(ids.map((id) => run<StoredPhoto | undefined>("readonly", (s) => s.get(id))));
  return photos.filter((p): p is StoredPhoto => p !== undefined);
};

export const replaceAllPhotos = async (photos: StoredPhoto[]) => {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    store.clear();
    for (const photo of photos) store.put(photo);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  // Not revoked: mounted thumbnails may still show these URLs until they re-render.
  urlCache.clear();
};

export const getPhotoUrl = async (id: string, size: PhotoSize) => {
  const key = `${id}:${size}`;
  const cached = urlCache.get(key);
  if (cached) return cached;
  const photo = await run<StoredPhoto | undefined>("readonly", (s) => s.get(id));
  if (!photo) return null;
  const url = URL.createObjectURL(photo[size]);
  urlCache.set(key, url);
  return url;
};
