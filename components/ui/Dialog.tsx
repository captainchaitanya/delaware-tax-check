import { useEffect, useRef, type ReactNode } from "react";
import { Button } from "./Button";

type DialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
};

export function Dialog({
  open,
  title,
  children,
  confirmLabel,
  onConfirm,
  onClose,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    if (open && !node.open) {
      node.showModal();
    }
    if (!open && node.open) {
      node.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="w-[min(28rem,calc(100vw-2rem))] rounded-md border border-line bg-card p-5 text-foreground shadow-lg backdrop:bg-foreground/30"
    >
      <h2 className="font-serif text-xl font-medium">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-muted">{children}</div>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
