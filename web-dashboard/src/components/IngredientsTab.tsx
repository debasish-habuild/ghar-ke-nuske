import { useEffect, useState } from "react";
import { api } from "../api";
import { EMPTY_INGREDIENT, type Ingredient } from "../types";
import { Button, Field, Modal, NumberInput, TextInput } from "./ui";

export default function IngredientsTab() {
  const [items, setItems] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [toast, setToast] = useState("");

  const load = () => {
    setLoading(true);
    api
      .listIngredients()
      .then((d) => setItems(d.sort((a, b) => a.order - b.order)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2000);
  };

  const save = async (ing: Ingredient) => {
    await api.saveIngredient(ing);
    setEditing(null);
    flash("Saved ✓");
    load();
  };

  const remove = async (ing: Ingredient) => {
    if (!confirm(`Delete ingredient "${ing.name}"?`)) return;
    await api.deleteIngredient(ing.id);
    flash("Deleted");
    load();
  };

  return (
    <div>
      <div className="section-head">
        <h2>
          Ingredients <span className="count-pill">{items.length}</span>
        </h2>
        <Button onClick={() => setEditing({ ...EMPTY_INGREDIENT })}>
          + Add Ingredient
        </Button>
      </div>
      {error && <div className="banner">{error}</div>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="list">
          {items.map((i) => (
            <div className="row-card" key={i.id}>
              <div className="row-emoji">{i.emoji || "🌿"}</div>
              <div className="row-main">
                <div className="row-title">{i.name}</div>
                <div className="row-sub">{i.group}</div>
                <div className="row-id">{i.id}</div>
              </div>
              <div className="row-actions">
                <Button variant="ghost" onClick={() => setEditing({ ...i })}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => remove(i)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <IngredientForm
          value={editing}
          onClose={() => setEditing(null)}
          onSave={save}
          isNew={!editing.id}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function IngredientForm({
  value,
  onClose,
  onSave,
  isNew,
}: {
  value: Ingredient;
  onClose: () => void;
  onSave: (i: Ingredient) => Promise<void>;
  isNew: boolean;
}) {
  const [form, setForm] = useState<Ingredient>(value);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Ingredient>(k: K, v: Ingredient[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

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

  return (
    <Modal
      title={isNew ? "Add Ingredient" : "Edit Ingredient"}
      onClose={onClose}
    >
      <Field label="Name">
        <TextInput
          value={form.name}
          onChange={(v) => set("name", v)}
          placeholder="e.g. Ginger"
        />
      </Field>
      <div className="row-2">
        <Field label="Emoji">
          <TextInput
            value={form.emoji}
            onChange={(v) => set("emoji", v)}
            placeholder="🫚"
          />
        </Field>
        <Field label="Order">
          <NumberInput value={form.order} onChange={(v) => set("order", v)} />
        </Field>
      </div>
      <Field label="Group" hint="Bucket shown in the app's Kitchen Finder">
        <TextInput
          value={form.group}
          onChange={(v) => set("group", v)}
          placeholder="Common Herbs"
        />
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
