import { useEffect, useState } from "react";
import { api } from "../api";
import type { AppConfig, Remedy } from "../types";
import { Button, Field, LinesInput } from "./ui";

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
        setConfig(c);
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

      <div className="modal-actions">
        <Button onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save Settings"}
        </Button>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
