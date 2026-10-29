import { useCallback, useEffect, useState } from "react";
import { loadSettings, saveSettings, type Settings } from "./settings";

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  useEffect(() => saveSettings(settings), [settings]);
  const update = useCallback((patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })), []);
  return [settings, update] as const;
};
