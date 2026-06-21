/**
 * CatalogContext — the app's single source of content, fetched from the backend.
 *
 * Replaces the old hardcoded data/remedies.ts. It fetches remedies, categories,
 * ingredients and config from the Go API once, resolves the normalized
 * ID references (ingredientId / categoryId) into display names, and exposes
 * UI-friendly shapes plus loading/error state so screens stay simple.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, ApiCategory, ApiIngredient, ApiRemedy } from "../services/api";

// ── UI-facing shapes (what screens consume) ──────────────────────────────────

export interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  group: string;
  order: number;
}

export interface Category {
  id: string;
  label: string;
  emoji: string;
  color: string;
  iconKey: string;
  order: number;
  roles: string[];
}

export interface Remedy {
  id: string;
  title: string;
  img: string;
  cat: string; // primary category label (resolved)
  categoryIds: string[];
  ingredientIds: string[];
  time: string;
  ing_n: number;
  benefit: string;
  ingredients: { n: string; a: string }[];
  steps: string[];
  benefits: string[];
  precautions: string[];
  isPopular: boolean;
}

interface CatalogData {
  remedies: Remedy[];
  categories: Category[];
  ingredients: Ingredient[];
  searchPlaceholders: string[];
  todaysRecipeId: string;
  loading: boolean;
  error: string | null;
  reload: () => void;
  getRemedy: (id: string) => Remedy | undefined;
  remediesByCategory: (catIdOrLabel: string) => Remedy[];
  remediesByIngredient: (ingredientId: string) => Remedy[];
}

const DEFAULT_PLACEHOLDERS = ["Search remedies…"];

const CatalogContext = createContext<CatalogData>({
  remedies: [],
  categories: [],
  ingredients: [],
  searchPlaceholders: DEFAULT_PLACEHOLDERS,
  todaysRecipeId: "",
  loading: true,
  error: null,
  reload: () => {},
  getRemedy: () => undefined,
  remediesByCategory: () => [],
  remediesByIngredient: () => [],
});

// ── Adapters: backend shape -> UI shape ──────────────────────────────────────

function adaptCategory(c: ApiCategory): Category {
  return {
    id: c.id,
    label: c.name,
    emoji: c.emoji,
    color: c.color,
    iconKey: c.iconKey,
    order: c.order,
    roles: c.roles ?? [],
  };
}

function adaptIngredient(i: ApiIngredient): Ingredient {
  return {
    id: i.id,
    name: i.name,
    emoji: i.emoji,
    group: i.group,
    order: i.order,
  };
}

function adaptRemedy(
  r: ApiRemedy,
  ingredientNames: Map<string, string>,
  categoryLabels: Map<string, string>,
): Remedy {
  return {
    id: r.id,
    title: r.title,
    img: r.imageUrl,
    cat: categoryLabels.get(r.primaryCategoryId) ?? r.primaryCategoryId,
    categoryIds: r.categoryIds ?? [],
    ingredientIds: r.ingredientIds ?? [],
    time: r.time,
    ing_n: r.ingredients?.length ?? 0,
    benefit: r.summary,
    ingredients: (r.ingredients ?? []).map((ing) => ({
      n: ingredientNames.get(ing.ingredientId) ?? ing.ingredientId,
      a: ing.amount,
    })),
    steps: r.steps ?? [],
    benefits: r.benefits ?? [],
    precautions: r.precautions ?? [],
    isPopular: r.isPopular,
  };
}

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [remedies, setRemedies] = useState<Remedy[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [searchPlaceholders, setSearchPlaceholders] =
    useState<string[]>(DEFAULT_PLACEHOLDERS);
  const [todaysRecipeId, setTodaysRecipeId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [apiRemedies, apiCategories, apiIngredients, config] =
        await Promise.all([
          api.remedies(),
          api.categories(),
          api.ingredients(),
          api.config(),
        ]);

      const ingredientNames = new Map(
        apiIngredients.map((i) => [i.id, i.name]),
      );
      const categoryLabels = new Map(apiCategories.map((c) => [c.id, c.name]));

      setIngredients(
        apiIngredients.map(adaptIngredient).sort((a, b) => a.order - b.order),
      );
      setCategories(
        apiCategories.map(adaptCategory).sort((a, b) => a.order - b.order),
      );
      setRemedies(
        apiRemedies.map((r) => adaptRemedy(r, ingredientNames, categoryLabels)),
      );
      setSearchPlaceholders(
        config.searchPlaceholders?.length
          ? config.searchPlaceholders
          : DEFAULT_PLACEHOLDERS,
      );
      setTodaysRecipeId(config.todaysRecipeId ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load catalog");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo<CatalogData>(() => {
    const byId = new Map(remedies.map((r) => [r.id, r]));
    return {
      remedies,
      categories,
      ingredients,
      searchPlaceholders,
      todaysRecipeId,
      loading,
      error,
      reload: load,
      getRemedy: (id) => byId.get(id),
      remediesByCategory: (catIdOrLabel) => {
        const needle = catIdOrLabel.toLowerCase();
        return remedies.filter(
          (r) =>
            r.categoryIds.some((id) => id.toLowerCase() === needle) ||
            r.cat.toLowerCase() === needle,
        );
      },
      remediesByIngredient: (ingredientId) =>
        remedies.filter((r) => r.ingredientIds.includes(ingredientId)),
    };
  }, [
    remedies,
    categories,
    ingredients,
    searchPlaceholders,
    todaysRecipeId,
    loading,
    error,
    load,
  ]);

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
};

export const useCatalog = () => useContext(CatalogContext);
