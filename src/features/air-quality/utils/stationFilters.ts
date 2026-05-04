import type { Station } from '../model/station.types';

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
