import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton, PrimaryButton, Segmented, T } from '@/components/ui';
import type { Clip, ColdSense, HorseType } from '@/logic/blanket';
import { useApp } from '@/state/AppState';
import type { Horse } from '@/state/types';
import { colors, fonts } from '@/theme';

const TYPES: { value: HorseType; label: string; breed: string }[] = [
  { value: 'varmblod', label: 'Varmblod', breed: 'Varmblod' },
  { value: 'fuldblod', label: 'Fuldblod', breed: 'Fuldblod' },
  { value: 'koldblod', label: 'Koldblod', breed: 'Koldblod' },
  { value: 'nordisk', label: 'Islænder / fjord', breed: 'Islænder / fjord' },
  { value: 'pony', label: 'Pony', breed: 'Pony' },
];

type Stand = 'ude' | 'dag' | 'inde';

export default function CreateHorse() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addHorse } = useApp();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [type, setType] = useState<HorseType>('varmblod');
  const [gender, setGender] = useState<Horse['gender']>('hoppe');
  const [clip, setClip] = useState<Clip>('uklippet');
  const [cold, setCold] = useState<ColdSense>('normal');
  const [stand, setStand] = useState<Stand>('dag');

  const save = () => {
    const n = name.trim();
    const years = Number(age.replace(',', '.'));
    if (!n) {
      Alert.alert('Mangler navn', 'Skriv hestens navn, så du kan kende den i appen.');
      return;
    }
    if (!Number.isFinite(years) || years <= 0 || years > 45) {
      Alert.alert('Tjek alderen', 'Skriv hestens alder i hele år, fx 12.');
      return;
    }
    addHorse({
      name: n,
      age: Math.round(years),
      type,
      gender,
      breed: TYPES.find((t) => t.value === type)?.breed ?? '',
      clip,
      cold,
      day: stand === 'inde' ? 'inde' : 'ude',
      night: stand === 'ude' ? 'ude' : 'inde',
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 24, gap: 16 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <IconButton label="Tilbage" onPress={() => router.back()}>
            <Feather name="chevron-left" size={20} color={colors.ink} />
          </IconButton>
          <T w="semibold" size={16}>
            Ny hest
          </T>
        </View>

        <View style={{ gap: 4 }}>
          <T w="heavy" size={30} style={{ letterSpacing: -0.7 }} accessibilityRole="header">
            Fortæl om din hest
          </T>
          <T color={colors.muted}>Så passer dækkenrådet til netop den.</T>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 2, gap: 8 }}>
            <T w="bold" size={14}>
              Navn
            </T>
            <TextInput value={name} onChangeText={setName} placeholder="fx Bella" placeholderTextColor={colors.faint} accessibilityLabel="Navn" style={styles.input} autoCapitalize="words" />
          </View>
          <View style={{ flex: 1, gap: 8 }}>
            <T w="bold" size={14}>
              Alder (år)
            </T>
            <TextInput value={age} onChangeText={setAge} placeholder="12" placeholderTextColor={colors.faint} keyboardType="number-pad" accessibilityLabel="Alder i år" style={styles.input} />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <T w="bold" size={14}>
            Type
          </T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {TYPES.map((t) => {
              const on = t.value === type;
              return (
                <Pressable
                  key={t.value}
                  onPress={() => setType(t.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  style={[styles.chip, on && { backgroundColor: colors.ink, borderColor: colors.ink }]}
                >
                  <T w={on ? 'bold' : 'semibold'} color={on ? '#FFFFFF' : colors.ink}>
                    {t.label}
                  </T>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <T w="bold" size={14}>
            Køn
          </T>
          <Segmented
            label="Køn"
            value={gender}
            onChange={setGender}
            options={[
              { value: 'hoppe', label: 'Hoppe' },
              { value: 'vallak', label: 'Vallak' },
              { value: 'hingst', label: 'Hingst' },
            ]}
          />
        </View>

        <View style={{ gap: 8 }}>
          <T w="bold" size={14}>
            Klippet
          </T>
          <Segmented
            label="Klippet"
            value={clip}
            onChange={setClip}
            options={[
              { value: 'uklippet', label: 'Uklippet' },
              { value: 'delvist', label: 'Delvist' },
              { value: 'helt', label: 'Helt' },
            ]}
          />
        </View>

        <View style={{ gap: 8 }}>
          <T w="bold" size={14}>
            Hvordan har den det med kulde?
          </T>
          <Segmented
            label="Kulde"
            value={cold}
            onChange={setCold}
            options={[
              { value: 'fryser', label: 'Fryser let' },
              { value: 'normal', label: 'Normal' },
              { value: 'sveder', label: 'Sveder let' },
            ]}
          />
        </View>

        <View style={{ gap: 8 }}>
          <T w="bold" size={14}>
            Hvor står den?
          </T>
          <Segmented
            label="Hvor står hesten"
            value={stand}
            onChange={setStand}
            options={[
              { value: 'ude', label: 'Ude døgnet' },
              { value: 'dag', label: 'Ude om dagen' },
              { value: 'inde', label: 'Mest inde' },
            ]}
          />
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: insets.bottom + 16, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.bg }}>
        <PrimaryButton title="Gem hest" onPress={save} right={<Feather name="check" size={20} color="#FFFFFF" />} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  input: { height: 52, borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, backgroundColor: '#FFFFFF', paddingHorizontal: 16, fontFamily: fonts.semibold, fontSize: 16, color: colors.ink },
  chip: { height: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 2, borderColor: colors.border, backgroundColor: '#FFFFFF', justifyContent: 'center' },
});
