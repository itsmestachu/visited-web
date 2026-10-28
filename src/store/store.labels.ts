import type { Status } from "./store.types";

export const STATUS_LABEL: Record<Status, string> = { visited: "odwiedzone", wish: "chcę odwiedzić" };

export const MODE_LABEL: Record<Status, string> = { visited: "Byłem tu", wish: "Chcę pojechać" };

export const STATUS_ICON: Record<Status, string> = { visited: "✓", wish: "★" };
