const WEEKDAYS = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
const WEEKDAYS_SHORT = ['søn', 'man', 'tir', 'ons', 'tor', 'fre', 'lør'];
export const WEEKDAY_LETTERS = ['S', 'M', 'T', 'O', 'T', 'F', 'L'];
const MONTHS = ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'];
const MONTHS_SHORT = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "2026-10-25" til en lokal dato kl. 12, så sommertid ikke flytter dagen. */
export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
  r.setDate(r.getDate() + n);
  return r;
}

export function daysUntil(dateStr: string, today: Date): number {
  const a = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12).getTime();
  const b = parseDate(dateStr).getTime();
  return Math.round((b - a) / 86400000);
}

/** "Søndag 25. oktober" */
export function longDate(d: Date): string {
  return `${cap(WEEKDAYS[d.getDay()])} ${d.getDate()}. ${MONTHS[d.getMonth()]}`;
}

/** "Man 26. okt" */
export function shortDate(d: Date): string {
  return `${cap(WEEKDAYS_SHORT[d.getDay()])} ${d.getDate()}. ${MONTHS_SHORT[d.getMonth()]}`;
}

export function monthName(d: Date): string {
  return MONTHS[d.getMonth()];
}

/** "I dag", "I morgen" eller "Fre 30. okt". */
export function relativeDay(dateStr: string, today: Date): string {
  const n = daysUntil(dateStr, today);
  if (n === 0) return 'I dag';
  if (n === 1) return 'I morgen';
  if (n === -1) return 'I går';
  return shortDate(parseDate(dateStr));
}

export function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart) / 86400000 + 1) / 7);
}

export function greeting(d: Date): string {
  const h = d.getHours();
  if (h < 10) return 'Godmorgen';
  if (h < 17) return 'Goddag';
  return 'Godaften';
}
