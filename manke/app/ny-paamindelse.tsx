import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, IconButton, PrimaryButton, T } from '@/components/ui';
import { addDays, shortDate } from '@/lib/dates';
import { localDateString } from '@/logic/weather';
import { useApp } from '@/state/AppState';
import type { ReminderKind } from '@/state/types';
import { colors, fonts, horseColors } from '@/theme';

const KINDS: { value: ReminderKind; label: string; title: string }[] = [
  { value: 'smed', label: 'Smed', title: 'Smed' },
  { value: 'orm', label: 'Ormekur', title: 'Ormekur' },
  { value: 'vaccine', label: 'Vaccination', title: 'Vaccination' },
  { value: 'staevne', label: 'Stævne', title: 'Stævne' },
  { value: 'tand', label: 'Tandlæge', title: 'Tandeftersyn' },
  { value: 'dyrlaege', label: 'Dyrlæge', title: 'Dyrlæge' },
  { value: 'andet', label: 'Andet', title: 'Påmindelse' },
];

const QUICK: { days: number; label: string }[] = [
  { days: 1, label: 'I morgen' },
  { days: 7, label: 'Om en uge' },
  { days: 42, label: 'Om 6 uger' },
  { days: 182, label: 'Om et halvt år' },
];

export default function NewReminder() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { horses, selected, addReminder, today } = useApp();
  const [horseId, setHorseId] = useState(selected.id);
  const [kind, setKind] = useState<ReminderKind>('smed');
  const [title, setTitle] = useState('');
  const [days, setDays] = useState(7);
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const date = addDays(today, days);

  const save = () => {
    const t = time.trim().replace(':', '.');
    if (t && !/^([01]?\d|2[0-3])\.[0-5]\d$/.test(t)) {
      Alert.alert('Tjek tidspunktet', 'Skriv tiden som fx 08.30, eller lad feltet stå tomt.');
      return;
    }
    addReminder({
      horseId,
      kind,
      title: title.trim() || (KINDS.find((k) => k.value === kind)?.title ?? 'Påmindelse'),
      date: localDateString(date),
      time: t || undefined,
      note: note.trim() || undefined,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#FFFFFF' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 16, paddingBottom: 24, gap: 18 }} keyboardShouldPersistTaps="handled">
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton label="Luk" onPress={() => router.back()} bg={colors.bg} border={false}>
            <Feather name="x" size={18} color={colors.ink} />
          </IconButton>
          <T w="bold" size={16}>
            Ny påmindelse
          </T>
          <View style={{ width: 44 }} />
        </View>

        <View style={{ gap: 8 }}>
          <T w="bold" size={14}>
            Hest
          </T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {horses.map((h) => {
              const on = h.id === horseId;
              const c = horseColors(h.colorIndex);
              return (
                <Pressable
                  key={h.id}
                  onPress={() => setHorseId(h.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  style={[styles.horse, { borderColor: on ? c.color : colors.border }]}
                >
                  <Avatar letter={h.name} color={c.color} size={30} />
                  <T w={on ? 'bold' : 'semibold'}>{h.name}</T>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <T w="bold" size={14}>
            Hvad drejer det sig om?
          </T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {KINDS.map((k) => {
              const on = k.value === kind;
              return (
                <Pressable
                  key={k.value}
                  onPress={() => setKind(k.value)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  style={[styles.chip, on && { backgroundColor: colors.ink, borderColor: colors.ink }]}
                >
                  <T w={on ? 'bold' : 'semibold'} color={on ? '#FFFFFF' : colors.ink}>
                    {k.label}
                  </T>
                </Pressable>
              );
            })}
          </View>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={`Titel (valgfri), fx ${KINDS.find((k) => k.value === kind)?.title}`}
            placeholderTextColor={colors.faint}
            accessibilityLabel="Titel"
            style={styles.input}
          />
        </View>

        <View style={{ gap: 8 }}>
          <T w="bold" size={14}>
            Hvornår?
          </T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {QUICK.map((q) => {
              const on = q.days === days;
              return (
                <Pressable
                  key={q.days}
                  onPress={() => setDays(q.days)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  style={[styles.chip, on && { backgroundColor: colors.accentTint, borderColor: colors.accent }]}
                >
                  <T w={on ? 'bold' : 'semibold'} color={on ? colors.accentInk : colors.ink}>
                    {q.label}
                  </T>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.stepper}>
            <IconButton label="En dag tidligere" onPress={() => setDays((d) => Math.max(0, d - 1))}>
              <Feather name="minus" size={18} color={colors.ink} />
            </IconButton>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <T w="heavy" size={18}>
                {shortDate(date)}
              </T>
              <T size={13} color={colors.muted}>
                {days === 0 ? 'I dag' : days === 1 ? 'I morgen' : `Om ${days} dage`}
              </T>
            </View>
            <IconButton label="En dag senere" onPress={() => setDays((d) => Math.min(730, d + 1))}>
              <Feather name="plus" size={18} color={colors.ink} />
            </IconButton>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1, gap: 8 }}>
            <T w="bold" size={14}>
              Tidspunkt
            </T>
            <TextInput value={time} onChangeText={setTime} placeholder="08.30" placeholderTextColor={colors.faint} keyboardType="numbers-and-punctuation" accessibilityLabel="Tidspunkt" style={styles.input} />
          </View>
          <View style={{ flex: 2, gap: 8 }}>
            <T w="bold" size={14}>
              Note
            </T>
            <TextInput value={note} onChangeText={setNote} placeholder="fx husk hestepas" placeholderTextColor={colors.faint} accessibilityLabel="Note" style={styles.input} />
          </View>
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: insets.bottom + 16, borderTopWidth: 1, borderTopColor: colors.border }}>
        <PrimaryButton title="Gem påmindelse" onPress={save} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  horse: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 44, paddingLeft: 5, paddingRight: 14, borderRadius: 22, borderWidth: 2, backgroundColor: '#FFFFFF' },
  chip: { height: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 2, borderColor: colors.border, backgroundColor: '#FFFFFF', justifyContent: 'center' },
  input: { height: 52, borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, backgroundColor: '#F7F8FC', paddingHorizontal: 16, fontFamily: fonts.regular, fontSize: 16, color: colors.ink },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, borderRadius: 22, backgroundColor: colors.bg },
});
