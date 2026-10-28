import { TOAST_MS } from "./Toast.hooks";
import { CloseButton, Message, Timer, UndoButton, Wrapper } from "./Toast.styles";
import type { UndoToastState } from "./Toast.types";

type Props = {
  toast: UndoToastState;
  onUndo: () => void;
  onDismiss: () => void;
};

export function Toast({ toast, onUndo, onDismiss }: Props) {
  return (
    <Wrapper key={toast.id} role="status">
      <Message>{toast.message}</Message>
      <UndoButton type="button" onClick={onUndo}>
        Cofnij
      </UndoButton>
      <CloseButton type="button" onClick={onDismiss} aria-label="Zamknij">
        ✕
      </CloseButton>
      <Timer $duration={TOAST_MS} />
    </Wrapper>
  );
}
