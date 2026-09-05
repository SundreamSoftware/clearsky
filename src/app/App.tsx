import { useQueryClient } from '@tanstack/react-query';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { AirQualityMap } from '@/features/air-quality/components/AirQualityMap';
const StationDetailsPanel = lazy(() =>
  import('@/features/air-quality/components/StationDetailsPanel').then(
    (module) => ({ default: module.StationDetailsPanel }),
  ),
);
import { StationSearch } from '@/features/air-quality/components/StationSearch';
import { useVisibleGiosStations } from '@/features/air-quality/hooks/useVisibleGiosStations';
import { isCurrentReading } from '@/features/air-quality/utils/dataValidity';
import { useStations } from '@/features/air-quality/hooks/useStations';
import { useGlobalStations } from '@/features/air-quality/hooks/useGlobalStations';
import type { MapBounds } from '@/features/air-quality/hooks/useGlobalStations';
import type { Station } from '@/features/air-quality/model/station.types';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { ErrorState } from '@/shared/components/ErrorState';
import { Layout } from '@/shared/components/Layout';

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

// Start fetching the initial Poland viewport before Leaflet reports its exact bounds.
const INITIAL_BOUNDS: MapBounds = {
  minLat: 49,
  maxLat: 55,
  minLon: 14,
  maxLon: 25,
};

function App() {
  const queryClient = useQueryClient();
  const [source, setSource] = useState<'waqi' | 'gios'>('waqi');
  const [selection, setSelection] = useState<Station | null>(null);
  const [clock, setClock] = useState(() => Date.now());
  const [selectedStationId, setSelectedStationId] = useState<string | null>(
    null,
  );
  const [selectedSensorId, setSelectedSensorId] = useState<number | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds>(INITIAL_BOUNDS);
  const boundsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    data: giosStations = [],
    isLoading,
    error,
  } = useStations(source === 'gios');
  const globalQuery = useGlobalStations(source === 'waqi' ? mapBounds : null);
  const { data: globalStations = [], isError: isWaqiError } = globalQuery;
  const gios = useVisibleGiosStations(
    giosStations,
    mapBounds,
    source === 'gios',
  );

  const allStations = (
    source === 'gios' ? gios.stations : globalStations
  ).filter((station) => isCurrentReading(station.observedAt, clock));
  const selectedStation =
    allStations.find((station) => station.id === selectedStationId) ??
    selection;

  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 60_000);
    return () => {
      clearInterval(timer);
      if (boundsDebounceRef.current) clearTimeout(boundsDebounceRef.current);
    };
  }, []);

  function handleStationSelect(station: Station) {
    setSelection(station);
    setSelectedStationId(station.id);
    setSelectedSensorId(null);
  }

  function handleMapStationSelect(stationId: string) {
    setSelection(
      allStations.find((station) => station.id === stationId) ?? null,
    );
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
    setSelection(null);
    setSelectedStationId(null);
    setSelectedSensorId(null);
  }

  return (
    <Layout
      header={
        <StationSearch
          stations={allStations}
          onStationSelect={handleStationSelect}
        />
      }
    >
      <div className="relative flex-1">
        <ErrorBoundary
          fallback={
            <ErrorState message="Wystąpił błąd mapy. Odśwież stronę." />
          }
        >
          <AirQualityMap
            stations={allStations}
            selectedStation={selectedStation}
            selectedStationId={selectedStationId}
            onStationSelect={handleMapStationSelect}
            onBoundsChange={handleBoundsChange}
            isLoading={
              source === 'gios'
                ? isLoading || gios.isFetching
                : globalQuery.isFetching
            }
            error={source === 'gios' && error instanceof Error ? error : null}
            waqiError={source === 'waqi' && isWaqiError}
            source={source}
            onSourceChange={(next) => {
              handleClose();
              setSource(next);
            }}
            onRefresh={() => {
              if (source === 'waqi') void globalQuery.refetch();
              else {
                void queryClient.invalidateQueries({ queryKey: ['aqindex'] });
                void queryClient.invalidateQueries({ queryKey: ['stations'] });
              }
            }}
            failedStations={gios.failed}
          />
        </ErrorBoundary>
      </div>

      {selectedStation && (
        <div className="fixed bottom-0 left-0 right-0 z-40 h-2/3 overflow-y-auto rounded-t-2xl bg-[var(--bg)] shadow-2xl lg:static lg:z-30 lg:flex lg:h-full lg:w-96 lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:rounded-none lg:border-l lg:border-[var(--border)] lg:bg-[var(--bg)] lg:shadow-lg">
          <div className="mx-auto mb-1 mt-3 h-1 w-10 rounded-full bg-[var(--border)] lg:hidden" />
          <ErrorBoundary
            fallback={
              <ErrorState message="Nie można załadować szczegółów stacji." />
            }
          >
            <Suspense
              fallback={
                <p className="p-5 text-sm" role="status">
                  Ładowanie szczegółów…
                </p>
              }
            >
              <StationDetailsPanel
                station={selectedStation}
                selectedSensorId={selectedSensorId}
                onSensorSelect={setSelectedSensorId}
                onClose={handleClose}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      )}
    </Layout>
  );
}

export default App;
