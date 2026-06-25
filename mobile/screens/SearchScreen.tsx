import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SectionList,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { RootStackParamList } from "../App";
import { Palette, Fonts, Spacing } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import {
  useCatalog,
  Category,
  Ingredient,
  Remedy,
} from "../context/CatalogContext";
import { useRecentSearches } from "../hooks/useRecentSearches";
import { useTypewriterPlaceholder } from "../hooks/useTypewriterPlaceholder";

type Nav = NativeStackNavigationProp<RootStackParamList>;

type SearchSection = {
  key: "conditions" | "ingredients" | "remedies";
  title: string;
  kind: "condition" | "ingredient" | "remedy";
  data: (Category | Ingredient | Remedy)[];
};

export default function SearchScreen() {
  const nav = useNavigation<Nav>();
  const { categories, ingredients, remedies, searchPlaceholders } =
    useCatalog();
  const { recents, addRecent, removeRecent, clearRecents } =
    useRecentSearches();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const [query, setQuery] = useState("");
  const inputRef = useRef<TextInput>(null);
  const placeholder = useTypewriterPlaceholder(
    searchPlaceholders,
    "Search remedies...",
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const q = query.trim().toLowerCase();

  // Three result groups. Empty groups are sorted to the bottom so populated
  // categories are surfaced first.
  const sections = useMemo<SearchSection[]>(() => {
    if (!q) return [];
    const conditions = categories.filter((c) =>
      c.label.toLowerCase().includes(q),
    );
    const ings = ingredients.filter((i) => i.name.toLowerCase().includes(q));
    const rems = remedies.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.benefit.toLowerCase().includes(q),
    );
    const groups: SearchSection[] = [
      {
        key: "conditions",
        title: "Conditions",
        kind: "condition",
        data: conditions,
      },
      {
        key: "ingredients",
        title: "Ingredients",
        kind: "ingredient",
        data: ings,
      },
      { key: "remedies", title: "Remedies", kind: "remedy", data: rems },
    ];
    // Stable sort: groups WITH results first, empty ones demoted to the bottom.
    return groups
      .map((g, i) => ({ g, i }))
      .sort((a, b) => {
        const diff =
          (b.g.data.length > 0 ? 1 : 0) - (a.g.data.length > 0 ? 1 : 0);
        return diff !== 0 ? diff : a.i - b.i;
      })
      .map(({ g }) => g);
  }, [q, categories, ingredients, remedies]);

  const totalResults = sections.reduce((sum, s) => sum + s.data.length, 0);

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Feather name="chevron-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <View style={s.searchBar}>
          <Feather name="search" size={16} color={colors.text3} />
          <TextInput
            ref={inputRef}
            style={s.input}
            placeholder={placeholder}
            placeholderTextColor={colors.text3}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={() => addRecent(query)}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Feather name="x" size={16} color={colors.text3} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {q === "" ? (
        <View style={{ padding: Spacing.lg }}>
          <View style={s.recentHead}>
            <Text style={s.groupLabel}>Recent Searches</Text>
            {recents.length > 0 && (
              <TouchableOpacity onPress={clearRecents}>
                <Text style={s.clearAll}>Clear all</Text>
              </TouchableOpacity>
            )}
          </View>
          {recents.length === 0 ? (
            <Text style={s.recentEmpty}>
              Your recent searches will appear here.
            </Text>
          ) : (
            <View style={s.chips}>
              {recents.map((term) => (
                <View key={term} style={s.recentChip}>
                  <TouchableOpacity onPress={() => setQuery(term)}>
                    <Text style={s.chipText}>🕐 {term}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeRecent(term)}
                    hitSlop={8}
                  >
                    <Feather name="x" size={13} color={colors.text3} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        <SectionList
          sections={sections as never}
          keyExtractor={(item: Category | Ingredient | Remedy, idx) =>
            item.id + idx
          }
          contentContainerStyle={{ padding: Spacing.lg }}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            <Text style={s.resultsLabel}>
              {totalResults} result{totalResults !== 1 ? "s" : ""} for "{query}"
            </Text>
          }
          renderSectionHeader={({ section }) => {
            const sec = section as unknown as SearchSection;
            return (
              <View style={s.secHeaderRow}>
                <Text style={s.secHeader}>{sec.title}</Text>
                <Text style={s.secCount}>{sec.data.length}</Text>
              </View>
            );
          }}
          renderSectionFooter={({ section }) => {
            const sec = section as unknown as SearchSection;
            return sec.data.length === 0 ? (
              <Text style={s.secEmpty}>
                No matching {sec.title.toLowerCase()}
              </Text>
            ) : null;
          }}
          renderItem={({ item, section }) => {
            const kind = (section as unknown as SearchSection).kind;
            if (kind === "remedy") {
              const r = item as Remedy;
              return (
                <TouchableOpacity
                  style={s.card}
                  onPress={() => {
                    addRecent(query);
                    nav.navigate("Detail", { id: r.id });
                  }}
                  activeOpacity={0.85}
                >
                  <Image source={{ uri: r.img }} style={s.cardImg} />
                  <View style={s.cardBody}>
                    <Text style={s.cardTitle}>{r.title}</Text>
                    <Text style={s.cardSub} numberOfLines={1}>
                      {r.benefit}
                    </Text>
                    <View style={s.cardMeta}>
                      <Text style={s.metaText}>⏱ {r.time}</Text>
                      <Text style={s.metaText}>🌿 {r.ing_n} ingredients</Text>
                    </View>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={16}
                    color={colors.text3}
                  />
                </TouchableOpacity>
              );
            }
            // condition or ingredient → a tappable row that opens a filtered list
            const isCondition = kind === "condition";
            const entity = item as Category | Ingredient;
            const label = isCondition
              ? (entity as Category).label
              : (entity as Ingredient).name;
            const ingredientImageUrl = isCondition
              ? ""
              : (entity as Ingredient).imageUrl;
            return (
              <TouchableOpacity
                style={s.row}
                activeOpacity={0.85}
                onPress={() => {
                  addRecent(query);
                  nav.navigate(
                    "Remedies",
                    isCondition
                      ? { category: label, categoryId: entity.id }
                      : { category: label, ingredientId: entity.id },
                  );
                }}
              >
                {ingredientImageUrl ? (
                  <Image
                    source={{ uri: ingredientImageUrl }}
                    style={s.rowIcon}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={s.rowEmoji}>{entity.emoji}</Text>
                )}
                <Text style={s.rowLabel}>{label}</Text>
                <Feather name="chevron-right" size={16} color={colors.text3} />
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyIcon}>🔍</Text>
              <Text style={s.emptyTitle}>No results found</Text>
              <Text style={s.emptySub}>Try a different keyword</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: Spacing.lg,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: c.backBtn,
      alignItems: "center",
      justifyContent: "center",
    },
    searchBar: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: c.card,
      borderRadius: 40,
      paddingHorizontal: Spacing.md,
      height: 48,
      borderWidth: 1,
      borderColor: c.primary,
    },
    input: {
      flex: 1,
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: c.text,
    },
    groupLabel: {
      fontFamily: Fonts.semibold,
      fontSize: 11,
      color: c.text3,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 10,
    },
    recentHead: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    clearAll: {
      fontFamily: Fonts.medium,
      fontSize: 11,
      color: c.primary,
      marginBottom: 10,
    },
    recentEmpty: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: c.text3,
      marginTop: 4,
    },
    recentChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 7,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
      paddingVertical: 7,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    chipText: { fontFamily: Fonts.medium, fontSize: 12, color: c.text3 },
    resultsLabel: {
      fontFamily: Fonts.semibold,
      fontSize: 11,
      color: c.text3,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 12,
    },
    secHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 16,
      marginBottom: 8,
    },
    secHeader: { fontFamily: Fonts.bold, fontSize: 14, color: c.text },
    secCount: {
      fontFamily: Fonts.semibold,
      fontSize: 11,
      color: c.primary,
      backgroundColor: c.primaryLight,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 2,
      overflow: "hidden",
    },
    secEmpty: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: c.text3,
      fontStyle: "italic",
      paddingVertical: 4,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: c.card,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    rowEmoji: { fontSize: 20 },
    rowIcon: {
      width: 24,
      height: 24,
      borderRadius: 6,
      backgroundColor: c.subtle,
    },
    rowLabel: {
      flex: 1,
      fontFamily: Fonts.semibold,
      fontSize: 13,
      color: c.text,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: c.card,
      borderRadius: 14,
      padding: 14,
      marginBottom: 12,
      shadowColor: c.shadow,
      shadowOpacity: 0.07,
      shadowRadius: 8,
      elevation: 2,
    },
    cardImg: {
      width: 64,
      height: 64,
      borderRadius: 12,
      backgroundColor: c.primaryLight,
    },
    cardBody: { flex: 1 },
    cardTitle: {
      fontFamily: Fonts.semibold,
      fontSize: 14,
      color: c.text,
      marginBottom: 3,
    },
    cardSub: {
      fontFamily: Fonts.regular,
      fontSize: 11,
      color: c.text3,
      marginBottom: 6,
    },
    cardMeta: { flexDirection: "row", gap: 10 },
    metaText: { fontFamily: Fonts.regular, fontSize: 10, color: c.text3 },
    empty: { alignItems: "center", paddingTop: 40 },
    emptyIcon: { fontSize: 40, marginBottom: 12 },
    emptyTitle: { fontFamily: Fonts.semibold, fontSize: 15, color: c.text },
    emptySub: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: c.text3,
      marginTop: 6,
    },
  });
