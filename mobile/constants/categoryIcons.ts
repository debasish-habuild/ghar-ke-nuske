import { ImageSourcePropType } from "react-native";

/**
 * Maps a category's `iconKey` (stored in Firestore) to a bundled image asset.
 *
 * App icons must ship inside the binary, so the database stores a stable key
 * and the app resolves it here. "concern" categories use these; "symptom"
 * categories use an emoji instead.
 */
export const CATEGORY_ICONS: Record<string, ImageSourcePropType> = {
  cold: require("../assets/categories/cold.png"),
  digestion: require("../assets/categories/digestion.png"),
  hair: require("../assets/categories/hair.png"),
  skincare: require("../assets/categories/skincare.png"),
};
