import { useState } from "react";
import { useAuth } from "../auth";
import { Button } from "./ui";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(username.trim(), password);
    } catch {
      setError("Wrong username or password. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="login-logo">🌿</div>
        <h1>Ghar Ke Nuskhe</h1>
        <p>Content Dashboard — please sign in</p>
        {error && <div className="login-error">{error}</div>}
        <div style={{ textAlign: "left" }}>
          <label className="field">
            <span className="field-label">Username</span>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </label>
          <label className="field">
            <span className="field-label">Password</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>
        <Button type="submit" disabled={busy || !username || !password}>
          {busy ? "Signing in…" : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
