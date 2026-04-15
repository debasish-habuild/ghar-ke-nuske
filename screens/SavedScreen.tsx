import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Colors, Fonts, Spacing } from '../constants/theme';
import { REMEDIES } from '../data/remedies';
import { useSaved } from '../context/SavedContext';

export default function SavedScreen() {
  const nav = useNavigation<any>();
  const { saved, toggleSave } = useSaved();
  const data = REMEDIES.filter(r => saved.has(r.id));

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Feather name="chevron-left" size={20} color={Colors.text} />
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
          <Text style={s.emptySub}>Tap the heart on any remedy to save it here</Text>
          <TouchableOpacity style={s.exploreBtn} onPress={() => nav.navigate('Home')}>
            <Text style={s.exploreBtnText}>Explore Remedies</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: Spacing.lg, gap: 12 }}
          renderItem={({ item }) => (
            <View style={s.card}>
              <TouchableOpacity onPress={() => nav.navigate('Detail', { id: item.id })}>
                <Image source={{ uri: item.img }} style={s.cardImg} />
              </TouchableOpacity>
              <View style={s.cardBody}>
                <Text style={s.cardTitle}>{item.title}</Text>
                <Text style={s.cardSub}>{item.benefit}</Text>
                <View style={s.badge}><Text style={s.badgeText}>⏱ {item.time}</Text></View>
              </View>
              <TouchableOpacity style={s.removeBtn} onPress={() => toggleSave(item.id)}>
                <Feather name="x" size={13} color={Colors.red} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Colors.bg },
  header:        { flexDirection: 'row', alignItems: 'center', gap: 12, padding: Spacing.lg },
  backBtn:       { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  headTitle:     { fontFamily: Fonts.bold, fontSize: 19, color: Colors.text },
  headSub:       { fontFamily: Fonts.regular, fontSize: 12, color: Colors.text3 },
  empty:         { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon:     { fontSize: 56, opacity: 0.4, marginBottom: 12 },
  emptyTitle:    { fontFamily: Fonts.semibold, fontSize: 16, color: Colors.text },
  emptySub:      { fontFamily: Fonts.regular, fontSize: 13, color: Colors.text3, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  exploreBtn:    { marginTop: 16, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  exploreBtnText:{ fontFamily: Fonts.semibold, fontSize: 14, color: '#fff' },
  card:          { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  cardImg:       { width: 56, height: 56, borderRadius: 12, backgroundColor: Colors.primaryLight },
  cardBody:      { flex: 1 },
  cardTitle:     { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.text, marginBottom: 3 },
  cardSub:       { fontFamily: Fonts.regular, fontSize: 11, color: Colors.text3, marginBottom: 6 },
  badge:         { alignSelf: 'flex-start', backgroundColor: Colors.primaryLight, borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10 },
  badgeText:     { fontFamily: Fonts.medium, fontSize: 10, color: Colors.primary },
  removeBtn:     { width: 32, height: 32, borderRadius: 8, backgroundColor: '#fff0f0', alignItems: 'center', justifyContent: 'center' },
});
