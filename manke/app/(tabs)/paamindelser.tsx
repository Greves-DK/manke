import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Heading, Screen, T } from '@/components/ui';
import { addDays, daysUntil, isoWeek, monthName, relativeDay, WEEKDAY_LETTERS } from '@/lib/dates';
import { localDateString } from '@/logic/weather';
import { useApp } from '@/state/AppState';
import type { Reminder, ReminderKind } from '@/state/types';
import { colors, horseColors } from '@/theme';

const KIND_STYLE: Record<ReminderKind, { bg: string; fg: string; icon: (c: string) => ReactNode }> = {
  smed: { bg: colors.accentTint, fg: colors.accent, icon: (c) => <MaterialCommunityIcons name="horseshoe" size={22} color={c} /> },
  orm: { bg: colors.greenTint, fg: colors.green, icon: (c) => <MaterialCommunityIcons name="test-tube" size={22} color={c} /> },
  vaccine: { bg: colors.roseTint, fg: colors.rose, icon: (c) => <Feather name="shield" size={20} color={c} /> },
  staevne: { bg: colors.amberTint, fg: colors.amber, icon: (c) => <Feather name="award" size={20} color={c} /> },
  tand: { bg: colors.segmentSoft, fg: colors.grey, icon: (c) => <Feather name="calendar" size={20} color={c} /> },
  dyrlaege: { bg: colors.roseTint, fg: colors.rose, icon: (c) => <MaterialCommunityIcons name="stethoscope" size={22} color={c} /> },
  andet: { bg: colors.segmentSoft, fg: colors.grey, icon: (c) => <Feather name="bell" size={20} color={c} /> },
};

interface Group {
  title: string;
  urgent?: boolean;
  items: Reminder[];
}

export default function Reminders() {
  const router = useRouter();
  const { today, reminders, horses } = useApp();
  const sorted = [...reminders].sort((a, b) => a.date.localeCompare(b.date));
  const open = sorted.filter((r) => !r.done);
  const done = sorted.filter((r) => r.done).reverse();

  const groups: Group[] = [
    { title: 'Overskredet', urgent: true, items: open.filter((r) => daysUntil(r.date, today) < 0) },
    { title: 'I dag', urgent: true, items: open.filter((r) => daysUntil(r.date, today) === 0) },
    { title: 'I morgen', urgent: true, items: open.filter((r) => daysUntil(r.date, today) === 1) },
    { title: 'Denne uge', items: open.filter((r) => { const n = daysUntil(r.date, today); return n >= 2 && n <= 7; }) },
    { title: 'Senere', items: open.filter((r) => daysUntil(r.date, today) > 7) },
    { title: 'Klaret', items: done },
  ].filter((g) => g.items.length > 0);

  const week = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  const total = reminders.length;
  const doneCount = done.length;

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ gap: 2, flex: 1 }}>
          <T w="medium" color={colors.muted}>
            Uge {isoWeek(today)} · {monthName(today)} {today.getFullYear()}
          </T>
          <Heading>Påmindelser</Heading>
        </View>
        <Pressable onPress={() => router.push('/ny-paamindelse')} accessibilityRole="button" accessibilityLabel="Ny påmindelse" style={styles.add}>
          <Feather name="plus" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      <Card style={{ flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 12 }}>
        {week.map((d, i) => {
          const key = localDateString(d);
          const dots = open.filter((r) => r.date === key).map((r) => horses.find((h) => h.id === r.horseId)?.colorIndex ?? 0);
          return (
            <View key={key} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
              <T w={i === 0 ? 'bold' : 'regular'} size={12} color={i === 0 ? colors.accent : colors.muted}>
                {WEEKDAY_LETTERS[d.getDay()]}
              </T>
              <View style={[styles.day, i === 0 && { backgroundColor: colors.accent }]}>
                <T w={i === 0 ? 'heavy' : 'bold'} size={16} color={i === 0 ? '#FFFFFF' : colors.ink}>
                  {d.getDate()}
                </T>
              </View>
              <View style={{ flexDirection: 'row', gap: 3, height: 6 }}>
                {dots.slice(0, 3).map((ci, j) => (
                  <View key={j} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: horseColors(ci).color }} />
                ))}
              </View>
            </View>
          );
        })}
      </Card>

      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <T w="heavy" size={20}>
            {doneCount} af {total} klaret
          </T>
          <T size={13} color={colors.muted}>
            {open.length} tilbage
          </T>
        </View>
        <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.accentTint, overflow: 'hidden' }}>
          <View style={{ width: `${total ? Math.round((doneCount / total) * 100) : 0}%`, height: 8, backgroundColor: colors.accent, borderRadius: 4 }} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {horses.map((h) => {
            const n = open.filter((r) => r.horseId === h.id).length;
            return (
              <View key={h.id} style={styles.horseCount}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: horseColors(h.colorIndex).color }} />
                <T w="semibold" size={13}>
                  {h.name} {n}
                </T>
              </View>
            );
          })}
        </View>
      </Card>

      <Card style={{ paddingVertical: 6 }}>
        {groups.length === 0 ? (
          <T color={colors.muted} style={{ paddingVertical: 12 }}>
            Ingen påmindelser endnu. Tryk på plusset for at lave den første.
          </T>
        ) : null}
        {groups.map((g) => (
          <View key={g.title}>
            <T w="bold" size={12} color={g.urgent ? colors.red : colors.muted} style={{ letterSpacing: 0.6, marginTop: 12, marginBottom: 2 }}>
              {g.title.toUpperCase()}
            </T>
            {g.items.map((r, i) => (
              <ReminderRow key={r.id} r={r} last={i === g.items.length - 1} />
            ))}
          </View>
        ))}
      </Card>
    </Screen>
  );
}

function ReminderRow({ r, last }: { r: Reminder; last: boolean }) {
  const { horses, toggleReminder, today } = useApp();
  const horse = horses.find((h) => h.id === r.horseId);
  const hc = horseColors(horse?.colorIndex ?? 0);
  const k = KIND_STYLE[r.kind] ?? KIND_STYLE.andet;
  const when = [relativeDay(r.date, today), r.time ? `kl. ${r.time}` : null, r.note].filter(Boolean).join(' · ');
  return (
    <View style={[styles.item, !last && styles.itemLine]}>
      <View style={[styles.kind, { backgroundColor: r.done ? colors.segmentSoft : k.bg }]}>{k.icon(r.done ? colors.grey : k.fg)}</View>
      <View style={{ flex: 1, gap: 3 }}>
        <T w="bold" size={16} color={r.done ? colors.faint : colors.ink} style={r.done ? { textDecorationLine: 'line-through' } : undefined}>
          {r.title}
        </T>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {horse ? (
            <View style={{ backgroundColor: hc.tint, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 1 }}>
              <T w="bold" size={13} color={hc.ink}>
                {horse.name}
              </T>
            </View>
          ) : null}
          <T size={13} color={colors.muted}>
            {when}
          </T>
        </View>
      </View>
      <Pressable
        onPress={() => toggleReminder(r.id)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: r.done }}
        accessibilityLabel={`${r.title} klaret`}
        style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
      >
        {r.done ? (
          <View style={[styles.check, { backgroundColor: colors.accent, borderColor: colors.accent }]}>
            <Feather name="check" size={16} color="#FFFFFF" />
          </View>
        ) : (
          <View style={styles.check} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  add: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  day: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  horseCount: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 3, paddingHorizontal: 9, borderRadius: 12, backgroundColor: colors.bg },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  itemLine: { borderBottomWidth: 1, borderBottomColor: colors.line },
  kind: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  check: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: '#B9BDD0', alignItems: 'center', justifyContent: 'center' },
});
