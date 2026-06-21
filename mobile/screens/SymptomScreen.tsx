import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { Palette, Fonts, Spacing } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { useCatalog } from "../context/CatalogContext";

export default function SymptomScreen() {
  const nav = useNavigation<any>();
  const { categories, loading } = useCatalog();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  // Symptoms are categories tagged with the "symptom" role in Firestore.
  const symptoms = categories.filter((c) => c.roles.includes("symptom"));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const onContinue = () => {
    const ids = [...selected];
    const first = categories.find((c) => c.id === ids[0]);
    nav.navigate("Remedies", {
      category: ids.length === 1 && first ? first.label : "Your Symptoms",
      categoryId: ids[0],
    });
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Feather name="chevron-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={s.headTitle}>What's your problem?</Text>
          <Text style={s.headSub}>Select one or more symptoms</Text>
        </View>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={symptoms}
          numColumns={3}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: Spacing.lg, gap: 10 }}
          columnWrapperStyle={{ gap: 10 }}
          renderItem={({ item }) => {
            const on = selected.has(item.id);
            return (
              <TouchableOpacity
                style={[s.chip, on && s.chipOn, { flex: 1 }]}
                onPress={() => toggle(item.id)}
              >
                <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
                <Text style={[s.chipText, on && s.chipTextOn]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={
            <TouchableOpacity
              style={[s.btn, selected.size === 0 && s.btnDisabled]}
              disabled={selected.size === 0}
              onPress={onContinue}
            >
              <Text style={s.btnText}>Continue</Text>
              <Feather name="arrow-right" size={16} color={colors.white} />
            </TouchableOpacity>
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
      gap: 12,
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
    headTitle: { fontFamily: Fonts.bold, fontSize: 19, color: c.text },
    headSub: { fontFamily: Fonts.regular, fontSize: 12, color: c.text3 },
    chip: {
      alignItems: "center",
      gap: 6,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    chipOn: { borderColor: c.primary, backgroundColor: c.primaryLight },
    chipText: {
      fontFamily: Fonts.medium,
      fontSize: 11,
      color: c.text3,
      textAlign: "center",
    },
    chipTextOn: { color: c.primary, fontFamily: Fonts.semibold },
    btn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 16,
      backgroundColor: c.primary,
      borderRadius: 12,
      padding: 15,
    },
    btnDisabled: { opacity: 0.5 },
    btnText: { fontFamily: Fonts.semibold, fontSize: 15, color: c.white },
  });
