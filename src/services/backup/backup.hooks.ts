import { useState } from "react";
import type { AppData, Dispatch } from "../../store/store.types";
import { formatDate } from "../../utils/dates";
import { BackupError, exportBackup, readBackup, restoreBackup } from "./backup";

export const useBackup = (data: AppData, dispatch: Dispatch) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await task();
    } catch (e) {
      setError(e instanceof BackupError ? e.message : "Coś poszło nie tak. Spróbuj ponownie.");
    } finally {
      setBusy(false);
    }
  };

  const exportData = () => run(() => exportBackup(data));

  const importData = (file: File) =>
    run(async () => {
      const backup = await readBackup(file);
      const from = backup.exportedAt ? ` z ${formatDate(backup.exportedAt.slice(0, 10))}` : "";
      const summary = `${Object.keys(backup.data.countries).length} krajów, ${Object.keys(backup.data.places).length} miejsc, ${backup.photos.length} zdjęć`;
      if (!window.confirm(`Wczytać kopię${from} (${summary})?\n\nWszystkie obecne dane i zdjęcia zostaną zastąpione.`)) return;
      dispatch({ type: "replaceData", data: await restoreBackup(backup) });
    });

  return { busy, error, exportData, importData };
};
