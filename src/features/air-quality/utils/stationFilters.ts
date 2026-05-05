import type { Station } from '../model/station.types';
import type { AqiLevel } from './airQualityScale';

/** Text search across station name and city (case-insensitive). */
export function filterStations(stations: Station[], query: string): Station[] {
  if (!query.trim()) {
    return stations;
  }

  const lower = query.toLowerCase();

  return stations.filter(
    (station) =>
      station.name.toLowerCase().includes(lower) ||
      station.city.toLowerCase().includes(lower),
  );
}

/** Returns deduplicated, sorted list of non-null country codes present in the station list. */
export function getAvailableCountries(stations: Station[]): string[] {
  const seen = new Set<string>();
  for (const s of stations) {
    if (s.country) seen.add(s.country);
  }
  return [...seen].sort();
}

/**
 * Filters stations to those matching countryCode.
 * Passing null returns all stations (worldwide / no filter active).
 */
export function filterByCountry(stations: Station[], countryCode: string | null): Station[] {
  if (!countryCode) return stations;
  return stations.filter((s) => s.country === countryCode);
}

/**
 * Groups stations by voivodeship.
 * Stations with a null voivodeship are omitted (non-GIOŚ stations).
 */
export function groupByVoivodeship(stations: Station[]): Map<string, Station[]> {
  const groups = new Map<string, Station[]>();
  for (const s of stations) {
    if (!s.voivodeship) continue;
    const list = groups.get(s.voivodeship) ?? [];
    list.push(s);
    groups.set(s.voivodeship, list);
  }
  return groups;
}

/**
 * Computes the average AqiLevel for a group of stations.
 * Returns null when no station in the group has an aqiLevel set.
 */
export function avgAqiLevelForGroup(stations: Station[]): AqiLevel | null {
  const levels = stations
    .map((s) => s.aqiLevel)
    .filter((l): l is AqiLevel => l != null);
  if (levels.length === 0) return null;
  const avg = levels.reduce((sum: number, l) => sum + l, 0) / levels.length;
  // Clamp to valid AqiLevel range 0–5
  return Math.max(0, Math.min(5, Math.round(avg))) as AqiLevel;
}
