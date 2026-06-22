import { useEffect, useState } from "react";
import { api } from "../api";
import type { AppConfig, Remedy } from "../types";
import { Button, Field, ImageUploadField, LinesInput, TextInput } from "./ui";

export default function ConfigTab() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    Promise.all([api.getConfig(), api.listRemedies()])
      .then(([c, r]) => {
        // Default any newer fields the backend may not yet send so the
        // controlled inputs never go undefined.
        setConfig({
          ...c,
          bannerImageUrl: c.bannerImageUrl ?? "",
          bannerTitle: c.bannerTitle ?? "",
          bannerSubtitle: c.bannerSubtitle ?? "",
        });
        setRemedies(r);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!config) return;
    setBusy(true);
    try {
      await api.saveConfig(config);
      setToast("Saved ✓");
      setTimeout(() => setToast(""), 2000);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="muted">Loading…</p>;
  if (error) return <div className="banner">{error}</div>;
  if (!config) return null;

  return (
    <div>
      <div className="section-head">
        <h2>App Settings</h2>
      </div>

      <Field
        label="Today's Recipe"
        hint="The remedy featured on the app's home screen"
      >
        <select
          className="input"
          value={config.todaysRecipeId}
          onChange={(e) =>
            setConfig({ ...config, todaysRecipeId: e.target.value })
          }
        >
          <option value="">— none —</option>
          {remedies.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="Search Placeholders"
        hint="One phrase per line — these rotate in the app's search box"
      >
        <LinesInput
          value={config.searchPlaceholders}
          onChange={(v) => setConfig({ ...config, searchPlaceholders: v })}
          placeholder={"Search Cold…\nSearch Hair Fall…"}
        />
      </Field>

      <Field
        label="Banner image"
        hint="Background image for the home-screen banner"
      >
        <ImageUploadField
          value={config.bannerImageUrl}
          onChange={(v) => setConfig({ ...config, bannerImageUrl: v })}
          folder="banners"
        />
      </Field>

      <Field
        label="Banner heading"
        hint={'Big text on the banner — use "\\n" for a line break'}
      >
        <TextInput
          value={config.bannerTitle}
          onChange={(v) => setConfig({ ...config, bannerTitle: v })}
          placeholder={"Natural remedies\\nfor everyday health"}
        />
      </Field>

      <Field label="Banner subtitle" hint="Smaller text under the heading">
        <TextInput
          value={config.bannerSubtitle}
          onChange={(v) => setConfig({ ...config, bannerSubtitle: v })}
          placeholder="Trusted home remedies"
        />
      </Field>

      <div className="modal-actions">
        <Button onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save Settings"}
        </Button>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
