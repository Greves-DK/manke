// Omsætter en timeprognose til perioderne "i dag" (07–16) og "i nat" (16–07).
// Ingen afhængigheder, så den kan testes med Node.

import type { PeriodWeather } from './blanket.ts';

export interface HourPoint {
  /** Lokal tid, fx "2026-10-25T07:00". */
  time: string;
  temp: number;
  feels: number;
  /** Nedbør i mm i den time. */
  rain: number;
  /** Vind i m/s. */
  wind: number;
}

export const DAY_START = 7;
export const NIGHT_START = 16;

export function localDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function nextDate(date: string): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function hourOf(p: HourPoint): number {
  return Number(p.time.slice(11, 13));
}

export function splitDayNight(points: HourPoint[], today: string): { day: HourPoint[]; night: HourPoint[] } {
  const tomorrow = nextDate(today);
  const day: HourPoint[] = [];
  const night: HourPoint[] = [];
  for (const p of points) {
    const date = p.time.slice(0, 10);
    const h = hourOf(p);
    if (date === today && h >= DAY_START && h < NIGHT_START) day.push(p);
    else if ((date === today && h >= NIGHT_START) || (date === tomorrow && h < DAY_START)) night.push(p);
  }
  return { day, night };
}

export function summarize(points: HourPoint[]): PeriodWeather {
  if (points.length === 0) return { minTemp: 10, minFeelsLike: 10, maxWind: 0, rainMm: 0 };
  let minTemp = Infinity;
  let minFeelsLike = Infinity;
  let maxWind = 0;
  let rainMm = 0;
  for (const p of points) {
    minTemp = Math.min(minTemp, p.temp);
    minFeelsLike = Math.min(minFeelsLike, p.feels);
    maxWind = Math.max(maxWind, p.wind);
    rainMm += p.rain;
  }
  return { minTemp, minFeelsLike, maxWind, rainMm: Math.round(rainMm * 10) / 10 };
}

/** Fx "14–22", eller null hvis det ikke regner. */
export function rainSpan(points: HourPoint[]): string | null {
  const wet = points.filter((p) => p.rain >= 0.1);
  if (wet.length === 0) return null;
  const first = hourOf(wet[0]);
  const last = (hourOf(wet[wet.length - 1]) + 1) % 24;
  return `${String(first).padStart(2, '0')}–${String(last).padStart(2, '0')}`;
}

/** Hver tredje time fra 07 til 04 til timeoversigten. */
export function stripHours(points: HourPoint[], today: string): HourPoint[] {
  const { day, night } = splitDayNight(points, today);
  const all = [...day, ...night];
  const wanted = [7, 10, 13, 16, 19, 22, 1, 4];
  return wanted
    .map((h) => all.find((p) => hourOf(p) === h))
    .filter((p): p is HourPoint => Boolean(p));
}

/** Eksempelvejr til når der ikke er net: en regnfuld oktoberdag. */
export function samplePoints(today: string): HourPoint[] {
  const temps = [5, 5, 4, 4, 4, 5, 5, 6, 7, 7, 8, 8, 9, 9, 9, 8, 8, 7, 6, 6, 5, 5, 4, 4];
  const night = [3, 3, 3, 2, 2, 2, 2, 3];
  const tomorrow = nextDate(today);
  const pts: HourPoint[] = [];
  for (let h = 0; h < 24; h++) {
    const rain = h >= 14 && h < 22 ? 0.8 : 0;
    const wind = h >= 12 ? 9 : 6;
    pts.push({ time: `${today}T${String(h).padStart(2, '0')}:00`, temp: temps[h], feels: temps[h] - (wind >= 9 ? 4 : 2), rain, wind });
  }
  for (let h = 0; h < 8; h++) {
    pts.push({ time: `${tomorrow}T${String(h).padStart(2, '0')}:00`, temp: night[h], feels: night[h] - 3, rain: 0, wind: 6 });
  }
  return pts;
}
