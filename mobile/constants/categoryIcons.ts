import { ImageSourcePropType } from "react-native";

/**
 * Maps a category's `iconKey` (stored in Firestore) to a bundled image asset.
 *
 * The bundled category PNGs were removed — "concern" categories now ship their
 * artwork via the backend (`cat.imageUrl`). This map is kept as the resolution
 * point for any future bundled keys; an unknown key returns `undefined`, and
 * callers fall back to the category's emoji/colour tile.
 */
export const CATEGORY_ICONS: Record<string, ImageSourcePropType> = {};
