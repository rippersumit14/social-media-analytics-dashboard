import { AlertTriangle, X } from "lucide-react";

import { Button } from "../../../components/ui/Button";

export function ConfirmDialog({ isOpen, title, description, confirmLabel = "Confirm", isLoading, onConfirm, onClose }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 p-4">
      <div className="w-full max-w-md rounded-lg border border-line-200 bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700">
              <AlertTriangle aria-hidden="true" size={19} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-ink-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-500">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-500 hover:bg-cloud-100"
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
