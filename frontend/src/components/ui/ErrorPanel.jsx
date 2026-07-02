import { AlertCircle } from "lucide-react";

export function ErrorPanel({ title = "Unable to load this section", message, action }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
      <div className="flex gap-3">
        <AlertCircle aria-hidden="true" className="mt-0.5 shrink-0" size={18} />
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          {message ? <p className="mt-1 text-sm leading-6">{message}</p> : null}
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
