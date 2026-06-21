// API client for the Go backend. Reads stored Basic-Auth credentials for
// mutating requests; reads are public.
import type { AppConfig, Category, Ingredient, Remedy } from "./types";

export const API_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:8080";

const AUTH_KEY = "gkn_auth";

/** Store the Basic-Auth token (base64 of user:pass) after a successful login. */
export function setAuth(username: string, password: string) {
  localStorage.setItem(AUTH_KEY, btoa(`${username}:${password}`));
}
export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}
export function getAuth(): string | null {
  return localStorage.getItem(AUTH_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getAuth();
  return token ? { Authorization: `Basic ${token}` } : {};
}

async function req<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let msg = `${method} ${path} failed (${res.status})`;
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  // Some endpoints return no/!json body.
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

export const api = {
  /** Validate credentials against config/login. Throws on failure. */
  login: (username: string, password: string) =>
    req<{ ok: boolean }>("POST", "/api/login", { username, password }),

  listRemedies: () => req<Remedy[]>("GET", "/api/remedies"),
  saveRemedy: (r: Remedy) =>
    r.id
      ? req<{ id: string }>("PUT", `/api/remedies/${r.id}`, r)
      : req<{ id: string }>("POST", "/api/remedies", r),
  deleteRemedy: (id: string) =>
    req<{ ok: boolean }>("DELETE", `/api/remedies/${id}`),

  listCategories: () => req<Category[]>("GET", "/api/categories"),
  saveCategory: (c: Category) =>
    c.id
      ? req<{ id: string }>("PUT", `/api/categories/${c.id}`, c)
      : req<{ id: string }>("POST", "/api/categories", c),
  deleteCategory: (id: string) =>
    req<{ ok: boolean }>("DELETE", `/api/categories/${id}`),

  listIngredients: () => req<Ingredient[]>("GET", "/api/ingredients"),
  saveIngredient: (i: Ingredient) =>
    i.id
      ? req<{ id: string }>("PUT", `/api/ingredients/${i.id}`, i)
      : req<{ id: string }>("POST", "/api/ingredients", i),
  deleteIngredient: (id: string) =>
    req<{ ok: boolean }>("DELETE", `/api/ingredients/${id}`),

  getConfig: () => req<AppConfig>("GET", "/api/config"),
  saveConfig: (c: AppConfig) => req<{ ok: boolean }>("PUT", "/api/config", c),
};
