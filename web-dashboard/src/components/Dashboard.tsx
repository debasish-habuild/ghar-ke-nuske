import { useState } from "react";
import { useAuth } from "../auth";
import { Button } from "./ui";
import RemediesTab from "./RemediesTab";
import CategoriesTab from "./CategoriesTab";
import IngredientsTab from "./IngredientsTab";
import ConfigTab from "./ConfigTab";

type Tab = "remedies" | "conditions" | "ingredients" | "config";

const TABS: { key: Tab; label: string }[] = [
  { key: "remedies", label: "🧪 Remedies" },
  { key: "conditions", label: "🏷️ Conditions" },
  { key: "ingredients", label: "🌿 Ingredients" },
  { key: "config", label: "⚙️ App Settings" },
];

export default function Dashboard() {
  const { logout } = useAuth();
  const [tab, setTab] = useState<Tab>("remedies");

  return (
    <div>
      <div className="topbar">
        <div>
          <h1>🌿 Ghar Ke Nuskhe</h1>
          <div className="sub">Content Dashboard</div>
        </div>
        <Button variant="ghost" onClick={logout}>
          Sign Out
        </Button>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="content">
        {tab === "remedies" && <RemediesTab />}
        {tab === "conditions" && <CategoriesTab />}
        {tab === "ingredients" && <IngredientsTab />}
        {tab === "config" && <ConfigTab />}
      </div>
    </div>
  );
}
