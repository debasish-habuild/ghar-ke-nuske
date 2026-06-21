import React, { useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { Palette, Fonts, Spacing } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";
import { useCatalog } from "../context/CatalogContext";
import { useSaved } from "../context/SavedContext";

export default function SavedScreen() {
  const nav = useNavigation<any>();
  const { saved, toggleSave } = useSaved();
  const { remedies } = useCatalog();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const data = remedies.filter((r) => saved.has(r.id));

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Feather name="chevron-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={s.headTitle}>Saved Remedies</Text>
          <Text style={s.headSub}>{data.length} remedies saved</Text>
        </View>
      </View>
      {data.length === 0 ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>💚</Text>
          <Text style={s.emptyTitle}>Nothing saved yet</Text>
          <Text style={s.emptySub}>
            Tap the heart on any remedy to save it here
          </Text>
          <TouchableOpacity
            style={s.exploreBtn}
            onPress={() => nav.navigate("Home")}
          >
            <Text style={s.exploreBtnText}>Explore Remedies</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: Spacing.lg, gap: 12 }}
          renderItem={({ item }) => (
            <View style={s.card}>
              <TouchableOpacity
                onPress={() => nav.navigate("Detail", { id: item.id })}
              >
                <Image source={{ uri: item.img }} style={s.cardImg} />
              </TouchableOpacity>
              <View style={s.cardBody}>
                <Text style={s.cardTitle}>{item.title}</Text>
                <Text style={s.cardSub}>{item.benefit}</Text>
                <View style={s.badge}>
                  <Text style={s.badgeText}>⏱ {item.time}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={s.removeBtn}
                onPress={() => toggleSave(item.id)}
              >
                <Feather name="x" size={13} color={colors.red} />
              </TouchableOpacity>
            </View>
          )}
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
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
    },
    emptyIcon: { fontSize: 56, opacity: 0.4, marginBottom: 12 },
    emptyTitle: { fontFamily: Fonts.semibold, fontSize: 16, color: c.text },
    emptySub: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: c.text3,
      textAlign: "center",
      marginTop: 6,
      lineHeight: 20,
    },
    exploreBtn: {
      marginTop: 16,
      backgroundColor: c.primary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    exploreBtnText: {
      fontFamily: Fonts.semibold,
      fontSize: 14,
      color: c.white,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: c.card,
      borderRadius: 14,
      padding: 14,
      shadowColor: c.shadow,
      shadowOpacity: 0.07,
      shadowRadius: 8,
      elevation: 2,
    },
    cardImg: {
      width: 56,
      height: 56,
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
    badge: {
      alignSelf: "flex-start",
      backgroundColor: c.primaryLight,
      borderRadius: 20,
      paddingVertical: 3,
      paddingHorizontal: 10,
    },
    badgeText: { fontFamily: Fonts.medium, fontSize: 10, color: c.primary },
    removeBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: c.orangeLight,
      alignItems: "center",
      justifyContent: "center",
    },
  });
