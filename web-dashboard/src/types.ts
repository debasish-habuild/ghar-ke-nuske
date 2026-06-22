// Shapes mirror the Go backend's JSON exactly.

export interface RemedyIngredient {
  ingredientId: string;
  amount: string;
}

export interface Remedy {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  time: string;
  primaryCategoryId: string;
  categoryIds: string[];
  ingredientIds: string[];
  ingredients: RemedyIngredient[];
  steps: string[];
  benefits: string[];
  precautions: string[];
  isPopular: boolean;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  iconKey: string;
  order: number;
  roles: string[];
}

export interface Ingredient {
  id: string;
  name: string;
  emoji: string;
  group: string;
  order: number;
}

export interface AppConfig {
  searchPlaceholders: string[];
  todaysRecipeId: string;
  bannerImageUrl: string;
  bannerTitle: string;
  bannerSubtitle: string;
}

export const EMPTY_REMEDY: Remedy = {
  id: "",
  title: "",
  summary: "",
  imageUrl: "",
  time: "",
  primaryCategoryId: "",
  categoryIds: [],
  ingredientIds: [],
  ingredients: [],
  steps: [],
  benefits: [],
  precautions: [],
  isPopular: false,
};

export const EMPTY_CATEGORY: Category = {
  id: "",
  name: "",
  emoji: "",
  color: "#E8F5E9",
  iconKey: "",
  order: 0,
  roles: ["concern"],
};

export const EMPTY_INGREDIENT: Ingredient = {
  id: "",
  name: "",
  emoji: "",
  group: "",
  order: 0,
};
