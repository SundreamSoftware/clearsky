import { useRef, useState } from 'react';
import { AirQualityMap } from '@/features/air-quality/components/AirQualityMap';
import { StationDetailsPanel } from '@/features/air-quality/components/StationDetailsPanel';
import { StationSearch } from '@/features/air-quality/components/StationSearch';
import { useStations } from '@/features/air-quality/hooks/useStations';
import { useGlobalStations } from '@/features/air-quality/hooks/useGlobalStations';
import type { MapBounds } from '@/features/air-quality/hooks/useGlobalStations';
import type { Station } from '@/features/air-quality/model/station.types';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { ErrorState } from '@/shared/components/ErrorState';
import { Layout } from '@/shared/components/Layout';

const POLAND_BBOX = { minLon: 14.1, minLat: 49.0, maxLon: 24.2, maxLat: 54.9 };

function isInPoland(station: Station): boolean {
  return (
    station.latitude >= POLAND_BBOX.minLat &&
    station.latitude <= POLAND_BBOX.maxLat &&
    station.longitude >= POLAND_BBOX.minLon &&
    station.longitude <= POLAND_BBOX.maxLon
  );
}

/**
 * Clamps map bounds to valid lat/lon ranges.
 * Leaflet wraps longitude > 180° when the user zooms out to see multiple world copies;
 * the WAQI API rejects coordinates outside [-180, 180] / [-90, 90].
 */
function clampMapBounds(bounds: MapBounds): MapBounds {
  const lonSpan = bounds.maxLon - bounds.minLon;
  // If the viewport spans ≥ 360° (whole world or map tiled multiple times), use global bounds.
  if (lonSpan >= 360) {
    return {
      minLat: Math.max(-90, bounds.minLat),
      maxLat: Math.min(90, bounds.maxLat),
      minLon: -180,
      maxLon: 180,
    };
  }
  return {
    minLat: Math.max(-90, bounds.minLat),
    maxLat: Math.min(90, bounds.maxLat),
    minLon: Math.max(-180, bounds.minLon),
    maxLon: Math.min(180, bounds.maxLon),
  };
}

// Pre-compute the Europe view bounding box so WAQI starts loading immediately on mount,
// in parallel with the GIOŚ fetch, instead of waiting for the map to render and fire bounds.
const INITIAL_BOUNDS: MapBounds = { minLat: 25, maxLat: 72, minLon: -25, maxLon: 50 };

function App() {
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [selectedSensorId, setSelectedSensorId] = useState<number | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds>(INITIAL_BOUNDS);
  const boundsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: giosStations = [], isLoading, error } = useStations();
  const { data: globalStations = [], isError: isWaqiError } = useGlobalStations(mapBounds);

  // WAQI stations inside Poland are excluded to avoid duplicating GIOŚ coverage.
  const filteredGlobalStations = globalStations.filter((s) => !isInPoland(s));
  const allStations = [...giosStations, ...filteredGlobalStations];

  if (import.meta.env.DEV) {
    console.debug('[ClearSky] stations', {
      gios: giosStations.length,
      waqiRaw: globalStations.length,
      waqiOutsidePoland: filteredGlobalStations.length,
      total: allStations.length,
      bounds: mapBounds,
      waqiError: isWaqiError,
    });
  }

  const selectedStation = allStations.find((station) => station.id === selectedStationId) ?? null;

  function handleStationSelect(station: Station) {
    setSelectedStationId(station.id);
    setSelectedSensorId(null);
  }

  function handleMapStationSelect(stationId: string) {
    setSelectedStationId(stationId);
    setSelectedSensorId(null);
  }

  function handleBoundsChange(bounds: MapBounds) {
    if (boundsDebounceRef.current) {
      clearTimeout(boundsDebounceRef.current);
    }
    boundsDebounceRef.current = setTimeout(() => {
      const clamped = clampMapBounds(bounds);
      if (import.meta.env.DEV) {
        console.debug('[ClearSky] map bounds update', { raw: bounds, clamped });
      }
      setMapBounds(clamped);
    }, 500);
  }

  function handleClose() {
    setSelectedStationId(null);
    setSelectedSensorId(null);
  }

  return (
    <Layout
      header={<StationSearch stations={allStations} onStationSelect={handleStationSelect} />}
    >
      <div className="relative flex-1">
        <ErrorBoundary fallback={<ErrorState message="Wystąpił błąd mapy. Odśwież stronę." />}>
          <AirQualityMap
            stations={allStations}
            selectedStation={selectedStation}
            selectedStationId={selectedStationId}
            onStationSelect={handleMapStationSelect}
            onBoundsChange={handleBoundsChange}
            isLoading={isLoading}
            error={error instanceof Error ? error : null}
            waqiError={isWaqiError}
          />
        </ErrorBoundary>
      </div>

      {selectedStation && (
        <div className="fixed bottom-0 left-0 right-0 z-40 h-2/3 overflow-y-auto rounded-t-2xl bg-[var(--bg)] shadow-2xl lg:static lg:z-30 lg:flex lg:h-full lg:w-96 lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:rounded-none lg:border-l lg:border-[var(--border)] lg:bg-[var(--bg)] lg:shadow-lg">
          <div className="mx-auto mb-1 mt-3 h-1 w-10 rounded-full bg-[var(--border)] lg:hidden" />
          <ErrorBoundary fallback={<ErrorState message="Nie można załadować szczegółów stacji." />}>
            <StationDetailsPanel
              station={selectedStation}
              selectedSensorId={selectedSensorId}
              onSensorSelect={setSelectedSensorId}
              onClose={handleClose}
            />
          </ErrorBoundary>
        </div>
      )}
    </Layout>
  );
}

export default App;
