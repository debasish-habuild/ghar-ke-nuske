import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../App";
import { Colors, Fonts, Spacing, Radius } from "../constants/theme";
import { useCatalog } from "../context/CatalogContext";
import { useSaved } from "../context/SavedContext";

type Route = RouteProp<RootStackParamList, "Detail">;

export default function DetailScreen() {
  const nav = useNavigation();
  const route = useRoute<Route>();
  const { toggleSave, isSaved } = useSaved();
  const { getRemedy } = useCatalog();
  const remedy = getRemedy(route.params.id);
  if (!remedy) return null;
  const saved = isSaved(remedy.id);

  const handleShare = async () => {
    await Share.share({
      message: `Check out this remedy: ${remedy.title} — ${remedy.benefit}`,
    });
  };

  return (
    <SafeAreaView style={s.safe} edges={["bottom"]}>
      {/* Hero Image */}
      <View style={s.hero}>
        <Image
          source={{ uri: remedy.img }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        <View style={s.heroOverlay} />
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Feather name="chevron-left" size={18} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={s.saveBtn}
          onPress={() => toggleSave(remedy.id)}
        >
          <Ionicons
            name={saved ? "heart" : "heart-outline"}
            size={18}
            color={Colors.red}
          />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <ScrollView style={s.body} showsVerticalScrollIndicator={false}>
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
      </ScrollView>

      {/* Actions */}
      <View style={s.actions}>
        <TouchableOpacity
          style={s.actSave}
          onPress={() => toggleSave(remedy.id)}
        >
          <Feather name="heart" size={14} color={Colors.primary} />
          <Text style={s.actSaveText}>{saved ? "Saved" : "Save"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actShare} onPress={handleShare}>
          <Feather name="share-2" size={14} color="#3730a3" />
          <Text style={s.actShareText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.actRoutine}
          onPress={() => Alert.alert("Added to Routine ✅")}
        >
          <Feather name="calendar" size={14} color="#fff" />
          <Text style={s.actRoutineText}>Routine</Text>
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
}) => (
  <View style={s.sec}>
    <View style={s.secTitleRow}>
      <View style={s.secBar} />
      <Text style={s.secTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
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
  body: { flex: 1, padding: Spacing.lg },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    color: Colors.text,
    marginBottom: 8,
  },
  badges: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 18 },
  badgeG: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
  },
  badgeGText: { fontFamily: Fonts.medium, fontSize: 11, color: Colors.primary },
  badgeO: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: Colors.orangeLight,
  },
  badgeOText: { fontFamily: Fonts.medium, fontSize: 11, color: Colors.orange },
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
    backgroundColor: Colors.primary,
  },
  secTitle: { fontFamily: Fonts.bold, fontSize: 14, color: Colors.text },
  ingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    backgroundColor: "#f8faf9",
    borderRadius: 10,
    marginBottom: 6,
  },
  ingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  ingName: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.text,
    flex: 1,
  },
  ingAmt: { fontFamily: Fonts.medium, fontSize: 11, color: Colors.text3 },
  stepRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepNumText: { fontFamily: Fonts.bold, fontSize: 11, color: "#fff" },
  stepText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 20,
    flex: 1,
  },
  benRow: {
    flexDirection: "row",
    gap: 8,
    padding: 10,
    backgroundColor: Colors.primaryLight,
    borderRadius: 10,
    marginBottom: 6,
  },
  benCheck: { color: Colors.primary, fontSize: 14, marginTop: 1 },
  benText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.text,
    lineHeight: 18,
    flex: 1,
  },
  precRow: {
    flexDirection: "row",
    gap: 8,
    padding: 10,
    backgroundColor: "#fffde7",
    borderRadius: 10,
    marginBottom: 6,
  },
  precIcon: { fontSize: 14, marginTop: 1 },
  precText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.text,
    lineHeight: 18,
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    padding: Spacing.lg,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actSave: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 13,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
  },
  actSaveText: {
    fontFamily: Fonts.semibold,
    fontSize: 12,
    color: Colors.primary,
  },
  actShare: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 13,
    borderRadius: 14,
    backgroundColor: "#eef2ff",
  },
  actShareText: { fontFamily: Fonts.semibold, fontSize: 12, color: "#3730a3" },
  actRoutine: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 13,
    borderRadius: 14,
    backgroundColor: Colors.primary,
  },
  actRoutineText: { fontFamily: Fonts.semibold, fontSize: 12, color: "#fff" },
});
