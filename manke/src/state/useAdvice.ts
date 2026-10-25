import { useMemo } from 'react';
import { advise, type Advice, type PeriodWeather } from '@/logic/blanket';
import { localDateString, rainSpan, splitDayNight, stripHours, summarize, type HourPoint } from '@/logic/weather';
import { useApp } from './AppState';
import type { Horse } from './types';

export interface HorseAdvice {
  day: Advice;
  night: Advice;
  dayWeather: PeriodWeather;
  nightWeather: PeriodWeather;
  rain: string | null;
  hours: HourPoint[];
  /** Fx "Kl. 16: skift til 200 g stalddækken" eller null hvis intet skifter. */
  change: string | null;
}

export function changeText(day: Advice, night: Advice): string | null {
  if (day.label === night.label) return day.step === 0 ? 'Heller ikke i nat' : 'Samme dækken i nat';
  if (night.step === 0) return 'Kl. 16: tag dækkenet af';
  return `Kl. 16: skift til ${night.label}`;
}

export function useAdvice(horse: Horse): HorseAdvice {
  const { forecast, today } = useApp();
  return useMemo(() => {
    const date = localDateString(today);
    const { day, night } = splitDayNight(forecast.points, date);
    const dayWeather = summarize(day);
    const nightWeather = summarize(night);
    const d = advise(horse, dayWeather, horse.day, horse.blankets);
    const n = advise(horse, nightWeather, horse.night, horse.blankets);
    return {
      day: d,
      night: n,
      dayWeather,
      nightWeather,
      rain: rainSpan([...day, ...night]),
      hours: stripHours(forecast.points, date),
      change: changeText(d, n),
    };
  }, [horse, forecast.points, today]);
}

/** Temperaturen i den aktuelle time, hvis prognosen har den. */
export function currentHour(points: HourPoint[], now: Date): HourPoint | undefined {
  const key = `${localDateString(now)}T${String(now.getHours()).padStart(2, '0')}`;
  return points.find((p) => p.time.startsWith(key));
}
