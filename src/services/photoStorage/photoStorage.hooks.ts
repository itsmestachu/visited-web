import { useState, useEffect } from "react";
import { getPhotoUrl, type PhotoSize } from "./photoStorage";

export const usePhotoUrl = (id: string, size: PhotoSize) => {
  const key = `${id}:${size}`;
  const [state, setState] = useState<{ key: string; url: string | null } | null>(null);
  useEffect(() => {
    let alive = true;
    getPhotoUrl(id, size).then((url) => {
      if (alive) setState({ key, url });
    });
    return () => {
      alive = false;
    };
  }, [id, size, key]);
  return state && state.key === key ? state.url : null;
};

export type UploadProgress = { done: number; total: number };
