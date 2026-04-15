import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { RootStackParamList } from '../App';
import { Colors, Fonts, Spacing, Radius } from '../constants/theme';
import { REMEDIES, PLACEHOLDERS } from '../data/remedies';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const RECENTS  = ['Tulsi Tea', 'Ginger Honey', 'Acne'];
const POPULARS = ['Turmeric Milk', 'Hair Fall', 'Immunity', 'Digestion', 'Stress', 'Cold'];

export default function SearchScreen() {
  const nav = useNavigation<Nav>();
  const [query, setQuery] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const inputRef = useRef<TextInput>(null);
  const phIdx = useRef(0), phChar = useRef(0), deleting = useRef(false);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const word = PLACEHOLDERS[phIdx.current];
      if (!deleting.current) {
        phChar.current++;
        setPlaceholder(word.substring(0, phChar.current));
        if (phChar.current === word.length) { deleting.current = true; timer = setTimeout(tick, 1600); }
        else timer = setTimeout(tick, 80);
      } else {
        phChar.current--;
        setPlaceholder(word.substring(0, phChar.current));
        if (phChar.current === 0) { deleting.current = false; phIdx.current = (phIdx.current + 1) % PLACEHOLDERS.length; timer = setTimeout(tick, 300); }
        else timer = setTimeout(tick, 40);
      }
    };
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, []);

  const results = query.trim()
    ? REMEDIES.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.cat.toLowerCase().includes(query.toLowerCase()) ||
        r.benefit.toLowerCase().includes(query.toLowerCase()) ||
        r.ingredients.some(i => i.n.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Feather name="chevron-left" size={20} color={Colors.text} />
        </TouchableOpacity>
        <View style={s.searchBar}>
          <Feather name="search" size={16} color={Colors.text3} />
          <TextInput
            ref={inputRef}
            style={s.input}
            placeholder={placeholder}
            placeholderTextColor={Colors.text3}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Feather name="x" size={16} color={Colors.text3} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {query.trim() === '' ? (
        <FlatList
          data={[]}
          ListHeaderComponent={() => (
            <View>
              <Text style={s.groupLabel}>Recent Searches</Text>
              <View style={s.chips}>
                {RECENTS.map(t => (
                  <TouchableOpacity key={t} style={[s.chip, s.chipActive]} onPress={() => setQuery(t)}>
                    <Text style={s.chipActiveText}>🕐 {t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.groupLabel}>Popular Searches</Text>
              <View style={s.chips}>
                {POPULARS.map(t => (
                  <TouchableOpacity key={t} style={s.chip} onPress={() => setQuery(t)}>
                    <Text style={s.chipText}>🔥 {t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          renderItem={() => null}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={i => i.id}
          contentContainerStyle={{ padding: Spacing.lg }}
          ListHeaderComponent={() => (
            <Text style={s.resultsLabel}>{results.length} result{results.length !== 1 ? 's' : ''} for "{query}"</Text>
          )}
          ListEmptyComponent={() => (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>🔍</Text>
              <Text style={s.emptyTitle}>No results found</Text>
              <Text style={s.emptySub}>Try a different keyword</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity style={s.card} onPress={() => nav.navigate('Detail', { id: item.id })} activeOpacity={0.85}>
              <Image source={{ uri: item.img }} style={s.cardImg} />
              <View style={s.cardBody}>
                <Text style={s.cardTitle}>{item.title}</Text>
                <Text style={s.cardSub}>{item.benefit}</Text>
                <View style={s.cardMeta}>
                  <Text style={s.metaText}>⏱ {item.time}</Text>
                  <Text style={s.metaText}>🌿 {item.ing_n} ingredients</Text>
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
  safe:           { flex: 1, backgroundColor: Colors.bg },
  header:         { flexDirection: 'row', alignItems: 'center', gap: 10, padding: Spacing.lg },
  backBtn:        { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  searchBar:      { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 40, paddingHorizontal: Spacing.md, height: 48, borderWidth: 1, borderColor: Colors.primary },
  input:          { flex: 1, fontFamily: Fonts.regular, fontSize: 13, color: Colors.text },
  groupLabel:     { fontFamily: Fonts.semibold, fontSize: 11, color: Colors.text3, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: Spacing.lg, marginTop: 16, marginBottom: 10 },
  chips:          { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: Spacing.lg, marginBottom: 8 },
  chip:           { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff' },
  chipActive:     { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipText:       { fontFamily: Fonts.medium, fontSize: 12, color: Colors.text3 },
  chipActiveText: { fontFamily: Fonts.semibold, fontSize: 12, color: Colors.primary },
  resultsLabel:   { fontFamily: Fonts.semibold, fontSize: 11, color: Colors.text3, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  card:           { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  cardImg:        { width: 64, height: 64, borderRadius: 12, backgroundColor: Colors.primaryLight },
  cardBody:       { flex: 1 },
  cardTitle:      { fontFamily: Fonts.semibold, fontSize: 14, color: Colors.text, marginBottom: 3 },
  cardSub:        { fontFamily: Fonts.regular, fontSize: 11, color: Colors.text3, marginBottom: 6 },
  cardMeta:       { flexDirection: 'row', gap: 10 },
  metaText:       { fontFamily: Fonts.regular, fontSize: 10, color: Colors.text3 },
  empty:          { alignItems: 'center', paddingTop: 40 },
  emptyIcon:      { fontSize: 40, marginBottom: 12 },
  emptyTitle:     { fontFamily: Fonts.semibold, fontSize: 15, color: Colors.text },
  emptySub:       { fontFamily: Fonts.regular, fontSize: 12, color: Colors.text3, marginTop: 6 },
});
