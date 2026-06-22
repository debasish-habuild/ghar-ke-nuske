import { useEffect, useState } from "react";
import { api } from "../api";
import {
  EMPTY_REMEDY,
  type Category,
  type Ingredient,
  type Remedy,
  type RemedyIngredient,
} from "../types";
import {
  Button,
  Checkbox,
  Field,
  GrowableList,
  ImageUploadField,
  Modal,
  TextInput,
} from "./ui";

export default function RemediesTab() {
  const [items, setItems] = useState<Remedy[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Remedy | null>(null);
  const [toast, setToast] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      api.listRemedies(),
      api.listCategories(),
      api.listIngredients(),
    ])
      .then(([r, c, i]) => {
        setItems(r);
        setCategories(c.sort((a, b) => a.order - b.order));
        setIngredients(i.sort((a, b) => a.order - b.order));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 2000);
  };

  const save = async (r: Remedy) => {
    await api.saveRemedy(r);
    setEditing(null);
    flash("Saved ✓");
    load();
  };
  const remove = async (r: Remedy) => {
    if (!confirm(`Delete remedy "${r.title}"?`)) return;
    await api.deleteRemedy(r.id);
    flash("Deleted");
    load();
  };

  return (
    <div>
      <div className="section-head">
        <h2>
          Remedies <span className="count-pill">{items.length}</span>
        </h2>
        <Button onClick={() => setEditing({ ...EMPTY_REMEDY })}>
          + Add Remedy
        </Button>
      </div>
      {error && <div className="banner">{error}</div>}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : (
        <div className="list">
          {items.map((r) => (
            <div className="row-card" key={r.id}>
              {r.imageUrl ? (
                <img src={r.imageUrl} alt="" />
              ) : (
                <div className="row-emoji">🧪</div>
              )}
              <div className="row-main">
                <div className="row-title">
                  {r.title} {r.isPopular && "⭐"}
                </div>
                <div className="row-sub">{r.summary}</div>
                <div className="row-id">{r.id}</div>
              </div>
              <div className="row-actions">
                <Button variant="ghost" onClick={() => setEditing({ ...r })}>
                  Edit
                </Button>
                <Button variant="danger" onClick={() => remove(r)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <RemedyForm
          value={editing}
          isNew={!editing.id}
          categories={categories}
          ingredients={ingredients}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function RemedyForm({
  value,
  isNew,
  categories,
  ingredients,
  onClose,
  onSave,
}: {
  value: Remedy;
  isNew: boolean;
  categories: Category[];
  ingredients: Ingredient[];
  onClose: () => void;
  onSave: (r: Remedy) => Promise<void>;
}) {
  const [form, setForm] = useState<Remedy>(value);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof Remedy>(k: K, v: Remedy[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleCategory = (id: string) =>
    set(
      "categoryIds",
      form.categoryIds.includes(id)
        ? form.categoryIds.filter((c) => c !== id)
        : [...form.categoryIds, id],
    );

  const setIngredient = (idx: number, patch: Partial<RemedyIngredient>) => {
    const next = form.ingredients.map((ing, i) =>
      i === idx ? { ...ing, ...patch } : ing,
    );
    set("ingredients", next);
  };
  const addIngredient = () =>
    set("ingredients", [...form.ingredients, { ingredientId: "", amount: "" }]);
  const removeIngredient = (idx: number) =>
    set(
      "ingredients",
      form.ingredients.filter((_, i) => i !== idx),
    );

  const submit = async () => {
    setBusy(true);
    try {
      // Keep ingredientIds in sync with the ingredient rows.
      const cleanIngredients = form.ingredients.filter((i) => i.ingredientId);
      const payload: Remedy = {
        ...form,
        ingredients: cleanIngredients,
        ingredientIds: [
          ...new Set(cleanIngredients.map((i) => i.ingredientId)),
        ],
      };
      await onSave(payload);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={isNew ? "Add Remedy" : "Edit Remedy"} onClose={onClose}>
      <Field label="Title">
        <TextInput
          value={form.title}
          onChange={(v) => set("title", v)}
          placeholder="Ginger Honey Remedy"
        />
      </Field>
      <Field label="Short summary">
        <TextInput
          value={form.summary}
          onChange={(v) => set("summary", v)}
          placeholder="Soothes sore throat…"
        />
      </Field>
      <div className="row-2">
        <Field label="Image">
          <ImageUploadField
            value={form.imageUrl}
            onChange={(v) => set("imageUrl", v)}
            folder="remedies"
          />
        </Field>
        <Field label="Prep time">
          <TextInput
            value={form.time}
            onChange={(v) => set("time", v)}
            placeholder="3 mins"
          />
        </Field>
      </div>

      <Field label="Main category">
        <select
          className="input"
          value={form.primaryCategoryId}
          onChange={(e) => set("primaryCategoryId", e.target.value)}
        >
          <option value="">— choose —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Also tagged under"
        hint="Tap to select any related categories"
      >
        <div className="chips-select">
          {categories.map((c) => (
            <button
              type="button"
              key={c.id}
              className={`chip-toggle ${form.categoryIds.includes(c.id) ? "on" : ""}`}
              onClick={() => toggleCategory(c.id)}
            >
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Ingredients">
        {form.ingredients.map((ing, idx) => (
          <div className="ing-row" key={idx}>
            <select
              className="input"
              value={ing.ingredientId}
              onChange={(e) =>
                setIngredient(idx, { ingredientId: e.target.value })
              }
            >
              <option value="">— ingredient —</option>
              {ingredients.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.emoji} {i.name}
                </option>
              ))}
            </select>
            <input
              className="input"
              value={ing.amount}
              placeholder="amount, e.g. 1 tsp"
              onChange={(e) => setIngredient(idx, { amount: e.target.value })}
            />
            <Button variant="danger" onClick={() => removeIngredient(idx)}>
              ✕
            </Button>
          </div>
        ))}
        <Button variant="ghost" onClick={addIngredient}>
          + Add ingredient
        </Button>
      </Field>

      <Field label="Steps" hint="One step per row">
        <GrowableList
          value={form.steps}
          onChange={(v) => set("steps", v)}
          placeholder="e.g. Boil water…"
        />
      </Field>
      <Field label="Benefits" hint="One benefit per row">
        <GrowableList
          value={form.benefits}
          onChange={(v) => set("benefits", v)}
          placeholder="e.g. Soothes throat"
        />
      </Field>
      <Field label="Precautions" hint="One precaution per row">
        <GrowableList
          value={form.precautions}
          onChange={(v) => set("precautions", v)}
          placeholder="e.g. Avoid if pregnant"
        />
      </Field>

      <Checkbox
        checked={form.isPopular}
        onChange={(v) => set("isPopular", v)}
        label="Show in “Popular Remedies”"
      />

      <div className="modal-actions">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={submit} disabled={busy || !form.title}>
          {busy ? "Saving…" : "Save"}
        </Button>
      </div>
    </Modal>
  );
}
