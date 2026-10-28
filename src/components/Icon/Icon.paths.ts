import type { IconName } from "./Icon.types";

export const ICON_PATHS: Record<IconName, string[]> = {
  trash: ["M4 7h16", "M10 11v6", "M14 11v6", "M6 7l1 13h10l1-13", "M9 7V4h6v3"],
  plus: ["M12 5v14", "M5 12h14"],
  target: ["M12 3v3", "M12 18v3", "M3 12h3", "M18 12h3", "M12 8a4 4 0 1 0 0 8a4 4 0 1 0 0-8"],
  close: ["M6 6l12 12", "M18 6L6 18"],
  search: ["M11 4a7 7 0 1 0 0 14a7 7 0 1 0 0-14", "M20 20l-4-4"],
  camera: ["M4 8h4l2-3h4l2 3h4v11H4z", "M12 10a3.5 3.5 0 1 0 0 7a3.5 3.5 0 1 0 0-7"],
};
