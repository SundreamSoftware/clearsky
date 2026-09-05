import { type RefObject, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { Map as LeafletMap } from 'leaflet';
import type { Station } from '@/features/air-quality/model/station.types';
import type { MapBounds } from '@/features/air-quality/hooks/useGlobalStations';
import {
  AQI_SCALE,
  US_AQI_SCALE,
} from '@/features/air-quality/utils/airQualityScale';
import { StationMarker } from './StationMarker';

interface AirQualityMapProps {
  stations: Station[];
  selectedStation: Station | null;
  selectedStationId: string | null;
  onStationSelect: (stationId: string) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
  isLoading: boolean;
  error: Error | null;
  waqiError?: boolean;
  source?: 'waqi' | 'gios';
  onSourceChange?: (source: 'waqi' | 'gios') => void;
  onRefresh?: () => void;
  failedStations?: number;
}

interface MapControllerProps {
  selectedStation: Station | null;
  onBoundsChange?: (bounds: MapBounds) => void;
}

function MapController({
  selectedStation,
  onBoundsChange,
}: MapControllerProps) {
  const map = useMap();
  const lastFlownStationIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      typeof ResizeObserver === 'undefined' ||
      typeof map.getContainer !== 'function'
    )
      return;
    const observer = new ResizeObserver(() =>
      map.invalidateSize({ pan: false }),
    );
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);

  // Fire bounds on initial mount so global stations load without user interaction
  useEffect(() => {
    if (onBoundsChange) {
      const b = map.getBounds();
      onBoundsChange({
        minLon: b.getWest(),
        minLat: b.getSouth(),
        maxLon: b.getEast(),
        maxLat: b.getNorth(),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useMapEvents({
    moveend: () => {
      if (onBoundsChange) {
        const b = map.getBounds();
        onBoundsChange({
          minLon: b.getWest(),
          minLat: b.getSouth(),
          maxLon: b.getEast(),
          maxLat: b.getNorth(),
        });
      }
    },
  });

  useEffect(() => {
    if (
      selectedStation &&
      selectedStation.id !== lastFlownStationIdRef.current
    ) {
      lastFlownStationIdRef.current = selectedStation.id;
      map.flyTo([selectedStation.latitude, selectedStation.longitude], 12, {
        duration: 0.8,
      });
    }
  }, [map, selectedStation]);

  return null;
}

const POLAND_CENTER: [number, number] = [52, 19];
const DEFAULT_ZOOM = 6;
const MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** Captures the Leaflet map instance into a ref so controls outside MapContainer can use it. */
function MapInstanceCapture({
  mapRef,
}: {
  mapRef: RefObject<LeafletMap | null>;
}) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
}

function MapLegend({ source }: { source: 'waqi' | 'gios' }) {
  return (
    <div className="absolute bottom-8 left-2 z-[1000] rounded-xl border border-[var(--border)] bg-[var(--bg)]/95 px-3 py-2.5 shadow-lg text-xs backdrop-blur-sm transition-colors">
      <p className="mb-2 font-semibold text-[var(--text)]">
        {source === 'waqi' ? 'US AQI · WAQI' : 'Polski indeks · GIOŚ'}
      </p>
      {(
        Object.entries(source === 'waqi' ? US_AQI_SCALE : AQI_SCALE) as [
          string,
          { name: string; colour: string },
        ][]
      ).map(([level, { name, colour }]) => (
        <div key={level} className="flex items-center gap-2 py-0.5">
          <span
            className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
            style={{ backgroundColor: colour }}
          />
          <span className="text-[var(--text-muted)]">{name}</span>
        </div>
      ))}
      <p className="mt-2 max-w-52 text-[var(--text-muted)]">
        Tylko odczyty z ostatnich 6 godzin.
      </p>
    </div>
  );
}

export function AirQualityMap({
  stations,
  selectedStation,
  selectedStationId,
  onStationSelect,
  onBoundsChange,
  isLoading,
  error,
  waqiError,
  source = 'waqi',
  onSourceChange,
  onRefresh,
  failedStations = 0,
}: AirQualityMapProps) {
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const [tileError, setTileError] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [locating, setLocating] = useState(false);

  function handleLocate() {
    setLocationError(false);
    if (!navigator.geolocation) {
      setLocationError(true);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapInstanceRef.current?.flyTo(
          [pos.coords.latitude, pos.coords.longitude],
          13,
          {
            duration: 1,
          },
        );
        setLocating(false);
      },
      () => {
        setLocating(false);
        setLocationError(true);
      },
      { timeout: 10_000 },
    );
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-lg shadow-md isolate"
      data-testid="map-container"
    >
      <div className="absolute left-14 right-3 top-3 z-[1000] flex flex-wrap items-start gap-2 pointer-events-none">
        <div className="pointer-events-auto rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 shadow-lg max-w-sm">
          <label className="text-sm font-semibold" htmlFor="data-source">
            Źródło pomiarów
          </label>
          <select
            id="data-source"
            value={source}
            onChange={(e) =>
              onSourceChange?.(e.target.value as 'waqi' | 'gios')
            }
            className="ml-2 rounded-md border border-[var(--border)] bg-[var(--bg)] text-sm py-1"
          >
            <option value="waqi">Świat · WAQI (US AQI)</option>
            <option value="gios">Polska · GIOŚ</option>
          </select>
          <div
            role="status"
            aria-live="polite"
            className="mt-2 text-sm text-[var(--text-muted)]"
          >
            {isLoading ? 'Ładowanie pomiarów… ' : ''}
            {stations.length} stacji z danymi
            {!isLoading && !stations.length && !error && !waqiError && (
              <p>
                Brak aktualnych pomiarów w tym obszarze. Przesuń mapę lub zmień
                źródło.
              </p>
            )}
          </div>
          {(error || waqiError || failedStations > 0) && (
            <p
              role="alert"
              className="mt-2 text-sm text-amber-700 dark:text-amber-300"
            >
              {failedStations > 0
                ? `Nie pobrano ${failedStations} stacji.`
                : 'Nie udało się pobrać pomiarów.'}{' '}
              Pozostałe źródła są dostępne.
            </p>
          )}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="mt-2 text-sm underline disabled:opacity-50"
          >
            Odśwież pomiary
          </button>
        </div>
        {(tileError || locationError) && (
          <p
            role="alert"
            className="rounded-lg bg-[var(--bg)] p-3 text-sm shadow-lg"
          >
            {tileError
              ? 'Nie udało się pobrać podkładu mapy. Sprawdź połączenie.'
              : 'Nie udało się ustalić lokalizacji. Sprawdź uprawnienia przeglądarki.'}
          </p>
        )}
      </div>
      <MapContainer
        center={POLAND_CENTER}
        preferCanvas
        minZoom={3}
        maxBounds={[
          [-85, -180],
          [85, 180],
        ]}
        maxBoundsViscosity={1}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        data-testid="map"
      >
        <MapInstanceCapture mapRef={mapInstanceRef} />
        <MapController
          selectedStation={selectedStation}
          onBoundsChange={onBoundsChange}
        />
        <TileLayer
          attribution={MAP_ATTRIBUTION}
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          noWrap
          eventHandlers={{
            tileerror: () => setTileError(true),
            tileload: () => setTileError(false),
          }}
        />
        {stations
          .filter((station) => station.aqiLevel != null)
          .map((station) => (
            <StationMarker
              key={station.id}
              station={station}
              aqiLevel={station.aqiLevel ?? null}
              isSelected={station.id === selectedStationId}
              onSelect={onStationSelect}
            />
          ))}
      </MapContainer>

      {/* Locate-me button */}
      <button
        type="button"
        onClick={handleLocate}
        disabled={locating}
        aria-label="Przejdź do mojej lokalizacji"
        title="Przejdź do mojej lokalizacji"
        className="absolute bottom-8 right-2 z-[1000] flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg)]/95 text-[var(--text-muted)] shadow-lg backdrop-blur-sm transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50"
      >
        {locating ? (
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        ) : (
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="3" />
            <path strokeLinecap="round" d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            <path
              strokeLinecap="round"
              d="M12 9V2M12 22v-3M2 12h3M22 12h-3"
              opacity="0"
            />
          </svg>
        )}
      </button>

      <MapLegend source={source} />
    </div>
  );
}
