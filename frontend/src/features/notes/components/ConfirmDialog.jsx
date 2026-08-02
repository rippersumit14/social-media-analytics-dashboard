import { AlertTriangle, X } from "lucide-react";

import { Button } from "../../../components/ui/Button";

export function ConfirmDialog({ isOpen, title, description, confirmLabel = "Confirm", isLoading, onConfirm, onClose }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div className="w-full max-w-md rounded-lg border border-[var(--app-border)] bg-[var(--app-paper)] p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-700">
              <AlertTriangle aria-hidden="true" size={19} />
            </span>
            <div>
              <h2 id="confirm-dialog-title" className="text-base font-semibold text-[var(--app-text)]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--app-muted)] transition hover:bg-[var(--app-bg)] hover:text-[var(--app-text)]"
            aria-label="Close confirmation"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
            {isLoading ? "Working..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
