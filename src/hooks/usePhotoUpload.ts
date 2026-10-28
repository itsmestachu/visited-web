import { useState } from "react";
import { savePhoto } from "../services/photoStorage";

type Progress = { done: number; total: number };

export const usePhotoUpload = (onSaved: (ids: string[]) => void) => {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: FileList | null) => {
    const list = files ? [...files].filter((f) => f.type.startsWith("image/")) : [];
    if (list.length === 0) return;
    setError(null);
    setProgress({ done: 0, total: list.length });
    const ids: string[] = [];
    let failed = 0;
    for (const file of list) {
      try {
        ids.push(await savePhoto(file));
      } catch {
        failed++;
      }
      setProgress({ done: ids.length + failed, total: list.length });
    }
    if (ids.length) onSaved(ids);
    if (failed) setError(`Nie udało się wczytać ${failed} zdj.`);
    setProgress(null);
  };

  return { upload, progress, error };
};
