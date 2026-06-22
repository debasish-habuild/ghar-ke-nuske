import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { Fonts, Spacing, Palette } from "../constants/theme";
import { useSaved } from "../context/SavedContext";
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "../context/ThemeContext";

export default function ProfileScreen() {
  const nav = useNavigation<any>();
  const { saved } = useSaved();
  const { name, streak, used } = useProfile();
  const { colors, isDark, toggle } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  // Local-only toggle for now; push wiring lives in services/notifications.
  const [pushOn, setPushOn] = useState(true);

  // Health Goals + Allergies & Restrictions are intentionally commented out
  // until the profile feature is built out. Dark Mode moved to the header
  // (functional), Daily Reminders + Language removed for now.
  const settings = [
    // { icon: "🎯", label: "Health Goals", bg: "#e8f5f3" },
    // { icon: "🚫", label: "Allergies & Restrictions", bg: "#fff3e0" },
    { icon: "🔔", label: "Push Notifications", bg: "#f3e5f5", toggle: true },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <View style={s.headerLeft}>
          <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
            <Feather name="chevron-left" size={20} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={s.headTitle}>Profile</Text>
            <Text style={s.headSub}>Your account & settings</Text>
          </View>
        </View>
        {/* Dark mode lives here now — one tap, no buried list row. */}
        <TouchableOpacity
          style={s.themeBtn}
          onPress={toggle}
          accessibilityLabel="Toggle dark mode"
        >
          <Feather
            name={isDark ? "sun" : "moon"}
            size={18}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={s.avatarSection}>
          <View style={s.avatar}>
            <Text style={{ fontSize: 30 }}>🧘</Text>
          </View>
          <Text style={s.name}>{name}</Text>
          <Text style={s.email}>Saved locally on this device</Text>
          <View style={s.stats}>
            <View style={s.stat}>
              <Text style={s.statN}>{saved.size}</Text>
              <Text style={s.statL}>Saved</Text>
            </View>
            <View style={s.stat}>
              <Text style={s.statN}>{streak}🔥</Text>
              <Text style={s.statL}>Streak</Text>
            </View>
            <View style={s.stat}>
              <Text style={s.statN}>{used}</Text>
              <Text style={s.statL}>Used</Text>
            </View>
          </View>
        </View>
        {/* Settings */}
        <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: 24 }}>
          {settings.map((item, i) => (
            <View key={i} style={s.settItem}>
              <View style={[s.settIco, { backgroundColor: item.bg }]}>
                <Text>{item.icon}</Text>
              </View>
              <Text style={s.settLbl}>{item.label}</Text>
              {item.toggle ? (
                <Switch
                  value={pushOn}
                  onValueChange={setPushOn}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.white}
                />
              ) : (
                <Feather name="chevron-right" size={14} color={colors.text3} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: Spacing.lg,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: c.backBtn,
      alignItems: "center",
      justifyContent: "center",
    },
    themeBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: c.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },
    headTitle: { fontFamily: Fonts.bold, fontSize: 19, color: c.text },
    headSub: { fontFamily: Fonts.regular, fontSize: 12, color: c.text3 },
    avatarSection: {
      alignItems: "center",
      padding: 24,
      backgroundColor: c.primaryLight,
      marginHorizontal: Spacing.lg,
      borderRadius: 16,
      marginBottom: 20,
    },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: c.primaryLight2,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: c.primary,
      marginBottom: 10,
    },
    name: { fontFamily: Fonts.bold, fontSize: 18, color: c.text },
    email: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: c.text3,
      marginTop: 3,
    },
    stats: { flexDirection: "row", gap: 24, marginTop: 16 },
    stat: { alignItems: "center" },
    statN: { fontFamily: Fonts.bold, fontSize: 18, color: c.primary },
    statL: {
      fontFamily: Fonts.regular,
      fontSize: 10,
      color: c.text3,
      marginTop: 2,
    },
    settItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 14,
      backgroundColor: c.card,
      borderRadius: 12,
      marginBottom: 8,
      shadowColor: c.shadow,
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    settIco: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    settLbl: {
      flex: 1,
      fontFamily: Fonts.medium,
      fontSize: 13,
      color: c.text,
    },
  });
