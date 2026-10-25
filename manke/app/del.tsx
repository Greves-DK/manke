import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, IconButton, Pill, PrimaryButton, T } from '@/components/ui';
import { useApp } from '@/state/AppState';
import { colors, fonts } from '@/theme';

type Role = 'medejer' | 'part' | 'passer' | 'traener';

const ROLES: { id: Role; name: string; text: string; color: string; icon: ComponentProps<typeof Feather>['name'] }[] = [
  { id: 'medejer', name: 'Medejer', text: 'Kan alt, også redigere hesten', color: '#3F5BEA', icon: 'key' },
  { id: 'part', name: 'Part', text: 'Ser råd og kan sætte flueben', color: '#C2416A', icon: 'user' },
  { id: 'passer', name: 'Staldpasser', text: 'Ser dagens dækken', color: '#237A5C', icon: 'home' },
  { id: 'traener', name: 'Træner', text: 'Ser stævner og træning', color: '#94600A', icon: 'clipboard' },
];

export default function Share() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selected, people } = useApp();
  const [role, setRole] = useState<Role>('part');
  const [contact, setContact] = useState('');
  const roleName = ROLES.find((r) => r.id === role)?.name.toLowerCase() ?? '';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#FFFFFF' }} contentContainerStyle={{ padding: 20, paddingTop: 16, paddingBottom: insets.bottom + 32, gap: 16 }} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton label="Luk" onPress={() => router.back()} bg={colors.bg} border={false}>
          <Feather name="x" size={18} color={colors.ink} />
        </IconButton>
        <T w="bold" size={16}>
          Del {selected.name}
        </T>
        <View style={{ width: 44 }} />
      </View>

      <View style={{ gap: 6 }}>
        <T w="heavy" size={28} style={{ letterSpacing: -0.6, lineHeight: 32 }} accessibilityRole="header">
          Hvem skal kunne se {selected.name}?
        </T>
        <T color={colors.muted} style={{ lineHeight: 21 }}>
          De får dagens dækkenråd og påmindelser, og alle ser det samme.
        </T>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {ROLES.map((r) => {
          const on = r.id === role;
          return (
            <Pressable
              key={r.id}
              onPress={() => setRole(r.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              style={[styles.role, on ? { borderColor: colors.accent, backgroundColor: '#F3F5FF' } : null]}
            >
              <View style={[styles.roleIcon, { backgroundColor: r.color }]}>
                <Feather name={r.icon} size={19} color="#FFFFFF" />
              </View>
              <T w="bold" size={16}>
                {r.name}
              </T>
              <T size={13} color={colors.muted} style={{ lineHeight: 17 }}>
                {r.text}
              </T>
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: 8 }}>
        <T w="bold" size={14} nativeID="contactLabel">
          Telefon eller e-mail
        </T>
        <TextInput
          value={contact}
          onChangeText={setContact}
          placeholder="fx 20 12 34 56"
          placeholderTextColor={colors.faint}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabelledBy="contactLabel"
          accessibilityLabel="Telefon eller e-mail"
          style={styles.input}
        />
      </View>

      <PrimaryButton
        title={`Inviter som ${roleName}`}
        disabled={contact.trim().length < 4}
        onPress={() => Alert.alert('Deling kommer snart', 'Invitationer kræver login, som er næste trin i udviklingen. Der er ikke sendt noget endnu.')}
      />

      <View style={{ gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Feather name="lock" size={14} color={colors.muted} />
          <T size={13} color={colors.muted}>
            Kun dem, du inviterer, kan se {selected.name}
          </T>
        </View>
        {people.map((p) => (
          <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 }}>
            <Avatar letter={p.name} color={p.color} size={36} />
            <View style={{ flex: 1 }}>
              <T w="bold">{p.name}</T>
              <T size={13} color={colors.muted}>
                {p.role}
              </T>
            </View>
            {p.status === 'aktiv' ? <Pill text="Aktiv" bg={colors.greenTint} fg={colors.green} /> : <Pill text="Inviteret" bg={colors.amberTint} fg={colors.amber} />}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  role: { width: '48%', flexGrow: 1, gap: 6, padding: 14, borderRadius: 20, borderWidth: 2, borderColor: '#E6E8F2', backgroundColor: '#FFFFFF' },
  roleIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  input: { height: 52, borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, backgroundColor: '#F7F8FC', paddingHorizontal: 16, fontFamily: fonts.regular, fontSize: 16, color: colors.ink },
});
