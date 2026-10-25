import type { Blanket, HorseProfile } from '@/logic/blanket';

export interface Horse extends HorseProfile {
  id: string;
  breed: string;
  gender: 'hoppe' | 'vallak' | 'hingst';
  colorIndex: number;
  blankets: Blanket[];
}

export type ReminderKind = 'smed' | 'orm' | 'vaccine' | 'staevne' | 'tand' | 'dyrlaege' | 'andet';

export interface Reminder {
  id: string;
  horseId: string;
  kind: ReminderKind;
  title: string;
  /** Lokal dato, "2026-10-26". */
  date: string;
  /** "08.30" */
  time?: string;
  note?: string;
  done: boolean;
}

export interface Contact {
  id: string;
  role: string;
  name: string;
  org?: string;
  phone: string;
}

export interface Person {
  id: string;
  name: string;
  role: string;
  status: 'aktiv' | 'inviteret';
  color: string;
}

export type Feedback = 'kold' | 'ok' | 'varm';
