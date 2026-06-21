import React, { useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { RootStackParamList } from "../App";
import { Fonts, Spacing, Palette } from "../constants/theme";
import { useCatalog } from "../context/CatalogContext";
import { useTheme } from "../context/ThemeContext";

type Route = RouteProp<RootStackParamList, "Remedies">;

export default function RemediesScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<Route>();
  const { category, categoryId, ingredientId } = route.params;
  const { remedies, remediesByCategory, remediesByIngredient, loading } =
    useCatalog();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  // Resolve the list from whichever filter was passed; fall back to everything.
  let data = remedies;
  if (ingredientId) data = remediesByIngredient(ingredientId);
  else if (categoryId) data = remediesByCategory(categoryId);
  else if (category) data = remediesByCategory(category);
  const display = data.length > 0 ? data : remedies;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Feather name="chevron-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={s.headTitle}>{category}</Text>
          <Text style={s.headSub}>{display.length} remedies found</Text>
        </View>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : (
        <FlatList
          data={display}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: Spacing.lg, gap: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={s.card}
              onPress={() => nav.navigate("Detail", { id: item.id })}
              activeOpacity={0.85}
            >
              <Image source={{ uri: item.img }} style={s.cardImg} />
              <View style={s.cardBody}>
                <Text style={s.cardTitle}>{item.title}</Text>
                <Text style={s.cardSub} numberOfLines={1}>
                  {item.benefit}
                </Text>
                <View style={s.meta}>
                  <Text style={s.metaT}>⏱ {item.time}</Text>
                  <Text style={s.metaT}>🌿 {item.ing_n} ing.</Text>
                </View>
              </View>
              <Feather name="chevron-right" size={16} color={colors.text3} />
            </TouchableOpacity>
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
    headSub: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: c.text3,
      marginTop: 2,
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
    meta: { flexDirection: "row", gap: 10 },
    metaT: { fontFamily: Fonts.regular, fontSize: 10, color: c.text3 },
  });
