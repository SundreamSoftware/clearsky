import { useState } from 'react';
import { AirQualityMap } from '@/features/air-quality/components/AirQualityMap';
import { StationDetailsPanel } from '@/features/air-quality/components/StationDetailsPanel';
import { StationSearch } from '@/features/air-quality/components/StationSearch';
import { useStations } from '@/features/air-quality/hooks/useStations';
import type { Station } from '@/features/air-quality/model/station.types';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { ErrorState } from '@/shared/components/ErrorState';
import { Layout } from '@/shared/components/Layout';

function App() {
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const [selectedSensorId, setSelectedSensorId] = useState<number | null>(null);
  const { data: stations = [], isLoading, error } = useStations();

  const selectedStation = stations.find((station) => station.id === selectedStationId) ?? null;

  function handleStationSelect(station: Station) {
    setSelectedStationId(station.id);
    setSelectedSensorId(null);
  }

  function handleMapStationSelect(stationId: number) {
    setSelectedStationId(stationId);
    setSelectedSensorId(null);
  }

  function handleClose() {
    setSelectedStationId(null);
    setSelectedSensorId(null);
  }

  return (
    <Layout header={<StationSearch stations={stations} onStationSelect={handleStationSelect} />}>
      <div className="relative flex-1">
        <ErrorBoundary fallback={<ErrorState message="Wystąpił błąd mapy. Odśwież stronę." />}>
          <AirQualityMap
            stations={stations}
            selectedStation={selectedStation}
            selectedStationId={selectedStationId}
            onStationSelect={handleMapStationSelect}
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
