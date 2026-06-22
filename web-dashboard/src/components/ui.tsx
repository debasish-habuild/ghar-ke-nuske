// Small, reusable form controls with big labels — kept deliberately plain so
// the dashboard is easy to use for anyone.
import { useState, type ReactNode } from "react";
import { uploadImage } from "../fileService";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {hint && <span className="field-hint">{hint}</span>}
      {children}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      className="input"
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function NumberInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      className="input"
      type="number"
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  );
}

/** Multi-line text where each line becomes one array item. */
export function LinesInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      className="input textarea"
      rows={Math.max(3, value.length + 1)}
      value={value.join("\n")}
      placeholder={placeholder}
      onChange={(e) =>
        onChange(e.target.value.split("\n").filter((l) => l.trim() !== ""))
      }
    />
  );
}

/**
 * An auto-growing list of single-line text inputs — one row per item, with a
 * trailing blank row that sprouts a new row as soon as you type into it.
 * Emits a clean string[] (whitespace-only entries are dropped).
 */
export function GrowableList({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  // Always render the real values plus one trailing blank row.
  const rows = [...value, ""];

  const emit = (next: string[]) =>
    onChange(next.map((s) => s.trim()).filter((s) => s !== ""));

  const update = (idx: number, text: string) => {
    const next = [...rows];
    next[idx] = text;
    emit(next);
  };

  const remove = (idx: number) => {
    const next = rows.filter((_, i) => i !== idx);
    emit(next);
  };

  return (
    <div>
      {rows.map((row, idx) => {
        const isTrailing = idx === rows.length - 1;
        return (
          <div className="ing-row" key={idx}>
            <input
              className="input"
              value={row}
              placeholder={placeholder}
              onChange={(e) => update(idx, e.target.value)}
            />
            {!isTrailing && (
              <Button variant="danger" onClick={() => remove(idx)}>
                ✕
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Image field that uploads via the company file-service while still letting an
 * admin paste/edit a URL by hand. Shows a preview when `value` is set.
 */
export function ImageUploadField({
  value,
  onChange,
  folder,
}: {
  value: string;
  onChange: (url: string) => void;
  folder: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload">
      {value && <img className="image-upload-preview" src={value} alt="" />}
      <label className={`btn btn-ghost ${uploading ? "is-disabled" : ""}`}>
        {uploading ? "Uploading…" : "Upload image"}
        <input
          type="file"
          accept="image/*"
          hidden
          disabled={uploading}
          onChange={onFile}
        />
      </label>
      <input
        className="input"
        value={value}
        placeholder="https://… (or upload above)"
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="checkbox">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

/** A modal dialog used for create/edit forms. */
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
