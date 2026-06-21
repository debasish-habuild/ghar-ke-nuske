import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { Colors, Fonts, Spacing } from '../constants/theme';

const SYMPTOMS = [
  {e:'🤧',n:'Cold'},{e:'😮‍💨',n:'Cough'},{e:'🌡️',n:'Fever'},
  {e:'😣',n:'Acne'},{e:'💆',n:'Hair Fall'},{e:'😰',n:'Stress'},
  {e:'🤢',n:'Indigestion'},{e:'😴',n:'Insomnia'},{e:'🦴',n:'Joint Pain'},
  {e:'👁️',n:'Eye Issues'},{e:'🫀',n:'Fatigue'},{e:'🦷',n:'Dental Pain'},
];

export default function SymptomScreen() {
  const nav = useNavigation<any>();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (name: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n; });
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => nav.goBack()}>
          <Feather name="chevron-left" size={20} color={Colors.text} />
        </TouchableOpacity>
        <View><Text style={s.headTitle}>What's your problem?</Text><Text style={s.headSub}>Select one or more symptoms</Text></View>
      </View>
      <FlatList
        data={SYMPTOMS}
        numColumns={3}
        keyExtractor={i => i.n}
        contentContainerStyle={{ padding: Spacing.lg, gap: 10 }}
        columnWrapperStyle={{ gap: 10 }}
        renderItem={({ item }) => {
          const on = selected.has(item.n);
          return (
            <TouchableOpacity style={[s.chip, on && s.chipOn, { flex: 1 }]} onPress={() => toggle(item.n)}>
              <Text style={{ fontSize: 24 }}>{item.e}</Text>
              <Text style={[s.chipText, on && s.chipTextOn]}>{item.n}</Text>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={() => (
          <TouchableOpacity style={s.btn} onPress={() => nav.navigate('Remedies', { category: 'Your Symptoms' })}>
            <Text style={s.btnText}>Continue</Text>
            <Feather name="arrow-right" size={16} color="#fff" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.bg },
  header:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: Spacing.lg },
  backBtn:    { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  headTitle:  { fontFamily: Fonts.bold, fontSize: 19, color: Colors.text },
  headSub:    { fontFamily: Fonts.regular, fontSize: 12, color: Colors.text3 },
  chip:       { alignItems: 'center', gap: 6, padding: 14, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: '#fff' },
  chipOn:     { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  chipText:   { fontFamily: Fonts.medium, fontSize: 11, color: Colors.text3, textAlign: 'center' },
  chipTextOn: { color: Colors.primary, fontFamily: Fonts.semibold },
  btn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, backgroundColor: Colors.primary, borderRadius: 12, padding: 15 },
  btnText:    { fontFamily: Fonts.semibold, fontSize: 15, color: '#fff' },
});
