import { useEffect, useState } from "react";
import { api } from "../api";
import { EMPTY_CATEGORY, type Category } from "../types";
import { Button, Field, Modal, NumberInput, TextInput } from "./ui";

const ROLES = ["concern", "symptom"];
const ICON_KEYS = ["cold", "digestion", "hair", "skincare"];

export default function CategoriesTab() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [toast, setToast] = useState("");

  const load = () => {
    setLoading(true);
    api
      .listCategories()
      .then((d) => setItems(d.sort((a, b) => a.order - b.order)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2000);
  };

  const save = async (c: Category) => {
    await api.saveCategory(c);
    setEditing(null);
    flash("Saved ✓");
    load();
  };
  const remove = async (c: Category) => {
    if (!confirm(`Delete condition "${c.name}"?`)) return;
    await api.deleteCategory(c.id);
    flash("Deleted");
    load();
  };

  return (
    <div>
      <div className="section-head">
        <h2>
          Conditions <span className="count-pill">{items.length}</span>
        </h2>
        <Button onClick={() => setEditing({ ...EMPTY_CATEGORY })}>
          + Add Condition
        </Button>
      </div>
      {error && <div className="banner">{error}</div>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="list">
          {items.map((c) => (
            <div className="row-card" key={c.id}>
              <div className="row-emoji">{c.emoji || "🏷️"}</div>
              <div className="row-main">
                <div className="row-title">{c.name}</div>
                <div className="row-sub">{(c.roles || []).join(", ")}</div>
                <div className="row-id">{c.id}</div>
              </div>
              <div className="row-actions">
                <Button variant="ghost" onClick={() => setEditing({ ...c })}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => remove(c)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <CategoryForm
          value={editing}
          isNew={!editing.id}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function CategoryForm({
  value,
  isNew,
  onClose,
  onSave,
}: {
  value: Category;
  isNew: boolean;
  onClose: () => void;
  onSave: (c: Category) => Promise<void>;
}) {
  const [form, setForm] = useState<Category>({
    ...value,
    roles: value.roles || [],
  });
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Category>(k: K, v: Category[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleRole = (role: string) =>
    set(
      "roles",
      form.roles.includes(role)
        ? form.roles.filter((r) => r !== role)
        : [...form.roles, role],
    );

  const submit = async () => {
    setBusy(true);
    try {
      await onSave(form);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const isConcern = form.roles.includes("concern");

  return (
    <Modal title={isNew ? "Add Condition" : "Edit Condition"} onClose={onClose}>
      <Field label="Name">
        <TextInput
          value={form.name}
          onChange={(v) => set("name", v)}
          placeholder="e.g. Digestion"
        />
      </Field>

      <Field
        label="Used as"
        hint="Concern = Home page tile · Symptom = symptom picker"
      >
        <div className="chips-select">
          {ROLES.map((r) => (
            <button
              type="button"
              key={r}
              className={`chip-toggle ${form.roles.includes(r) ? "on" : ""}`}
              onClick={() => toggleRole(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </Field>

      {isConcern ? (
        <>
          <div className="row-2">
            <Field label="Icon" hint="Picture on the Home tile">
              <select
                className="input"
                value={form.iconKey}
                onChange={(e) => set("iconKey", e.target.value)}
              >
                <option value="">— none —</option>
                {ICON_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Background color">
              <input
                className="input"
                type="color"
                value={form.color || "#E8F5E9"}
                onChange={(e) => set("color", e.target.value)}
              />
            </Field>
          </div>
        </>
      ) : (
        <Field label="Emoji" hint="Shown in the symptom picker">
          <TextInput
            value={form.emoji}
            onChange={(v) => set("emoji", v)}
            placeholder="🤧"
          />
        </Field>
      )}

      <Field label="Order">
        <NumberInput value={form.order} onChange={(v) => set("order", v)} />
      </Field>

      <div className="modal-actions">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={busy || !form.name}>
          {busy ? "Saving…" : "Save"}
        </Button>
      </div>
    </Modal>
  );
}
