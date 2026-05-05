import { useMemo } from 'react';
import type { Station } from '@/features/air-quality/model/station.types';
import {
  getAvailableCountries,
  filterByCountry,
  groupByVoivodeship,
  avgAqiLevelForGroup,
} from '@/features/air-quality/utils/stationFilters';
import { getAqiInfo } from '@/features/air-quality/utils/airQualityScale';

// ISO 3166-1 alpha-2 display names; extend as new data sources with country data are added.
const COUNTRY_NAMES: Record<string, string> = {
  PL: 'Polska',
  DE: 'Niemcy',
  CZ: 'Czechy',
  SK: 'Słowacja',
  UA: 'Ukraina',
  RU: 'Rosja',
  CN: 'Chiny',
  IN: 'Indie',
  US: 'USA',
};

function countryLabel(code: string): string {
  return COUNTRY_NAMES[code] ?? code;
}

export interface StationFilterBarProps {
  /** Full unfiltered station list — used to derive available filter options. */
  stations: Station[];
  selectedCountry: string | null;
  selectedVoivodeship: string | null;
  onCountryChange: (country: string | null) => void;
  onVoivodeshipChange: (voivodeship: string | null) => void;
}

export function StationFilterBar({
  stations,
  selectedCountry,
  selectedVoivodeship,
  onCountryChange,
  onVoivodeshipChange,
}: StationFilterBarProps) {
  // Derive country list from whichever sources have a non-null country code.
  const countries = useMemo(() => getAvailableCountries(stations), [stations]);

  // ── Voivodeship tier: only rendered when Poland is selected ──────────────
  const isPolandSelected = selectedCountry === 'PL';

  const voivodeshipGroups = useMemo(() => {
    if (!isPolandSelected) return new Map<string, Station[]>();
    // Only GIOŚ stations (country='PL') carry voivodeship metadata.
    return groupByVoivodeship(filterByCountry(stations, 'PL'));
  }, [stations, isPolandSelected]);

  const voivodeships = useMemo(
    () => [...voivodeshipGroups.keys()].sort(),
    [voivodeshipGroups],
  );

  function handleCountryChange(code: string) {
    const next = code || null;
    onCountryChange(next);
    // Reset voivodeship whenever the user switches away from Poland.
    if (next !== 'PL') onVoivodeshipChange(null);
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-gray-100 bg-white px-4 py-2">
      {/* ── Tier 1: global country / region filter ──────────────────────── */}
      <div className="flex items-center gap-1.5">
        <label
          htmlFor="country-filter"
          className="whitespace-nowrap text-xs font-medium text-gray-500"
        >
          Region:
        </label>
        <select
          id="country-filter"
          value={selectedCountry ?? ''}
          onChange={(e) => handleCountryChange(e.target.value)}
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand"
        >
          {/* Default option: no filter — shows all worldwide stations */}
          <option value="">Cały świat</option>
          {countries.map((code) => (
            <option key={code} value={code}>
              {countryLabel(code)}
            </option>
          ))}
        </select>
      </div>

      {/* ── Tier 2: voivodeship filter — visible only when Poland is selected ── */}
      {isPolandSelected && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="whitespace-nowrap text-xs font-medium text-gray-500">
            Województwo:
          </span>

          {/* "All voivodeships" chip */}
          <button
            type="button"
            onClick={() => onVoivodeshipChange(null)}
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
              !selectedVoivodeship
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Wszystkie
          </button>

          {voivodeships.map((name) => {
            const group = voivodeshipGroups.get(name)!;

            // Compute avg AQI level for this voivodeship.
            // Will be null for GIOŚ-only voivodeships until aqiLevel is populated.
            const avg = avgAqiLevelForGroup(group);
            const { colour, name: aqiName } = getAqiInfo(avg);
            const isActive = selectedVoivodeship === name;

            return (
              <button
                key={name}
                type="button"
                // Tooltip shows station count and current avg AQI quality label
                title={`${group.length} stacji · ${avg !== null ? aqiName : 'brak danych AQI'}`}
                onClick={() => onVoivodeshipChange(isActive ? null : name)}
                aria-pressed={isActive}
                className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
                  isActive ? 'ring-2 ring-blue-600 ring-offset-1' : 'hover:opacity-80'
                }`}
                // Background tinted with the AQI colour at ~13% opacity (hex suffix '22')
                style={{ backgroundColor: colour + '22', color: '#111827' }}
              >
                {/* AQI colour indicator dot */}
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: colour }}
                  aria-hidden="true"
                />
                {name}
                <span className="ml-0.5 text-gray-500">({group.length})</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
