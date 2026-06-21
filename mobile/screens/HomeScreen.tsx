import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../App";
import { Fonts, Spacing, Radius, Palette } from "../constants/theme";
import { CATEGORY_ICONS } from "../constants/categoryIcons";
import { useCatalog } from "../context/CatalogContext";
import { useTheme } from "../context/ThemeContext";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const nav = useNavigation<Nav>();
  const {
    categories,
    remedies,
    searchPlaceholders,
    todaysRecipeId,
    getRemedy,
    loading,
    error,
  } = useCatalog();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [placeholder, setPlaceholder] = useState("");
  const phIdx = useRef(0);
  const phChar = useRef(0);
  const deleting = useRef(false);

  // Animated placeholder typewriter (backend-provided phrases)
  useEffect(() => {
    if (!searchPlaceholders.length) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const word =
        searchPlaceholders[phIdx.current % searchPlaceholders.length];
      if (!deleting.current) {
        phChar.current++;
        setPlaceholder(word.substring(0, phChar.current));
        if (phChar.current === word.length) {
          deleting.current = true;
          timer = setTimeout(tick, 1600);
        } else timer = setTimeout(tick, 80);
      } else {
        phChar.current--;
        setPlaceholder(word.substring(0, phChar.current));
        if (phChar.current === 0) {
          deleting.current = false;
          phIdx.current = (phIdx.current + 1) % searchPlaceholders.length;
          timer = setTimeout(tick, 300);
        } else timer = setTimeout(tick, 40);
      }
    };
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, [searchPlaceholders]);

  const popular = remedies.filter((r) => r.isPopular);
  const popularList = popular.length > 0 ? popular : remedies;
  const todays = todaysRecipeId ? getRemedy(todaysRecipeId) : undefined;
  // "Browse By Concern" shows only concern-role categories (image + color);
  // symptom-role categories live in the Symptom picker instead.
  const concerns = categories.filter((c) => c.roles.includes("concern"));

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Hero ── */}
        <View style={s.hero}>
          <Image
            source={require("../assets/hero.png")}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
            resizeMode="stretch"
          />
          <LinearGradient
            colors={[
              "rgba(13,59,32,0.95)",
              "rgba(13,59,32,0.4)",
              "transparent",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={s.heroTopbar}>
            <TouchableOpacity
              onPress={() => nav.navigate("Saved")}
              style={s.heroIcon}
            >
              <Feather name="heart" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => nav.navigate("Profile")}
              style={s.heroIcon}
            >
              <Feather name="user" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={s.heroBody}>
            <Text style={s.heroTitle}>Ghar Ke{"\n"}Nuskhe</Text>
            <Text style={s.heroSub}>Herbal Remedies</Text>
          </View>
        </View>

        {/* ── Search Bar ── */}
        <View style={s.searchWrap}>
          <TouchableOpacity
            style={s.searchBar}
            onPress={() => nav.navigate("Search")}
            activeOpacity={0.8}
          >
            <Feather name="search" size={16} color={colors.text3} />
            <Text style={s.searchPlaceholder}>
              {placeholder || "Search Cold…"}
            </Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={s.errorBox}>
            <Text style={s.errorText}>
              Couldn't reach the server. Pull data once it's running.
            </Text>
          </View>
        )}

        {/* ── Browse by Concern ── */}
        <View style={s.secHead}>
          <Text style={s.secTitle}>Browse By Concern</Text>
          <Text style={s.secSub}>Herbal Remedies to ease out problems</Text>
        </View>
        {loading ? (
          <ActivityIndicator
            style={{ marginVertical: 24 }}
            color={colors.primary}
          />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[s.hScroll, { paddingBottom: 10 }]}
          >
            {concerns.map((cat) => {
              const icon = CATEGORY_ICONS[cat.iconKey];
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={s.catCard}
                  onPress={() =>
                    nav.navigate("Remedies", {
                      category: cat.label,
                      categoryId: cat.id,
                    })
                  }
                  activeOpacity={0.85}
                >
                  {icon ? (
                    <Image
                      source={icon}
                      style={s.catPhoto}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[
                        s.catEmojiWrap,
                        { backgroundColor: cat.color || colors.primaryLight },
                      ]}
                    >
                      <Text style={s.catEmoji}>{cat.emoji || "🌿"}</Text>
                    </View>
                  )}
                  <Text style={s.catLabel} numberOfLines={1}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* ── Today's Recipe ── */}
        {todays && (
          <TouchableOpacity
            style={s.recipeCard}
            onPress={() => nav.navigate("Detail", { id: todays.id })}
            activeOpacity={0.9}
          >
            <View style={s.recipeBody}>
              <Text style={s.recipeLabel}>TODAY'S RECIPE</Text>
              <Text style={s.recipeTitle} numberOfLines={2}>
                {todays.title}
              </Text>
              <Text style={s.recipeLink}>Know More ›</Text>
            </View>
            <Image
              source={{ uri: todays.img }}
              style={s.recipeImg}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}

        {/* ── Kitchen Finder CTA ── */}
        <TouchableOpacity
          style={s.kfBtn}
          onPress={() => nav.navigate("Ingredients")}
          activeOpacity={0.9}
        >
          <Text style={s.kfText}>Kitchen Finder</Text>
          <View style={s.kfIcon}>
            <Feather name="arrow-right" size={18} color="#fff" />
          </View>
        </TouchableOpacity>

        {/* ── Popular Remedies ── */}
        <View style={s.secHead}>
          <Text style={s.secTitle}>Popular Remedies</Text>
          <Text style={s.secSub}>Trusted by thousands</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[s.hScroll, { paddingBottom: 24 }]}
        >
          {popularList.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={s.catCard}
              onPress={() => nav.navigate("Detail", { id: r.id })}
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: r.img }}
                style={s.catPhoto}
                resizeMode="cover"
              />
              <Text style={s.catLabel} numberOfLines={1}>
                {r.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: { flex: 1 },
    hero: { height: 225, justifyContent: "flex-end", overflow: "hidden" },
    heroTopbar: {
      position: "absolute",
      top: 12,
      right: 12,
      flexDirection: "row",
      gap: 10,
      zIndex: 10,
    },
    heroIcon: {
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
    },
    heroBody: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
    heroTitle: {
      fontFamily: Fonts.bold,
      fontSize: 36,
      color: "#fff",
      lineHeight: 42,
    },
    heroSub: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: "rgba(255,255,255,0.82)",
      marginTop: 2,
    },
    searchWrap: { padding: Spacing.lg, paddingBottom: 0 },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: c.card,
      borderRadius: 40,
      paddingHorizontal: Spacing.lg,
      height: 48,
      borderWidth: 1,
      borderColor: c.border,
    },
    searchPlaceholder: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: c.text3,
      flex: 1,
    },
    errorBox: {
      marginHorizontal: Spacing.lg,
      marginTop: 12,
      padding: 10,
      borderRadius: 10,
      backgroundColor: c.orangeLight,
    },
    errorText: {
      fontFamily: Fonts.regular,
      fontSize: 11,
      color: c.orange,
    },
    secHead: { paddingHorizontal: Spacing.lg, paddingTop: 20 },
    secTitle: { fontFamily: Fonts.bold, fontSize: 17, color: c.text },
    secSub: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: c.text3,
      marginTop: 3,
    },
    hScroll: { paddingHorizontal: Spacing.lg, paddingTop: 14, gap: 12 },
    catCard: {
      width: 107,
      borderRadius: Radius.md,
      overflow: "hidden",
      backgroundColor: c.card,
      shadowColor: c.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    catEmojiWrap: {
      width: 107,
      height: 107,
      backgroundColor: c.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },
    catEmoji: { fontSize: 48 },
    catPhoto: { width: 107, height: 107, backgroundColor: c.primaryLight },
    catLabel: {
      fontFamily: Fonts.semibold,
      fontSize: 12,
      color: c.text,
      textAlign: "center",
      padding: 8,
    },
    recipeCard: {
      margin: Spacing.lg,
      borderRadius: Radius.md,
      backgroundColor: c.bgCard,
      flexDirection: "row",
      alignItems: "center",
      height: 120,
      overflow: "hidden",
      marginTop: 28,
    },
    recipeBody: { flex: 1, padding: Spacing.lg },
    recipeLabel: {
      fontFamily: Fonts.semibold,
      fontSize: 10,
      color: c.primary,
      letterSpacing: 1,
      marginBottom: 4,
    },
    recipeTitle: {
      fontFamily: Fonts.bold,
      fontSize: 20,
      color: c.primary,
      lineHeight: 26,
      marginBottom: 8,
    },
    recipeLink: {
      fontFamily: Fonts.semibold,
      fontSize: 12,
      color: c.primary,
      textDecorationLine: "underline",
    },
    recipeImg: {
      width: 140,
      height: 120,
      backgroundColor: c.primaryLight,
    },
    kfBtn: {
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.md,
      marginBottom: Spacing.xl,
      borderRadius: Radius.md,
      backgroundColor: c.primary,
      height: 56,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Spacing.xl,
    },
    kfText: { fontFamily: Fonts.bold, fontSize: 16, color: "#fff" },
    kfIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
    },
  });
