import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../App";
import { Fonts, Spacing, Palette } from "../constants/theme";
import { useCatalog } from "../context/CatalogContext";
import { useSaved } from "../context/SavedContext";
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "../context/ThemeContext";

type Route = RouteProp<RootStackParamList, "Detail">;

export default function DetailScreen() {
  const nav = useNavigation();
  const route = useRoute<Route>();
  const { toggleSave, isSaved } = useSaved();
  const { getRemedy } = useCatalog();
  const { markUsed } = useProfile();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const remedy = getRemedy(route.params.id);

  // Opening a remedy's detail counts it toward the local "Used" stat (deduped).
  useEffect(() => {
    if (remedy) markUsed(remedy.id);
  }, [remedy?.id]);

  if (!remedy) return null;
  const saved = isSaved(remedy.id);

  const handleShare = async () => {
    await Share.share({
      message: `Check out this remedy: ${remedy.title} — ${remedy.benefit}`,
    });
  };

  return (
    <SafeAreaView style={s.safe} edges={["top", "bottom"]}>
      {/* Whole screen scrolls as one (like HomeScreen) — the hero scrolls away
          with the content. The black scroll background shows through the body
          sheet's rounded-corner cutouts. */}
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Image — sits below the status bar (top safe-area inset) so the
          back/save buttons no longer collide with the notification bar. */}
        <View style={s.hero}>
          <Image
            source={{ uri: remedy.img }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <View style={s.heroOverlay} />
          <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
            {/* Fixed dark glyph: this button floats on the photo in both themes. */}
            <Feather name="chevron-left" size={18} color="#292929" />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.saveBtn}
            onPress={() => toggleSave(remedy.id)}
          >
            <Ionicons
              name={saved ? "heart" : "heart-outline"}
              size={18}
              color={colors.red}
            />
          </TouchableOpacity>
        </View>

        {/* Body sheet — a plain View now; the outer ScrollView does the scrolling */}
        <View style={s.body}>
          <Text style={s.title}>{remedy.title}</Text>
          <View style={s.badges}>
            <View style={s.badgeG}>
              <Text style={s.badgeGText}>⏱ {remedy.time}</Text>
            </View>
            <View style={s.badgeG}>
              <Text style={s.badgeGText}>🌿 {remedy.ing_n} ingredients</Text>
            </View>
            <View style={s.badgeO}>
              <Text style={s.badgeOText}>📁 {remedy.cat}</Text>
            </View>
          </View>

          <Section title="Ingredients">
            {remedy.ingredients.map((ing, i) => (
              <View key={i} style={s.ingRow}>
                <View style={s.ingDot} />
                <Text style={s.ingName}>{ing.n}</Text>
                <Text style={s.ingAmt}>{ing.a}</Text>
              </View>
            ))}
          </Section>

          <Section title="Steps">
            {remedy.steps.map((step, i) => (
              <View key={i} style={s.stepRow}>
                <View style={s.stepNum}>
                  <Text style={s.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={s.stepText}>{step}</Text>
              </View>
            ))}
          </Section>

          <Section title="Benefits">
            {remedy.benefits.map((b, i) => (
              <View key={i} style={s.benRow}>
                <Text style={s.benCheck}>✓</Text>
                <Text style={s.benText}>{b}</Text>
              </View>
            ))}
          </Section>

          <Section title="Precautions">
            {remedy.precautions.map((p, i) => (
              <View key={i} style={s.precRow}>
                <Text style={s.precIcon}>⚠️</Text>
                <Text style={s.precText}>{p}</Text>
              </View>
            ))}
          </Section>
          <View style={{ height: 24 }} />
        </View>
      </ScrollView>

      {/* Actions — saving lives on the heart button in the hero, so the only
          action down here is Share. */}
      <View style={s.actions}>
        <TouchableOpacity style={s.actShare} onPress={handleShare}>
          <Feather name="share-2" size={16} color={colors.white} />
          <Text style={s.actShareText}>Share</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={s.sec}>
      <View style={s.secTitleRow}>
        <View style={s.secBar} />
        <Text style={s.secTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
};

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    // Black backdrop revealed through the body sheet's rounded-corner cutouts.
    scroll: { flex: 1, backgroundColor: "#000" },
    hero: { height: 200, position: "relative" },
    heroOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.2)",
    },
    backBtn: {
      position: "absolute",
      top: 12,
      left: 12,
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: "rgba(255,255,255,0.85)",
      alignItems: "center",
      justifyContent: "center",
    },
    saveBtn: {
      position: "absolute",
      top: 12,
      right: 12,
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: "rgba(255,255,255,0.85)",
      alignItems: "center",
      justifyContent: "center",
    },
    body: {
      padding: Spacing.lg,
      // Curve the white body up over the hero photo (matches Home's sheet).
      backgroundColor: c.bg,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      marginTop: -14,
      paddingTop: Spacing.xl,
    },
    title: {
      fontFamily: Fonts.bold,
      fontSize: 22,
      color: c.text,
      marginBottom: 8,
    },
    badges: {
      flexDirection: "row",
      gap: 8,
      flexWrap: "wrap",
      marginBottom: 18,
    },
    badgeG: {
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 20,
      backgroundColor: c.primaryLight,
    },
    badgeGText: { fontFamily: Fonts.medium, fontSize: 11, color: c.primary },
    badgeO: {
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 20,
      backgroundColor: c.orangeLight,
    },
    badgeOText: { fontFamily: Fonts.medium, fontSize: 11, color: c.orange },
    sec: { marginBottom: 18 },
    secTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },
    secBar: {
      width: 3,
      height: 14,
      borderRadius: 2,
      backgroundColor: c.primary,
    },
    secTitle: { fontFamily: Fonts.bold, fontSize: 14, color: c.text },
    ingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 10,
      backgroundColor: c.subtle,
      borderRadius: 10,
      marginBottom: 6,
    },
    ingDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: c.primary,
    },
    ingName: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: c.text,
      flex: 1,
    },
    ingAmt: { fontFamily: Fonts.medium, fontSize: 11, color: c.text3 },
    stepRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
    stepNum: {
      width: 24,
      height: 24,
      borderRadius: 8,
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
    },
    stepNumText: { fontFamily: Fonts.bold, fontSize: 11, color: c.white },
    stepText: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: c.text,
      lineHeight: 20,
      flex: 1,
    },
    benRow: {
      flexDirection: "row",
      gap: 8,
      padding: 10,
      backgroundColor: c.primaryLight,
      borderRadius: 10,
      marginBottom: 6,
    },
    benCheck: { color: c.primary, fontSize: 14, marginTop: 1 },
    benText: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: c.text,
      lineHeight: 18,
      flex: 1,
    },
    precRow: {
      flexDirection: "row",
      gap: 8,
      padding: 10,
      backgroundColor: c.orangeLight,
      borderRadius: 10,
      marginBottom: 6,
    },
    precIcon: { fontSize: 14, marginTop: 1 },
    precText: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: c.text,
      lineHeight: 18,
      flex: 1,
    },
    actions: {
      flexDirection: "row",
      gap: 10,
      padding: Spacing.lg,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: c.divider,
    },
    actShare: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: 14,
      borderRadius: 14,
      backgroundColor: c.primary,
    },
    actShareText: { fontFamily: Fonts.semibold, fontSize: 14, color: c.white },
  });
