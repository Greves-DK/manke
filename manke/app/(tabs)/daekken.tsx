import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { HorseChips } from '@/components/HorseChips';
import { Card, Heading, Pill, Screen, Segmented, T } from '@/components/ui';
import type { Advice, Reason } from '@/logic/blanket';
import { hourOf } from '@/logic/weather';
import { longDate } from '@/lib/dates';
import { useApp } from '@/state/AppState';
import type { Feedback } from '@/state/types';
import { useAdvice } from '@/state/useAdvice';
import { colors } from '@/theme';

function deg(n: number) {
  const r = Math.round(n);
  return (r < 0 ? '−' + Math.abs(r) : String(r)) + '°';
}

function kindText(a: Advice): string {
  if (a.step === 0) return 'Pelsen klarer det';
  return a.kind === 'stald' ? 'Stalddækken' : 'Regndækken';
}

function band(a: Advice, night: boolean) {
  if (a.step === 0) return { bg: colors.bg, fg: colors.muted, border: true };
  return night ? { bg: colors.navy, fg: '#FFFFFF', border: false } : { bg: colors.accentTint, fg: colors.accentInk, border: false };
}

function deltaPill(r: Reason) {
  if (r.delta === 'grundlag') return { text: 'Grundlag', bg: colors.segmentSoft, fg: colors.grey };
  if (r.delta > 0) return { text: `+${r.delta} trin`, bg: colors.amberTint, fg: colors.amber };
  if (r.delta < 0) return { text: `−${Math.abs(r.delta)} trin`, bg: colors.greenTint, fg: colors.green };
  return { text: 'Info', bg: colors.segmentSoft, fg: colors.grey };
}

const FEEDBACK: { value: Feedback; label: string }[] = [
  { value: 'kold', label: 'For kold' },
  { value: 'ok', label: 'Passede' },
  { value: 'varm', label: 'For varm' },
];

export default function Daekken() {
  const { today, selected, forecast, giveFeedback } = useApp();
  const a = useAdvice(selected);
  const [period, setPeriod] = useState<'dag' | 'nat'>('dag');
  const [given, setGiven] = useState<{ horseId: string; value: Feedback } | null>(null);
  const shown = period === 'dag' ? a.day : a.night;
  const dayBand = band(a.day, false);
  const nightBand = band(a.night, true);
  const updated = forecast.updated ? `opdateret ${String(forecast.updated.getHours()).padStart(2, '0')}.${String(forecast.updated.getMinutes()).padStart(2, '0')}` : forecast.status === 'sample' ? 'eksempelvejr' : 'henter vejret';

  return (
    <Screen>
      <View style={{ gap: 2 }}>
        <T w="medium" color={colors.muted}>
          {longDate(today)} · {updated}
        </T>
        <Heading>Dækken</Heading>
      </View>

      <HorseChips />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Card style={{ flex: 1, gap: 6 }}>
          <View style={styles.periodHead}>
            <View style={[styles.periodIcon, { backgroundColor: colors.amberTint }]}>
              <Feather name="sun" size={17} color={colors.amber} />
            </View>
            <T w="bold">I dag</T>
            <T size={13} color={colors.muted} style={{ marginLeft: 'auto' }}>
              07–16
            </T>
          </View>
          <T w="heavy" size={32} style={{ letterSpacing: -0.8, marginTop: 4 }}>
            {a.day.step === 0 ? 'Intet' : `${a.day.grams} g`}
          </T>
          <T w="semibold">{kindText(a.day)}</T>
          <T size={13} color={colors.muted}>
            {deg(a.dayWeather.minTemp)} · føles som {deg(a.dayWeather.minFeelsLike)}
            {a.dayWeather.rainMm >= 0.5 ? ' · regn' : ''}
          </T>
        </Card>
        <Card dark style={{ flex: 1, gap: 6 }}>
          <View style={styles.periodHead}>
            <View style={[styles.periodIcon, { backgroundColor: 'rgba(255,255,255,0.14)' }]}>
              <Feather name="moon" size={17} color="#FFFFFF" />
            </View>
            <T w="bold" color="#FFFFFF">
              I nat
            </T>
            <T size={13} color="rgba(255,255,255,0.75)" style={{ marginLeft: 'auto' }}>
              16–07
            </T>
          </View>
          <T w="heavy" size={32} color="#FFFFFF" style={{ letterSpacing: -0.8, marginTop: 4 }}>
            {a.night.step === 0 ? 'Intet' : `${a.night.grams} g`}
          </T>
          <T w="semibold" color="#FFFFFF">
            {kindText(a.night)}
          </T>
          <T size={13} color="rgba(255,255,255,0.78)">
            {selected.night === 'inde' ? `Inde i stalden · ${deg(a.nightWeather.minTemp)} ude` : `${deg(a.nightWeather.minTemp)} · føles som ${deg(a.nightWeather.minFeelsLike)}`}
          </T>
        </Card>
      </View>

      {a.day.missing || a.night.missing ? (
        <Card style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: colors.amberTint }}>
          <Feather name="info" size={18} color={colors.amber} style={{ marginTop: 1 }} />
          <T size={14} color={colors.amber} style={{ flex: 1 }}>
            {a.day.missing ?? a.night.missing}
          </T>
        </Card>
      ) : null}

      <Card style={{ gap: 12, paddingHorizontal: 14 }}>
        <View style={styles.row}>
          <T w="bold">Time for time</T>
          {a.rain ? <Pill text={`Regn ${a.rain}`} bg={colors.accentTint} fg={colors.accentInk} /> : <Pill text="Tørvejr" bg={colors.segmentSoft} fg={colors.grey} />}
        </View>
        <View style={{ flexDirection: 'row' }}>
          {a.hours.map((p) => (
            <View key={p.time} style={{ flex: 1, alignItems: 'center', gap: 6 }}>
              <T size={12} color={colors.muted}>
                {String(hourOf(p)).padStart(2, '0')}
              </T>
              <Feather name={p.rain >= 0.1 ? 'cloud-rain' : 'cloud'} size={19} color={p.rain >= 0.1 ? colors.accent : colors.faint} />
              <T w="bold" style={{ fontVariant: ['tabular-nums'] }}>
                {deg(p.temp)}
              </T>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <View style={[styles.band, { flex: 3, backgroundColor: dayBand.bg }, dayBand.border && styles.bandEmpty]}>
            <T w="bold" size={12} color={dayBand.fg} numberOfLines={1}>
              {a.day.short}
            </T>
          </View>
          <View style={[styles.band, { flex: 5, backgroundColor: nightBand.bg }, nightBand.border && styles.bandEmpty]}>
            <T w="bold" size={12} color={nightBand.fg} numberOfLines={1}>
              {a.night.step === 0 ? a.night.short : a.night.label}
            </T>
          </View>
        </View>
      </Card>

      <Card style={{ gap: 10 }}>
        <View style={styles.row}>
          <T w="heavy" size={17} accessibilityRole="header">
            Hvorfor dette råd
          </T>
        </View>
        <Segmented
          label="Vis begrundelse for"
          value={period}
          onChange={setPeriod}
          options={[
            { value: 'dag', label: 'I dag' },
            { value: 'nat', label: 'I nat' },
          ]}
        />
        {shown.reasons.map((r, i) => {
          const p = deltaPill(r);
          return (
            <View key={`${r.title}-${i}`} style={{ flexDirection: 'row', gap: 12, paddingVertical: 6, alignItems: 'flex-start' }}>
              <View style={{ width: 78, paddingVertical: 4, borderRadius: 10, backgroundColor: p.bg, alignItems: 'center', marginTop: 1 }}>
                <T w="bold" size={12} color={p.fg}>
                  {p.text}
                </T>
              </View>
              <View style={{ flex: 1 }}>
                <T w="bold">{r.title}</T>
                <T size={13} color={colors.muted} style={{ lineHeight: 18 }}>
                  {r.detail}
                </T>
              </View>
            </View>
          );
        })}
      </Card>

      <Card style={{ gap: 10 }}>
        <T w="bold">Passede rådet i går?</T>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {FEEDBACK.map((f) => {
            const on = given?.horseId === selected.id && given.value === f.value;
            return (
              <Pressable
                key={f.value}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                onPress={() => {
                  if (given?.horseId === selected.id) return;
                  giveFeedback(selected.id, f.value);
                  setGiven({ horseId: selected.id, value: f.value });
                }}
                style={[styles.fbBtn, on ? { backgroundColor: colors.accent, borderColor: colors.accent } : null]}
              >
                <T w="bold" size={14} color={on ? '#FFFFFF' : colors.ink}>
                  {f.label}
                </T>
              </Pressable>
            );
          })}
        </View>
        {given?.horseId === selected.id ? (
          <T w="semibold" size={13} color={colors.green}>
            {given.value === 'ok' ? `Godt. Rådet for ${selected.name} forbliver det samme.` : `Tak. Rådet for ${selected.name} er justeret.`}
          </T>
        ) : null}
        <T size={12} color={colors.muted} style={{ lineHeight: 17 }}>
          Rådet er vejledende. Mærk efter under dækkenet: varm og fugtig betyder for meget.
        </T>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  periodHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  periodIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  band: { height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  bandEmpty: { borderWidth: 1, borderStyle: 'dashed', borderColor: '#B9BDD0' },
  fbBtn: { flex: 1, height: 44, borderRadius: 22, borderWidth: 2, borderColor: colors.border, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
});
