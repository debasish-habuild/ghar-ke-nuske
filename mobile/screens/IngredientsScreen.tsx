import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { Colors, Fonts } from "../constants/theme";
import { Spacing } from "../constants/theme";
import { useCatalog, Ingredient } from "../context/CatalogContext";

export default function IngredientsScreen() {
  const nav = useNavigation<any>();
  const { ingredients, loading } = useCatalog();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Group ingredients by their `group` field (preserving order).
  const groups = useMemo(() => {
    const map = new Map<string, Ingredient[]>();
    for (const ing of ingredients) {
      const arr = map.get(ing.group) ?? [];
      arr.push(ing);
      map.set(ing.group, arr);
    }
    return [...map.entries()].map(([label, items]) => ({ label, items }));
  }, [ingredients]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const onFind = () => {
    const ids = [...selected];
    nav.navigate("Remedies", {
      category: "Ingredient Match",
      ingredientId: ids[0],
    });
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Feather name="chevron-left" size={20} color={Colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={s.headTitle}>Kitchen Finder</Text>
          <Text style={s.headSub}>Find remedies from what you have</Text>
        </View>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}
        >
          <View style={s.heroCard}>
            <Text style={s.heroEmoji}>🧺</Text>
            <Text style={s.heroTitle}>What's in your kitchen?</Text>
            <Text style={s.heroSub}>
              Select ingredients and we'll find the perfect remedy
            </Text>
          </View>
          {groups.map((group) => (
            <View key={group.label} style={{ marginBottom: 20 }}>
              <Text style={s.groupLabel}>{group.label}</Text>
              <View style={s.chips}>
                {group.items.map((item) => {
                  const on = selected.has(item.id);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[s.chip, on && s.chipOn]}
                      onPress={() => toggle(item.id)}
                    >
                      <Text style={s.chipEmoji}>{item.emoji}</Text>
                      <Text style={[s.chipText, on && s.chipTextOn]}>
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
          {selected.size > 0 && (
            <View style={s.selBar}>
              <Text style={s.selText}>
                {selected.size} ingredient{selected.size !== 1 ? "s" : ""}{" "}
                selected
              </Text>
              <TouchableOpacity onPress={() => setSelected(new Set())}>
                <Text style={s.clearText}>Clear all</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity
            style={[s.findBtn, selected.size === 0 && s.findBtnDisabled]}
            disabled={selected.size === 0}
            onPress={onFind}
          >
            <Text style={s.findBtnText}>Find Remedies</Text>
            <Feather name="arrow-right" size={16} color="#fff" />
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: Spacing.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  headTitle: { fontFamily: Fonts.bold, fontSize: 19, color: Colors.text },
  headSub: { fontFamily: Fonts.regular, fontSize: 12, color: Colors.text3 },
  heroCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  heroEmoji: { fontSize: 48, marginBottom: 10 },
  heroTitle: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    color: Colors.text,
    marginBottom: 6,
    textAlign: "center",
  },
  heroSub: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.text3,
    textAlign: "center",
    lineHeight: 18,
  },
  groupLabel: {
    fontFamily: Fonts.semibold,
    fontSize: 11,
    color: Colors.text3,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: "#fff",
  },
  chipOn: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  chipEmoji: { fontSize: 17 },
  chipText: { fontFamily: Fonts.medium, fontSize: 12, color: Colors.text3 },
  chipTextOn: { color: Colors.primary, fontFamily: Fonts.semibold },
  selBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    marginBottom: 16,
  },
  selText: { fontFamily: Fonts.medium, fontSize: 13, color: Colors.primary },
  clearText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.text3,
    textDecorationLine: "underline",
  },
  findBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 15,
  },
  findBtnDisabled: { opacity: 0.5 },
  findBtnText: { fontFamily: Fonts.semibold, fontSize: 15, color: "#fff" },
});
