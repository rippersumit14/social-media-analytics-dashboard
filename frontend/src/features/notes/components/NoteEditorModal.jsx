import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { Button } from "../../../components/ui/Button";
import { TextField } from "../../../components/ui/TextField";

const initialValues = {
  title: "",
  content: "",
  category: "general",
};

function validateNote(values) {
  const errors = {};

  if (!values.title.trim()) {
    errors.title = "Title is required.";
  }

  if (!values.content.trim()) {
    errors.content = "Content is required.";
  }

  if (values.title.trim().length > 120) {
    errors.title = "Title must be 120 characters or less.";
  }

  if (values.content.trim().length > 10000) {
    errors.content = "Content must be 10,000 characters or less.";
  }

  return errors;
}

export function NoteEditorModal({ note, isOpen, isSubmitting, onClose, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setValues({
      title: note?.title || "",
      content: note?.content || "",
      category: note?.category || "general",
    });
    setErrors({});
  }, [isOpen, note]);

  if (!isOpen) {
    return null;
  }

  function updateField(field, value) {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateNote(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    onSubmit({
      title: values.title.trim(),
      content: values.content.trim(),
      category: values.category.trim() || "general",
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="note-editor-title">
      <form onSubmit={handleSubmit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-[var(--app-border)] bg-[var(--app-paper)] p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-[var(--app-primary)]">Personal Notes</p>
            <h2 id="note-editor-title" className="mt-1 text-lg font-semibold text-[var(--app-text)]">{note ? "Edit note" : "Create note"}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--app-muted)] transition hover:bg-[var(--app-bg)] hover:text-[var(--app-text)]"
            aria-label="Close note editor"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <TextField
            id="note-title"
            label="Title"
            value={values.title}
            onChange={(event) => updateField("title", event.target.value)}
            maxLength={120}
            error={errors.title}
            placeholder="Weekly content plan"
          />

          <TextField
            id="note-category"
            label="Category"
            value={values.category}
            onChange={(event) => updateField("category", event.target.value)}
            maxLength={80}
            placeholder="strategy"
          />

          <div>
            <label htmlFor="note-content" className="mb-2 block text-sm font-semibold text-[var(--app-text)]">
              Content
            </label>
            <textarea
              id="note-content"
              value={values.content}
              onChange={(event) => updateField("content", event.target.value)}
              rows={10}
              maxLength={10000}
              className={[
                "w-full resize-y rounded-lg border bg-[var(--app-paper)] px-3 py-3 text-sm leading-6 text-[var(--app-text)] outline-none transition",
                "placeholder:text-[var(--app-muted)] focus:border-[var(--app-primary)] focus:ring-4 focus:ring-[var(--app-ring)]",
                errors.content ? "border-red-300" : "border-[var(--app-border)]",
              ].join(" ")}
              aria-invalid={Boolean(errors.content)}
              aria-describedby={errors.content ? "note-content-error" : undefined}
              placeholder="Write ideas, strategy notes, experiments, hooks, or follow-up actions..."
            />
            {errors.content ? (
              <p id="note-content-error" className="mt-2 text-sm text-red-600">
                {errors.content}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : note ? "Save changes" : "Create note"}
          </Button>
        </div>
      </form>
    </div>
  );
}
