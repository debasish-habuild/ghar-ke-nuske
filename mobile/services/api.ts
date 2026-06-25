/**
 * Backend API client.
 *
 * Talks to the Go service (which reads Firestore) instead of bundling data in
 * the app. Types mirror the backend's JSON exactly; the catalog layer adapts
 * them into the UI-friendly shapes the screens consume.
 */
import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Base URL of the backend.
 *
 * Android emulators cannot see the host's `localhost` — the host is exposed at
 * the special alias 10.0.2.2. We also keep `localhost` working via
 * `adb reverse tcp:8080 tcp:8080`. Override with expo `extra.apiUrl` if needed.
 */
const FALLBACK =
  Platform.OS === "android" ? "http://10.0.2.2:8080" : "http://localhost:8080";
export const API_URL: string =
  (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl ??
  FALLBACK;

// ── Backend response types (exact JSON field names) ───────────────────────────

export interface ApiRemedyIngredient {
  ingredientId: string;
  amount: string;
}

export interface ApiRemedy {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  time: string;
  primaryCategoryId: string;
  categoryIds: string[];
  ingredientIds: string[];
  ingredients: ApiRemedyIngredient[];
  steps: string[];
  benefits: string[];
  precautions: string[];
  isPopular: boolean;
}

export interface ApiCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
  iconKey: string;
  imageUrl: string;
  order: number;
  roles: string[];
}

export interface ApiIngredient {
  id: string;
  name: string;
  emoji: string;
  imageUrl?: string;
  group: string;
  order: number;
}

export interface ApiConfig {
  searchPlaceholders: string[];
  todaysRecipeId: string;
  bannerImageUrl: string;
  bannerTitle: string;
  bannerSubtitle: string;
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  remedies: () => getJSON<ApiRemedy[]>("/api/remedies"),
  categories: () => getJSON<ApiCategory[]>("/api/categories"),
  ingredients: () => getJSON<ApiIngredient[]>("/api/ingredients"),
  config: () => getJSON<ApiConfig>("/api/config"),
};
