export type UndoToastInput = {
  message: string;
  onUndo: () => void;
  onExpire?: () => void;
};

export type UndoToastState = UndoToastInput & { id: number };
