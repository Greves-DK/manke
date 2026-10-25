// Dækkenmotoren: vejledende regler for dækkenvalg ud fra vejr og hest.
// Reglerne er beskrevet i docs/daekken-regler.md. Ingen afhængigheder, så den kan testes med Node.

export type HorseType = 'varmblod' | 'fuldblod' | 'koldblod' | 'nordisk' | 'pony';
export type Clip = 'uklippet' | 'delvist' | 'helt';
export type ColdSense = 'fryser' | 'normal' | 'sveder';
export type Housing = 'ude' | 'inde';
export type BlanketKind = 'regn' | 'stald';

export interface HorseProfile {
  name: string;
  type: HorseType;
  age: number;
  clip: Clip;
  cold: ColdSense;
  /** Hvor hesten står om dagen (07–16) og om natten (16–07). */
  day: Housing;
  night: Housing;
  /** Personlig justering i trin ud fra brugerens feedback, fra −2 til +2. */
  offset?: number;
}

export interface Blanket {
  id: string;
  kind: BlanketKind;
  grams: number;
  neck?: boolean;
  /** Fri tekst, fx farve. */
  note?: string;
}

export interface PeriodWeather {
  minTemp: number;
  minFeelsLike: number;
  maxWind: number;
  rainMm: number;
}

export interface Reason {
  title: string;
  detail: string;
  /** 'grundlag' er udgangspunktet. Ellers ændringen i trin. */
  delta: number | 'grundlag';
}

export interface Advice {
  /** 0 = intet dækken, 1 = 0 g, 2 = 50 g … 7 = 300 g med hals. */
  step: number;
  kind: BlanketKind | null;
  grams: number | null;
  neck: boolean;
  label: string;
  short: string;
  blanket?: Blanket;
  missing?: string;
  reasons: Reason[];
}

export const STEP_GRAMS: readonly (number | null)[] = [null, 0, 50, 100, 150, 200, 300, 300];
export const MAX_STEP = 7;
export const RAIN_MM = 0.5;

const TYPE_NAMES: Record<HorseType, string> = {
  varmblod: 'Varmblod',
  fuldblod: 'Fuldblod',
  koldblod: 'Koldblod',
  nordisk: 'Islænder / fjord',
  pony: 'Pony',
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function deg(n: number): string {
  const r = Math.round(n);
  return (r < 0 ? '−' + Math.abs(r) : String(r)) + '°';
}

/** Udgangspunktet ud fra "føles som"-temperaturen og klip. */
export function baseStep(feels: number, clip: Clip): number {
  if (clip === 'uklippet') {
    if (feels >= 5) return 0;
    if (feels >= 0) return 2;
    if (feels >= -5) return 3;
    return 5;
  }
  let s: number;
  if (feels >= 15) s = 0;
  else if (feels >= 10) s = 2;
  else if (feels >= 5) s = 3;
  else if (feels >= 0) s = 5;
  else if (feels >= -5) s = 6;
  else s = MAX_STEP;
  return clip === 'delvist' ? Math.max(0, s - 1) : s;
}

function clipTitle(clip: Clip): string {
  if (clip === 'helt') return 'Klippet';
  if (clip === 'delvist') return 'Delvist klippet';
  return 'Uklippet';
}

export function stepLabel(step: number, kind: BlanketKind | null, grams?: number | null, neck?: boolean): { label: string; short: string } {
  if (step <= 0 || kind === null) return { label: 'Intet dækken', short: 'Intet' };
  const g = grams ?? STEP_GRAMS[step] ?? 0;
  const noun = kind === 'stald' ? 'stalddækken' : 'regndækken';
  return {
    label: `${g} g ${noun}${neck ? ' med hals' : ''}`,
    short: `${g} g ${kind === 'stald' ? 'stald' : 'regn'}`,
  };
}

/** Vælg det dækken i skabet, der ligger tættest på det anbefalede. */
export function pickBlanket(blankets: Blanket[], kind: BlanketKind, grams: number, neck: boolean): { blanket?: Blanket; missing?: string } {
  let pool = blankets.filter((b) => b.kind === kind);
  if (pool.length === 0 && kind === 'stald') pool = blankets.filter((b) => b.kind === 'regn');
  if (pool.length === 0) return {};
  const sorted = [...pool].sort((a, b) => {
    const da = Math.abs(a.grams - grams);
    const db = Math.abs(b.grams - grams);
    if (da !== db) return da - db;
    if (neck && Boolean(a.neck) !== Boolean(b.neck)) return a.neck ? -1 : 1;
    return b.grams - a.grams;
  });
  const blanket = sorted[0];
  let missing: string | undefined;
  if (blanket.grams !== grams) {
    missing = `Du har ikke et dækken på ${grams} g. ${blanket.grams} g er det nærmeste.`;
  } else if (neck && !blanket.neck) {
    missing = 'Et dækken med hals ville være bedre i den her kulde.';
  }
  return { blanket, missing };
}

export function advise(horse: HorseProfile, w: PeriodWeather, housing: Housing, blankets: Blanket[] = []): Advice {
  const reasons: Reason[] = [];
  const windNote = w.minTemp - w.minFeelsLike >= 2 ? ` på grund af vind (${Math.round(w.maxWind)} m/s)` : '';

  let step = baseStep(w.minFeelsLike, horse.clip);
  reasons.push({
    delta: 'grundlag',
    title: clipTitle(horse.clip),
    detail: `Det føles som ${deg(w.minFeelsLike)}${windNote}.`,
  });

  const raining = housing === 'ude' && w.rainMm >= RAIN_MM;
  if (raining) {
    step += 1;
    reasons.push({ delta: 1, title: 'Regn', detail: 'Våd pels isolerer dårligt. Dækkenet skal være vandtæt.' });
  }

  if ((horse.type === 'nordisk' || horse.type === 'pony') && horse.clip === 'uklippet') {
    step -= 1;
    reasons.push({ delta: -1, title: TYPE_NAMES[horse.type], detail: 'Tyk vinterpels holder godt på varmen.' });
  }

  if (horse.cold === 'fryser') {
    step += 1;
    reasons.push({ delta: 1, title: 'Fryser let', detail: 'Du har markeret, at hesten hurtigt fryser.' });
  } else if (horse.cold === 'sveder') {
    step -= 1;
    reasons.push({ delta: -1, title: 'Sveder let', detail: 'Du har markeret, at hesten hurtigt bliver for varm.' });
  }

  if (horse.age > 20) {
    step += 1;
    reasons.push({ delta: 1, title: 'Over 20 år', detail: 'Ældre heste holder dårligere på varmen.' });
  }

  if (housing === 'inde') {
    step -= 1;
    reasons.push({ delta: -1, title: 'Inde i stalden', detail: 'Stalddækken, et trin lettere end ude i vind og vejr.' });
  }

  const offset = clamp(Math.round(horse.offset ?? 0), -2, 2);
  if (offset !== 0) {
    step += offset;
    reasons.push({ delta: offset, title: 'Din feedback', detail: offset > 0 ? 'Rådet var for koldt tidligere.' : 'Rådet var for varmt tidligere.' });
  }

  step = clamp(step, 0, MAX_STEP);
  const kind: BlanketKind | null = step === 0 ? null : housing === 'inde' ? 'stald' : 'regn';
  const neck = step === MAX_STEP;
  const target = STEP_GRAMS[step];

  let blanket: Blanket | undefined;
  let missing: string | undefined;
  if (kind !== null && target !== null && blankets.length > 0) {
    const picked = pickBlanket(blankets, kind, target, neck);
    blanket = picked.blanket;
    missing = picked.missing;
  }

  const shownKind = blanket ? blanket.kind : kind;
  const grams = blanket ? blanket.grams : target;
  const { label, short } = stepLabel(step, shownKind, grams, blanket ? Boolean(blanket.neck) : neck);
  return { step, kind: shownKind, grams, neck: blanket ? Boolean(blanket.neck) : neck, label, short, blanket, missing, reasons };
}
