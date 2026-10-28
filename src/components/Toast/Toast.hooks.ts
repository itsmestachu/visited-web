import { useCallback, useEffect, useRef, useState } from "react";
import type { UndoToastInput, UndoToastState } from "./Toast.types";

export const TOAST_MS = 6000;

export const useUndoToast = () => {
  const [toast, setToast] = useState<UndoToastState | null>(null);
  const currentRef = useRef<UndoToastState | null>(null);
  const counter = useRef(0);

  const finalize = useCallback(() => {
    const current = currentRef.current;
    currentRef.current = null;
    current?.onExpire?.();
  }, []);

  const show = useCallback(
    (input: UndoToastInput) => {
      finalize();
      const next = { ...input, id: ++counter.current };
      currentRef.current = next;
      setToast(next);
    },
    [finalize],
  );

  const expire = useCallback(() => {
    finalize();
    setToast(null);
  }, [finalize]);

  const undo = useCallback(() => {
    const current = currentRef.current;
    currentRef.current = null;
    current?.onUndo();
    setToast(null);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(expire, TOAST_MS);
    return () => clearTimeout(t);
  }, [toast, expire]);

  useEffect(() => () => finalize(), [finalize]);

  return { toast, show, undo, dismiss: expire };
};
