import { useRef, useState } from 'react';
import { AirQualityMap } from '@/features/air-quality/components/AirQualityMap';
import { StationDetailsPanel } from '@/features/air-quality/components/StationDetailsPanel';
import { StationSearch } from '@/features/air-quality/components/StationSearch';
import { useStations } from '@/features/air-quality/hooks/useStations';
import { useGlobalStations } from '@/features/air-quality/hooks/useGlobalStations';
import { useAirQualityIndex } from '@/features/air-quality/hooks/useAirQualityIndex';
import { useOpenAqAqi } from '@/features/air-quality/hooks/useOpenAqAqi';
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

function App() {
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const [selectedSensorId, setSelectedSensorId] = useState<number | null>(null);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const boundsDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: giosStations = [], isLoading, error } = useStations();
  const { data: globalStations = [] } = useGlobalStations(mapBounds);

  const filteredGlobalStations = globalStations.filter((s) => !isInPoland(s));
  const allStations = [...giosStations, ...filteredGlobalStations];

  const selectedStation = allStations.find((station) => station.id === selectedStationId) ?? null;

  const { data: giosAqi } = useAirQualityIndex(
    selectedStation?.source === 'gios' ? selectedStation.id : null,
  );
  const { data: openAqAqi } = useOpenAqAqi(
    selectedStation?.source === 'openaq' ? selectedStation : null,
  );
  const selectedAqiLevel = giosAqi?.indexLevel ?? openAqAqi?.indexLevel ?? null;

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
      setMapBounds(bounds);
    }, 500);
  }

  function handleClose() {
    setSelectedStationId(null);
    setSelectedSensorId(null);
  }

  return (
    <Layout header={<StationSearch stations={allStations} onStationSelect={handleStationSelect} />}>
      <div className="relative flex-1">
        <ErrorBoundary fallback={<ErrorState message="Wystąpił błąd mapy. Odśwież stronę." />}>
          <AirQualityMap
            stations={allStations}
            selectedStation={selectedStation}
            selectedStationId={selectedStationId}
            selectedAqiLevel={selectedAqiLevel}
            onStationSelect={handleMapStationSelect}
            onBoundsChange={handleBoundsChange}
            isLoading={isLoading}
            error={error instanceof Error ? error : null}
          />
        </ErrorBoundary>
      </div>

      {selectedStation && (
        <div className="fixed bottom-0 left-0 right-0 z-40 h-2/3 overflow-y-auto rounded-t-2xl bg-white shadow-2xl lg:static lg:z-30 lg:flex lg:h-full lg:w-96 lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:rounded-none lg:border-l lg:border-gray-200 lg:bg-white lg:shadow-lg">
          <div className="mx-auto mb-1 mt-3 h-1 w-8 rounded-full bg-gray-300 lg:hidden" />
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
