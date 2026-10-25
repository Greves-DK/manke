// Eksempeldata, så appen viser noget fra første start. Erstattes af brugerens egne data.
import { addDays } from '@/lib/dates';
import { localDateString } from '@/logic/weather';
import type { Contact, Horse, Person, Reminder } from '@/state/types';

export function sampleHorses(): Horse[] {
  return [
    {
      id: 'bella', name: 'Bella', breed: 'Dansk Varmblod', gender: 'hoppe', age: 12,
      type: 'varmblod', clip: 'helt', cold: 'normal', day: 'ude', night: 'inde', colorIndex: 0,
      blankets: [
        { id: 'bella-r0', kind: 'regn', grams: 0, note: 'Uden fyld · grå' },
        { id: 'bella-r50', kind: 'regn', grams: 50, note: 'Let · sort' },
        { id: 'bella-r150', kind: 'regn', grams: 150, note: 'Mellem · navy' },
        { id: 'bella-s200', kind: 'stald', grams: 200, note: 'Til boksen · bordeaux' },
        { id: 'bella-r300', kind: 'regn', grams: 300, neck: true, note: 'Til frost · sort' },
      ],
    },
    {
      id: 'smilla', name: 'Smilla', breed: 'Islænder', gender: 'hoppe', age: 18,
      type: 'nordisk', clip: 'uklippet', cold: 'normal', day: 'ude', night: 'ude', colorIndex: 1,
      blankets: [
        { id: 'smilla-r0', kind: 'regn', grams: 0, note: 'Uden fyld' },
        { id: 'smilla-r100', kind: 'regn', grams: 100, note: 'Mellem' },
      ],
    },
    {
      id: 'kasper', name: 'Kasper', breed: 'Shetlandspony', gender: 'vallak', age: 7,
      type: 'pony', clip: 'uklippet', cold: 'sveder', day: 'ude', night: 'ude', colorIndex: 2,
      blankets: [
        { id: 'kasper-r0', kind: 'regn', grams: 0, note: 'Uden fyld' },
        { id: 'kasper-r50', kind: 'regn', grams: 50, note: 'Let' },
      ],
    },
  ];
}

export function sampleReminders(today: Date): Reminder[] {
  const d = (n: number) => localDateString(addDays(today, n));
  return [
    { id: 'r1', horseId: 'bella', kind: 'smed', title: 'Smed – skoning', date: d(1), time: '08.30', note: 'Hver 6. uge', done: false },
    { id: 'r2', horseId: 'smilla', kind: 'orm', title: 'Send gødningsprøve', date: d(3), note: 'Ormekontrol', done: false },
    { id: 'r3', horseId: 'bella', kind: 'vaccine', title: 'Influenza-vaccination', date: d(5), time: '10.00', note: 'Anne Holm', done: false },
    { id: 'r4', horseId: 'bella', kind: 'staevne', title: 'Klubstævne', date: d(13), note: 'Dressur LB · husk hestepas', done: false },
    { id: 'r5', horseId: 'kasper', kind: 'tand', title: 'Tandeftersyn', date: d(25), done: false },
    { id: 'r6', horseId: 'kasper', kind: 'orm', title: 'Ormekur givet', date: d(-5), done: true },
  ];
}

/** Telefonnumre er tomme med vilje, så ingen ringer til et tilfældigt nummer. */
export const sampleContacts: Contact[] = [
  { id: 'c1', role: 'Dyrlæge', name: 'Anne Holm', org: 'Hestepraksis Syd', phone: '' },
  { id: 'c2', role: 'Smed', name: 'Henrik Lund', org: 'Hver 6. uge', phone: '' },
];

export const samplePeople: Person[] = [
  { id: 'p1', name: 'Sofie', role: 'Part', status: 'aktiv', color: '#7B4FD6' },
  { id: 'p2', name: 'Jonas', role: 'Staldpasser', status: 'inviteret', color: '#236E93' },
];
