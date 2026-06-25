/**
 * ExpandIn — an "expanding card" entrance animation.
 *
 * Wrap a screen's content in this and, on mount, it scales up from 0.9 → 1
 * while fading in (ease-out). Paired with the destination screen's native
 * `animation: "fade"` crossfade (see App.tsx), tapping a card reads as that
 * card opening/expanding into the full screen — the modern "container
 * transform" feel, replacing the dated slide-from-side push.
 *
 * Uses the built-in Animated API on the native driver (this project has no
 * Reanimated, and `sharedTransitionTag` is unavailable on the New Arch).
 */
import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, ViewStyle } from "react-native";

export default function ExpandIn({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const v = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(v, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [v]);

  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });

  return (
    <Animated.View
      style={[styles.fill, { opacity: v, transform: [{ scale }] }, style]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
