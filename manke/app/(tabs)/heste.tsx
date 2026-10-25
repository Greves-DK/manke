import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';
import { HorseChips } from '@/components/HorseChips';
import { Avatar, Card, Pill, Screen, SectionTitle, Segmented, T } from '@/components/ui';
import type { Clip, ColdSense } from '@/logic/blanket';
import { useApp } from '@/state/AppState';
import { useAdvice } from '@/state/useAdvice';
import { colors, horseColors } from '@/theme';

const TYPE_NAMES = { varmblod: 'Varmblod', fuldblod: 'Fuldblod', koldblod: 'Koldblod', nordisk: 'Islænder / fjord', pony: 'Pony' } as const;

type Stand = 'ude' | 'dag' | 'inde';

export default function Horses() {
  const router = useRouter();
  const { selected: h, updateHorse, people, contacts, resetSample } = useApp();
  const a = useAdvice(h);
  const c = horseColors(h.colorIndex);
  const stand: Stand = h.day === 'ude' && h.night === 'ude' ? 'ude' : h.day === 'ude' ? 'dag' : 'inde';
  const blankets = [...h.blankets].sort((x, y) => (x.kind === y.kind ? x.grams - y.grams : x.kind === 'regn' ? -1 : 1));

  const setStand = (s: Stand) => {
    if (s === 'ude') updateHorse(h.id, { day: 'ude', night: 'ude' });
    else if (s === 'dag') updateHorse(h.id, { day: 'ude', night: 'inde' });
    else updateHorse(h.id, { day: 'inde', night: 'inde' });
  };

  const call = (name: string, phone: string) => {
    if (!phone) {
      Alert.alert('Intet nummer endnu', `Tilføj et telefonnummer til ${name}, så kan du ringe herfra.`);
      return;
    }
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`).catch(() => Alert.alert('Kunne ikke ringe', 'Telefonen kunne ikke åbne opkaldet.'));
  };

  return (
    <Screen>
      <HorseChips onAdd={() => router.push('/opret')} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Avatar letter={h.name} color={c.color} size={72} />
        <View style={{ flex: 1, gap: 2 }}>
          <T w="heavy" size={30} style={{ letterSpacing: -0.7 }} accessibilityRole="header">
            {h.name}
          </T>
          <T color={colors.muted}>
            {h.breed || TYPE_NAMES[h.type]} · {h.gender} · {h.age} år
          </T>
        </View>
      </View>

      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingRight: 10 }}>
        <View style={{ flexDirection: 'row' }}>
          {people.map((p, i) => (
            <View key={p.id} style={{ marginLeft: i === 0 ? 0 : -8, borderWidth: 2, borderColor: '#FFFFFF', borderRadius: 18 }}>
              <Avatar letter={p.name} color={p.color} size={32} />
            </View>
          ))}
        </View>
        <T size={14} color={colors.muted} style={{ flex: 1 }}>
          Delt med <T w="bold" size={14}>{people.map((p) => p.name).join(' og ')}</T>
        </T>
        <Pressable onPress={() => router.push('/del')} accessibilityRole="button" style={styles.share}>
          <T w="bold" color={colors.accentInk}>
            Del
          </T>
        </Pressable>
      </Card>

      <Card style={{ paddingVertical: 4 }}>
        <SectionTitle>Faste kontakter</SectionTitle>
        {contacts.map((ct, i) => (
          <View key={ct.id} style={[styles.line, i < contacts.length - 1 && styles.lineBorder]}>
            <View style={[styles.square, { backgroundColor: ct.role === 'Dyrlæge' ? colors.roseTint : colors.accentTint }]}>
              {ct.role === 'Dyrlæge' ? (
                <MaterialCommunityIcons name="stethoscope" size={22} color={colors.rose} />
              ) : (
                <MaterialCommunityIcons name="horseshoe" size={22} color={colors.accent} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <T w="bold">{ct.name}</T>
              <T size={13} color={colors.muted}>
                {ct.role}
                {ct.org ? ` · ${ct.org}` : ''}
              </T>
            </View>
            <Pressable onPress={() => call(ct.name, ct.phone)} accessibilityRole="button" accessibilityLabel={`Ring til ${ct.name}`} style={styles.callBtn}>
              <Feather name="phone" size={19} color={colors.green} />
            </Pressable>
          </View>
        ))}
      </Card>

      <Card style={{ gap: 12 }}>
        <T w="heavy" size={17} accessibilityRole="header">
          Om {h.name}
        </T>
        <View style={{ gap: 8 }}>
          <T w="bold">Klippet</T>
          <Segmented<Clip>
            label="Klippet"
            value={h.clip}
            onChange={(v) => updateHorse(h.id, { clip: v })}
            options={[
              { value: 'uklippet', label: 'Uklippet' },
              { value: 'delvist', label: 'Delvist' },
              { value: 'helt', label: 'Helt' },
            ]}
          />
        </View>
        <View style={{ gap: 8 }}>
          <T w="bold">Hvordan har {h.gender === 'hoppe' ? 'hun' : 'han'} det med kulde?</T>
          <Segmented<ColdSense>
            label="Kulde"
            value={h.cold}
            onChange={(v) => updateHorse(h.id, { cold: v })}
            options={[
              { value: 'fryser', label: 'Fryser let' },
              { value: 'normal', label: 'Normal' },
              { value: 'sveder', label: 'Sveder let' },
            ]}
          />
        </View>
        <View style={{ gap: 8 }}>
          <T w="bold">Hvor står {h.gender === 'hoppe' ? 'hun' : 'han'}?</T>
          <Segmented<Stand>
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
      </Card>

      <Card style={{ paddingVertical: 4 }}>
        <SectionTitle right={<T size={13} color={colors.muted}>Rådet vælger blandt disse</T>}>Dækkenskab</SectionTitle>
        {blankets.length === 0 ? (
          <T color={colors.muted} style={{ paddingBottom: 12 }}>
            Ingen dækkener endnu. Rådet viser stadig, hvor meget fyld der skal til.
          </T>
        ) : null}
        {blankets.map((b, i) => {
          const today = a.day.blanket?.id === b.id;
          const tonight = a.night.blanket?.id === b.id;
          return (
            <View key={b.id} style={[styles.line, i < blankets.length - 1 && styles.lineBorder]}>
              <View style={[styles.weight, today && { backgroundColor: colors.accentTint }, tonight && { backgroundColor: colors.navy }]}>
                <T w="heavy" size={14} color={tonight ? '#FFFFFF' : today ? colors.accentInk : colors.ink}>
                  {b.grams} g
                </T>
              </View>
              <View style={{ flex: 1 }}>
                <T w="bold">
                  {b.kind === 'stald' ? 'Stalddækken' : 'Regndækken'}
                  {b.neck ? ' med hals' : ''}
                </T>
                {b.note ? (
                  <T size={13} color={colors.muted}>
                    {b.note}
                  </T>
                ) : null}
              </View>
              {today ? <Pill text="I dag" bg={colors.accentTint} fg={colors.accentInk} /> : null}
              {tonight ? <Pill text="I nat" bg={colors.navy} fg="#FFFFFF" /> : null}
            </View>
          );
        })}
      </Card>

      <Pressable
        onPress={() =>
          Alert.alert('Nulstil eksempeldata?', 'Dine ændringer bliver erstattet af eksemplerne med Bella, Smilla og Kasper.', [
            { text: 'Annullér', style: 'cancel' },
            { text: 'Nulstil', style: 'destructive', onPress: resetSample },
          ])
        }
        accessibilityRole="button"
        style={{ alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: 12 }}
      >
        <T w="semibold" size={14} color={colors.muted}>
          Nulstil eksempeldata
        </T>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  share: { height: 44, paddingHorizontal: 18, borderRadius: 22, backgroundColor: colors.accentTint, alignItems: 'center', justifyContent: 'center' },
  line: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  lineBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  square: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  callBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.greenTint, alignItems: 'center', justifyContent: 'center' },
  weight: { width: 60, height: 40, borderRadius: 12, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
});
