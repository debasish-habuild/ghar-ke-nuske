/**
 * Skeleton loaders — animated shimmer placeholders shown while dynamic data
 * loads (or refreshes). They keep each screen's layout shape on screen instead
 * of collapsing it into a spinner, so pull-to-refresh no longer makes content
 * jump / disappear.
 *
 * `Skeleton` is the primitive (one shimmering block). The exported *Skeleton
 * compositions below mirror the real card layouts of each screen so the swap
 * from placeholder → content is seamless.
 *
 * Built on React Native's `Animated` (no Reanimated in this project) + Expo's
 * LinearGradient for the moving highlight band.
 */
import React, { useEffect, useRef, useState } from "react";
import { Animated, View, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Spacing } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";

type SkeletonProps = {
  width?: ViewStyle["width"];
  height?: number;
  radius?: number;
  style?: ViewStyle | ViewStyle[];
};

/** A single shimmering block. Compose these to mimic real content. */
export function Skeleton({
  width = "100%",
  height = 16,
  radius = 8,
  style,
}: SkeletonProps) {
  const { colors, isDark } = useTheme();
  const [w, setW] = useState(0);
  const x = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(x, {
        toValue: 1,
        duration: 1100,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [x]);

  // Highlight band sweeps left→right across the block's measured width.
  const translateX = x.interpolate({
    inputRange: [0, 1],
    outputRange: [-w, w],
  });
  const highlight = isDark ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.7)";

  return (
    <View
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.border,
          overflow: "hidden",
        },
        style as ViewStyle,
      ]}
    >
      {w > 0 && (
        <Animated.View
          style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}
        >
          <LinearGradient
            colors={["transparent", highlight, "transparent"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </View>
  );
}

/* ── Home: horizontal "card" row (Browse By Concern / Popular Remedies) ── */
export function CardRowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View style={rowStyles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={rowStyles.card}>
          <Skeleton width={107} height={107} radius={0} />
          <Skeleton
            width={70}
            height={11}
            radius={4}
            style={{ marginVertical: 10, marginHorizontal: 8 }}
          />
        </View>
      ))}
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingTop: 14,
    gap: 12,
  },
  card: { width: 107, borderRadius: 12, overflow: "hidden" },
});

/* ── Home: "Today's Recipe" accent card ── */
export function RecipeCardSkeleton() {
  return (
    <View style={recipeStyles.card}>
      <View style={recipeStyles.body}>
        <Skeleton width={80} height={9} radius={4} />
        <Skeleton
          width="85%"
          height={18}
          radius={6}
          style={{ marginTop: 10 }}
        />
        <Skeleton width={90} height={11} radius={4} style={{ marginTop: 10 }} />
      </View>
      <Skeleton width={140} height={120} radius={0} />
    </View>
  );
}

const recipeStyles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.lg,
    marginTop: 28,
    borderRadius: 12,
    height: 120,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  body: { flex: 1, padding: Spacing.lg },
});

/* ── Remedies: vertical list of remedy rows ── */
export function RemedyRowsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View style={{ padding: Spacing.lg, gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={listStyles.card}>
          <Skeleton width={64} height={64} radius={12} />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton width="70%" height={14} radius={5} />
            <Skeleton width="90%" height={10} radius={4} />
            <Skeleton width="45%" height={10} radius={4} />
          </View>
        </View>
      ))}
    </View>
  );
}

const listStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
});

/* ── Ingredients: grouped chip rows ── */
export function ChipGroupsSkeleton({ groups = 3 }: { groups?: number }) {
  // Varying widths per chip so the rows don't look mechanically uniform.
  const widths = [78, 64, 92, 70, 84, 60];
  return (
    <View style={{ padding: Spacing.lg }}>
      {Array.from({ length: groups }).map((_, g) => (
        <View key={g} style={{ marginBottom: 24 }}>
          <Skeleton
            width={120}
            height={11}
            radius={4}
            style={{ marginBottom: 14 }}
          />
          <View style={chipStyles.wrap}>
            {widths.map((w, i) => (
              <Skeleton key={i} width={w} height={38} radius={20} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const chipStyles = StyleSheet.create({
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
});
