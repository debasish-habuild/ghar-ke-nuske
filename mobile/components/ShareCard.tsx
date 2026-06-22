/**
 * ShareCard — the off-screen view that gets rasterised into the image a user
 * shares from a remedy's detail screen (design "V1 / Frosted Bottom Card").
 *
 * It is NOT meant to be seen in the app: DetailScreen renders it parked far
 * off-screen and captures it with react-native-view-shot. Because the captured
 * PNG is shared to chats/social, the look is fixed to the brand's light style
 * (white frosted card on the photo) regardless of the app's light/dark theme —
 * the share image must look the same for everyone.
 *
 * Laid out at a base 360×450 (4:5); the capture step upscales it to 1080×1350.
 */
import React, { forwardRef, useMemo } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "../constants/theme";
import type { Remedy } from "../context/CatalogContext";

// Fisher–Yates shuffle on a copy (never mutates the source array).
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Fixed brand palette — intentionally not theme-derived (see file header).
const BRAND = {
  teal: "#13665A",
  tealDark: "#0d4e44",
  tealLight: "#e8f5f3",
  orange: "#E65100",
  white: "#FFFFFF",
  ink: "#1A1A1A",
  text: "#292929",
};

export const SHARE_CARD_WIDTH = 360;
export const SHARE_CARD_HEIGHT = 450;

const ShareCard = forwardRef<View, { remedy: Remedy; seed?: number }>(
  ({ remedy, seed = 0 }, ref) => {
    // V1 shows ingredient name chips and one benefit. Both are randomised on
    // every share (seed changes per capture) so the same remedy varies.
    const { benefit, ingredients } = useMemo(() => {
      const pool = remedy.benefits?.length ? remedy.benefits : [remedy.benefit];
      return {
        benefit: pool[Math.floor(Math.random() * pool.length)],
        ingredients: shuffle(remedy.ingredients),
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [remedy.id, seed]);

    return (
      <View ref={ref} style={s.card} collapsable={false}>
        <Image
          source={{ uri: remedy.img }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />

        {/* No scrims — the brand text relies on its own drop-shadow, and the
            bottom info card supplies its own contrast. */}

        {/* Top bar — brand lockup + time pill. */}
        <View style={s.topBar}>
          <View style={s.brand}>
            <Ionicons name="leaf" size={15} color={BRAND.white} />
            <Text style={s.brandText}>Ghar Ke Nuskhe</Text>
          </View>
          <View style={s.timePill}>
            <Text style={s.timeText}>⏱ {remedy.time}</Text>
          </View>
        </View>

        {/* Frosted info card. */}
        <View style={s.glass}>
          <Text style={s.title} numberOfLines={2}>
            {remedy.title}
          </Text>
          <View style={s.chips}>
            {ingredients.map((ing, i) => (
              <View key={i} style={s.chip}>
                <Text style={s.chipText}>{ing.n}</Text>
              </View>
            ))}
          </View>
          <View style={s.benefitRow}>
            <Text style={s.benefitDot}>✦</Text>
            <Text style={s.benefitText} numberOfLines={2}>
              {benefit}
            </Text>
          </View>
        </View>
      </View>
    );
  },
);

ShareCard.displayName = "ShareCard";
export default ShareCard;

const s = StyleSheet.create({
  card: {
    width: SHARE_CARD_WIDTH,
    height: SHARE_CARD_HEIGHT,
    backgroundColor: "#dddddd",
    overflow: "hidden",
  },
  topBar: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 6 },
  brandText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: BRAND.white,
    // Stronger shadow stands in for the removed scrim on bright photos.
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  timePill: {
    backgroundColor: "rgba(0,0,0,0.28)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  timeText: {
    fontFamily: Fonts.semibold,
    fontSize: 12,
    color: BRAND.white,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  glass: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 18,
    padding: 16,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 19,
    color: BRAND.ink,
    marginBottom: 11,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 11 },
  chip: {
    backgroundColor: BRAND.tealLight,
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 999,
  },
  chipText: { fontFamily: Fonts.semibold, fontSize: 12, color: BRAND.tealDark },
  benefitRow: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  benefitDot: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: BRAND.orange,
    marginTop: 1,
  },
  benefitText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: BRAND.text,
    flex: 1,
    lineHeight: 18,
  },
});
