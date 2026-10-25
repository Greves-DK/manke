export const colors = {
  bg: '#F3F4FA',
  card: '#FFFFFF',
  ink: '#191C2B',
  muted: '#5F6478',
  faint: '#8A8FA3',
  line: '#EEF0F6',
  border: '#E1E3EE',
  segment: '#E6E8F2',
  segmentSoft: '#F0F1F6',
  accent: '#3F5BEA',
  accentTint: '#E8ECFF',
  accentInk: '#2E46C7',
  navy: '#1D2763',
  navySoft: '#8FA4FF',
  red: '#C2412D',
  green: '#1F6F51',
  greenTint: '#E3F4EC',
  amber: '#7A4700',
  amberTint: '#FFF1D6',
  rose: '#A3304F',
  roseTint: '#FCE8EE',
  grey: '#4A4F63',
  dim: '#4A4E62',
} as const;

export const fonts = {
  regular: 'Figtree-Regular',
  medium: 'Figtree-Medium',
  semibold: 'Figtree-SemiBold',
  bold: 'Figtree-Bold',
  heavy: 'Figtree-ExtraBold',
} as const;

export type FontWeight = keyof typeof fonts;

/** Hver hest får sin egen farve: fyld, lys baggrund og mørk tekst på den lyse baggrund. */
export const horsePalette = [
  { color: '#C2416A', tint: '#FCE8EE', ink: '#A3304F' },
  { color: '#237A5C', tint: '#E3F4EC', ink: '#1F6F51' },
  { color: '#94600A', tint: '#FFF1D6', ink: '#7A4700' },
  { color: '#3F5BEA', tint: '#E8ECFF', ink: '#2E46C7' },
  { color: '#7B4FD6', tint: '#EFE8FC', ink: '#5B34B0' },
  { color: '#236E93', tint: '#E2F0F7', ink: '#1B5674' },
] as const;

export function horseColors(index: number) {
  return horsePalette[((index % horsePalette.length) + horsePalette.length) % horsePalette.length];
}

export const shadow = {
  shadowColor: '#191C2B',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
} as const;
