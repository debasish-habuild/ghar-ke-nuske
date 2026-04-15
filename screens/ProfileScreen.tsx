import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Colors, Fonts, Spacing } from '../constants/theme';
import { useSaved } from '../context/SavedContext';

export default function ProfileScreen() {
  const nav = useNavigation<any>();
  const { saved } = useSaved();

  const settings = [
    { icon: '🎯', label: 'Health Goals',           bg: '#e8f5f3' },
    { icon: '🚫', label: 'Allergies & Restrictions',bg: '#fff3e0' },
    { icon: '📅', label: 'Daily Reminders',         bg: '#e3f2fd', toggle: true },
    { icon: '🔔', label: 'Push Notifications',      bg: '#f3e5f5', toggle: true },
    { icon: '🌙', label: 'Dark Mode',               bg: '#fff8e1', toggle: true },
    { icon: '🌐', label: 'Language',                bg: '#e8f5f3', value: 'English' },
    { icon: '❓', label: 'Help & Support',           bg: '#fce4ec' },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Feather name="chevron-left" size={20} color={Colors.text} />
        </TouchableOpacity>
        <View><Text style={s.headTitle}>Profile</Text><Text style={s.headSub}>Your account & settings</Text></View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={s.avatarSection}>
          <View style={s.avatar}><Text style={{ fontSize: 30 }}>🧘</Text></View>
          <Text style={s.name}>Priya Sharma</Text>
          <Text style={s.email}>priya.sharma@email.com</Text>
          <View style={s.stats}>
            <View style={s.stat}><Text style={s.statN}>{saved.size}</Text><Text style={s.statL}>Saved</Text></View>
            <View style={s.stat}><Text style={s.statN}>7🔥</Text><Text style={s.statL}>Streak</Text></View>
            <View style={s.stat}><Text style={s.statN}>14</Text><Text style={s.statL}>Used</Text></View>
          </View>
        </View>
        {/* Settings */}
        <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: 24 }}>
          {settings.map((item, i) => (
            <TouchableOpacity key={i} style={s.settItem} activeOpacity={0.8}>
              <View style={[s.settIco, { backgroundColor: item.bg }]}><Text>{item.icon}</Text></View>
              <Text style={s.settLbl}>{item.label}</Text>
              {item.value && <Text style={s.settVal}>{item.value}</Text>}
              {!item.toggle && <Feather name="chevron-right" size={14} color={Colors.text3} />}
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={s.signOut} onPress={() => Alert.alert('Signed Out 👋')}>
            <Text style={s.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Colors.bg },
  header:        { flexDirection: 'row', alignItems: 'center', gap: 12, padding: Spacing.lg },
  backBtn:       { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  headTitle:     { fontFamily: Fonts.bold, fontSize: 19, color: Colors.text },
  headSub:       { fontFamily: Fonts.regular, fontSize: 12, color: Colors.text3 },
  avatarSection: { alignItems: 'center', padding: 24, backgroundColor: '#e8f5f3', marginHorizontal: Spacing.lg, borderRadius: 16, marginBottom: 20 },
  avatar:        { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryLight2, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: Colors.primary, marginBottom: 10 },
  name:          { fontFamily: Fonts.bold, fontSize: 18, color: Colors.text },
  email:         { fontFamily: Fonts.regular, fontSize: 12, color: Colors.text3, marginTop: 3 },
  stats:         { flexDirection: 'row', gap: 24, marginTop: 16 },
  stat:          { alignItems: 'center' },
  statN:         { fontFamily: Fonts.bold, fontSize: 18, color: Colors.primary },
  statL:         { fontFamily: Fonts.regular, fontSize: 10, color: Colors.text3, marginTop: 2 },
  settItem:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: '#fff', borderRadius: 12, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  settIco:       { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settLbl:       { flex: 1, fontFamily: Fonts.medium, fontSize: 13, color: Colors.text },
  settVal:       { fontFamily: Fonts.regular, fontSize: 12, color: Colors.text3, marginRight: 8 },
  signOut:       { marginTop: 8, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 12, padding: 14, alignItems: 'center' },
  signOutText:   { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.primary },
});
