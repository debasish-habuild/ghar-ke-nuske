import React from "react";
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
import { Colors, Fonts, Spacing } from "../constants/theme";
import { useCatalog } from "../context/CatalogContext";

type Route = RouteProp<RootStackParamList, "Remedies">;

export default function RemediesScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<Route>();
  const { category, categoryId, ingredientId } = route.params;
  const { remedies, remediesByCategory, remediesByIngredient, loading } =
    useCatalog();

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
          <Feather name="chevron-left" size={20} color={Colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={s.headTitle}>{category}</Text>
          <Text style={s.headSub}>{display.length} remedies found</Text>
        </View>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
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
              <Feather name="chevron-right" size={16} color={Colors.text3} />
            </TouchableOpacity>
          )}
        />
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
  headSub: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.text3,
    marginTop: 2,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  cardImg: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
  },
  cardBody: { flex: 1 },
  cardTitle: {
    fontFamily: Fonts.semibold,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 3,
  },
  cardSub: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.text3,
    marginBottom: 6,
  },
  meta: { flexDirection: "row", gap: 10 },
  metaT: { fontFamily: Fonts.regular, fontSize: 10, color: Colors.text3 },
});
