import type { Status } from "../types/models";

export const STATUS_LABEL: Record<Status, string> = { visited: "odwiedzone", wish: "chcę odwiedzić" };

export const MODE_LABEL: Record<Status, string> = { visited: "Odwiedzone", wish: "Chcę odwiedzić" };

export const STATUS_ICON: Record<Status, string> = { visited: "✓", wish: "★" };
