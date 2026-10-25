import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { sampleContacts, sampleHorses, samplePeople, sampleReminders } from '@/data/sample';
import { useForecast, type ForecastState } from '@/data/forecast';
import { horsePalette } from '@/theme';
import type { Contact, Feedback, Horse, Person, Reminder } from './types';

const STORAGE_KEY = 'manke:v1';

export type NewHorse = Omit<Horse, 'id' | 'colorIndex' | 'blankets'>;
export type NewReminder = Omit<Reminder, 'id' | 'done'>;

interface AppState {
  today: Date;
  horses: Horse[];
  selected: Horse;
  selectHorse: (id: string) => void;
  updateHorse: (id: string, patch: Partial<Horse>) => void;
  addHorse: (horse: NewHorse) => string;
  reminders: Reminder[];
  toggleReminder: (id: string) => void;
  addReminder: (r: NewReminder) => void;
  contacts: Contact[];
  people: Person[];
  forecast: ForecastState;
  giveFeedback: (horseId: string, value: Feedback) => void;
  resetSample: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [today] = useState(() => new Date());
  const [horses, setHorses] = useState<Horse[]>(sampleHorses);
  const [reminders, setReminders] = useState<Reminder[]>(() => sampleReminders(new Date()));
  const [selectedId, setSelectedId] = useState<string>('bella');
  const hydrated = useRef(false);
  const forecast = useForecast();

  // Hent det gemte, når appen starter.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (Array.isArray(saved.horses) && saved.horses.length > 0) setHorses(saved.horses);
          if (Array.isArray(saved.reminders)) setReminders(saved.reminders);
          if (typeof saved.selectedId === 'string') setSelectedId(saved.selectedId);
        }
      } catch {
        // Ødelagt eller manglende data: vi starter med eksempeldata.
      } finally {
        hydrated.current = true;
      }
    })();
  }, []);

  // Gem ved hver ændring.
  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ horses, reminders, selectedId })).catch(() => {});
  }, [horses, reminders, selectedId]);

  const updateHorse = useCallback((id: string, patch: Partial<Horse>) => {
    setHorses((hs) => hs.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  }, []);

  const addHorse = useCallback((horse: NewHorse) => {
    const id = `h${Date.now()}`;
    setHorses((hs) => [...hs, { ...horse, id, colorIndex: hs.length % horsePalette.length, blankets: [] }]);
    setSelectedId(id);
    return id;
  }, []);

  const toggleReminder = useCallback((id: string) => {
    setReminders((rs) => rs.map((r) => (r.id === id ? { ...r, done: !r.done } : r)));
  }, []);

  const addReminder = useCallback((r: NewReminder) => {
    setReminders((rs) => [...rs, { ...r, id: `r${Date.now()}`, done: false }]);
  }, []);

  const giveFeedback = useCallback((horseId: string, value: Feedback) => {
    const change = value === 'kold' ? 1 : value === 'varm' ? -1 : 0;
    if (change === 0) return;
    setHorses((hs) =>
      hs.map((h) => (h.id === horseId ? { ...h, offset: Math.max(-2, Math.min(2, (h.offset ?? 0) + change)) } : h)),
    );
  }, []);

  const resetSample = useCallback(() => {
    setHorses(sampleHorses());
    setReminders(sampleReminders(new Date()));
    setSelectedId('bella');
  }, []);

  const selected = horses.find((h) => h.id === selectedId) ?? horses[0];

  const value = useMemo<AppState>(
    () => ({
      today,
      horses,
      selected,
      selectHorse: setSelectedId,
      updateHorse,
      addHorse,
      reminders,
      toggleReminder,
      addReminder,
      contacts: sampleContacts,
      people: samplePeople,
      forecast,
      giveFeedback,
      resetSample,
    }),
    [today, horses, selected, updateHorse, addHorse, reminders, toggleReminder, addReminder, forecast, giveFeedback, resetSample],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp skal bruges inden i AppProvider');
  return v;
}
