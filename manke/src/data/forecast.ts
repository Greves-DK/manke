// Henter en timeprognose for stalden. Falder tilbage til eksempelvejr uden net eller placering.
// Vejrdata: Open-Meteo (gratis til ikke-kommercielt brug). Skal skiftes til en kommerciel kilde, fx DMI, før lancering.
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { localDateString, samplePoints, type HourPoint } from '@/logic/weather';

export interface ForecastState {
  status: 'loading' | 'live' | 'sample';
  points: HourPoint[];
  updated?: Date;
  /** true når vi bruger din placering, false når vi bruger standardplaceringen. */
  usingLocation: boolean;
}

/** Midt på Fyn, hvis placering ikke er givet. */
const DEFAULT_COORDS = { latitude: 55.4, longitude: 10.39 };

export async function fetchForecast(latitude: number, longitude: number): Promise<HourPoint[]> {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${latitude.toFixed(2)}&longitude=${longitude.toFixed(2)}` +
    '&hourly=temperature_2m,apparent_temperature,precipitation,wind_speed_10m' +
    '&wind_speed_unit=ms&timezone=Europe%2FCopenhagen&forecast_days=3';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Vejret kunne ikke hentes (${res.status})`);
  const json = await res.json();
  const h = json.hourly;
  if (!h || !Array.isArray(h.time)) throw new Error('Uventet svar fra vejrtjenesten');
  return h.time.map((time: string, i: number) => ({
    time,
    temp: h.temperature_2m[i],
    feels: h.apparent_temperature[i],
    rain: h.precipitation[i] ?? 0,
    wind: h.wind_speed_10m[i] ?? 0,
  }));
}

async function findCoords(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const last = await Location.getLastKnownPositionAsync();
    const pos = last ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }));
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch {
    return null;
  }
}

export function useForecast(): ForecastState {
  const [state, setState] = useState<ForecastState>(() => ({
    status: 'loading',
    points: samplePoints(localDateString(new Date())),
    usingLocation: false,
  }));

  useEffect(() => {
    let alive = true;
    (async () => {
      const coords = await findCoords();
      const use = coords ?? DEFAULT_COORDS;
      try {
        const points = await fetchForecast(use.latitude, use.longitude);
        if (alive) setState({ status: 'live', points, updated: new Date(), usingLocation: coords !== null });
      } catch {
        if (alive) setState((s) => ({ ...s, status: 'sample' }));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
