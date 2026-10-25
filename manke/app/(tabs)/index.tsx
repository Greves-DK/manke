import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { HorseChips } from '@/components/HorseChips';
import { Avatar, Card, Heading, IconButton, Screen, T } from '@/components/ui';
import { daysUntil, greeting, longDate, relativeDay } from '@/lib/dates';
import { useApp } from '@/state/AppState';
import { currentHour, useAdvice } from '@/state/useAdvice';
import { colors, horseColors } from '@/theme';

function deg(n: number) {
  const r = Math.round(n);
  return (r < 0 ? '−' + Math.abs(r) : String(r)) + '°';
}

export default function Home() {
  const router = useRouter();
  const { today, selected, horses, reminders, forecast } = useApp();
  const a = useAdvice(selected);
  const now = currentHour(forecast.points, new Date());

  const open = reminders.filter((r) => !r.done && daysUntil(r.date, today) >= 0).sort((x, y) => x.date.localeCompare(y.date));
  const thisWeek = open.filter((r) => daysUntil(r.date, today) <= 7);
  const next = open[0];
  const nextShow = open.find((r) => r.kind === 'staevne');
  const horseName = (id: string) => horses.find((h) => h.id === id)?.name ?? '';

  return (
    <Screen>
      <View style={styles.row}>
        <T w="medium" color={colors.muted}>
          {longDate(today)}
        </T>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={styles.weatherPill} accessibilityLabel={now ? `${deg(now.temp)} lige nu` : 'Vejret hentes'}>
            <Feather name={now && now.rain >= 0.1 ? 'cloud-rain' : 'cloud'} size={18} color={colors.accent} />
            <T w="bold">{now ? deg(now.temp) : '–'}</T>
          </View>
          <IconButton label="Påmindelser" onPress={() => router.push('/paamindelser')}>
            <Feather name="bell" size={20} color={colors.accent} />
          </IconButton>
        </View>
      </View>

      <Heading>{greeting(new Date())}</Heading>

      <HorseChips onAdd={() => router.push('/opret')} />

      <Pressable onPress={() => router.push('/daekken')} accessibilityRole="button" accessibilityLabel={`Dagens dækken til ${selected.name}: ${a.day.label}`} style={styles.hero}>
        <View style={styles.heroTag}>
          <T w="semibold" size={14} color="#FFFFFF">
            Dagens dækken · {selected.name}
          </T>
        </View>
        <View style={{ gap: 4 }}>
          <T w="heavy" size={30} color="#FFFFFF" style={{ letterSpacing: -0.6, lineHeight: 34 }}>
            {a.day.label}
          </T>
          {a.change ? (
            <T size={15} color="rgba(255,255,255,0.82)">
              {a.change}
            </T>
          ) : null}
        </View>
        <View style={{ height: 64 }}>
          <View style={[styles.track, { left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.9)' }]} />
          <View style={[styles.track, { left: 0, width: '64%', backgroundColor: colors.navySoft }]} />
          <View style={[styles.dot, { left: 0, backgroundColor: colors.navySoft }]} />
          <View style={[styles.dot, { left: '64%', marginLeft: -7, backgroundColor: '#FFFFFF' }]} />
          <View style={[styles.mark, { left: 0 }]}>
            <T w="bold" size={13} color="#FFFFFF">
              {a.day.short}
            </T>
          </View>
          <View style={[styles.mark, { left: '52%' }]}>
            <T w="bold" size={13} color="#FFFFFF">
              {a.night.short}
            </T>
          </View>
          <T size={12} color="rgba(255,255,255,0.72)" style={[styles.hour, { left: 0 }]}>07</T>
          <T size={12} color="rgba(255,255,255,0.72)" style={[styles.hour, { left: '31%' }]}>12</T>
          <T size={12} color="rgba(255,255,255,0.72)" style={[styles.hour, { left: '61%' }]}>16</T>
          <T size={12} color="rgba(255,255,255,0.72)" style={[styles.hour, { right: 0 }]}>07</T>
        </View>
      </Pressable>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable onPress={() => router.push('/paamindelser')} style={styles.tile} accessibilityRole="button">
          <View style={[styles.tileIcon, { backgroundColor: colors.accentTint }]}>
            <Feather name="bell" size={20} color={colors.accent} />
          </View>
          <T w="medium" size={14} color={colors.muted}>
            Påmindelser
          </T>
          <T w="heavy" size={22} style={{ letterSpacing: -0.4 }}>
            {thisWeek.length} denne uge
          </T>
          {next ? (
            <T w="semibold" size={14} color={daysUntil(next.date, today) <= 1 ? colors.red : colors.muted}>
              {next.title.split(' – ')[0]} {relativeDay(next.date, today).toLowerCase()}
              {next.time ? ` kl. ${next.time}` : ''}
            </T>
          ) : (
            <T size={14} color={colors.muted}>
              Intet på programmet
            </T>
          )}
        </Pressable>
        <Pressable onPress={() => router.push('/paamindelser')} style={styles.tile} accessibilityRole="button">
          <View style={[styles.tileIcon, { backgroundColor: colors.roseTint }]}>
            <Feather name="award" size={20} color={colors.rose} />
          </View>
          <T w="medium" size={14} color={colors.muted}>
            Næste stævne
          </T>
          <T w="heavy" size={22} style={{ letterSpacing: -0.4 }}>
            {nextShow ? relativeDay(nextShow.date, today) : 'Intet planlagt'}
          </T>
          {nextShow ? (
            <T size={14} color={colors.muted} numberOfLines={2}>
              {(nextShow.note ?? nextShow.title).split(' · ')[0]} · {horseName(nextShow.horseId)}
            </T>
          ) : null}
        </Pressable>
      </View>

      <Card style={{ gap: 12 }}>
        <View style={styles.row}>
          <T w="bold">Vejret ved stalden</T>
          <T size={13} color={colors.muted}>
            {forecast.status === 'live' ? (forecast.usingLocation ? 'Din placering' : 'Fyn') : forecast.status === 'loading' ? 'Henter…' : 'Eksempelvejr'}
          </T>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Stat icon="sun" label="I dag" value={`${deg(a.dayWeather.minTemp)} · føles ${deg(a.dayWeather.minFeelsLike)}`} />
          <Stat icon="moon" label="I nat" value={`${deg(a.nightWeather.minTemp)} · føles ${deg(a.nightWeather.minFeelsLike)}`} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Stat icon="cloud-rain" label="Regn" value={a.rain ? `Kl. ${a.rain}` : 'Tørvejr'} />
          <Stat icon="wind" label="Vind" value={`Op til ${Math.round(Math.max(a.dayWeather.maxWind, a.nightWeather.maxWind))} m/s`} />
        </View>
      </Card>

      <Card style={{ gap: 12 }}>
        <T w="bold">Dine heste i dag</T>
        {horses.map((h) => (
          <HorseLine key={h.id} id={h.id} />
        ))}
      </Card>
    </Screen>
  );
}

function Stat({ icon, label, value }: { icon: 'sun' | 'moon' | 'cloud-rain' | 'wind'; label: string; value: string }) {
  return (
    <View style={{ flex: 1, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
      <View style={[styles.statIcon]}>
        <Feather name={icon} size={16} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <T size={12} color={colors.muted}>
          {label}
        </T>
        <T w="semibold" size={14}>
          {value}
        </T>
      </View>
    </View>
  );
}

function HorseLine({ id }: { id: string }) {
  const { horses, selectHorse } = useApp();
  const router = useRouter();
  const h = horses.find((x) => x.id === id)!;
  const a = useAdvice(h);
  const c = horseColors(h.colorIndex);
  return (
    <Pressable
      onPress={() => {
        selectHorse(h.id);
        router.push('/daekken');
      }}
      accessibilityRole="button"
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 }}
    >
      <Avatar letter={h.name} color={c.color} size={36} />
      <View style={{ flex: 1 }}>
        <T w="bold">{h.name}</T>
        <T size={13} color={colors.muted}>
          Dag: {a.day.short} · Nat: {a.night.short}
        </T>
      </View>
      <Feather name="chevron-right" size={18} color={colors.faint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  weatherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hero: { backgroundColor: colors.navy, borderRadius: 28, padding: 20, gap: 16, overflow: 'hidden' },
  heroTag: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.38)' },
  track: { position: 'absolute', top: 34, height: 4, borderRadius: 2 },
  dot: { position: 'absolute', top: 29, width: 14, height: 14, borderRadius: 7, borderWidth: 3, borderColor: colors.navy },
  mark: { position: 'absolute', top: 0, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.14)' },
  hour: { position: 'absolute', top: 48 },
  tile: { flex: 1, backgroundColor: colors.card, borderRadius: 24, padding: 16, gap: 8 },
  tileIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  statIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accentTint, alignItems: 'center', justifyContent: 'center' },
});
