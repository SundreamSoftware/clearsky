import { useState } from 'react';
import { AirQualityMap } from '@/features/air-quality/components/AirQualityMap';
import { StationDetailsPanel } from '@/features/air-quality/components/StationDetailsPanel';
import { StationSearch } from '@/features/air-quality/components/StationSearch';
import { useStations } from '@/features/air-quality/hooks/useStations';
import type { Station } from '@/features/air-quality/model/station.types';
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
      <div className="relative h-[calc(100vh-5rem)]">
        <AirQualityMap
          stations={stations}
          selectedStation={selectedStation}
          selectedStationId={selectedStationId}
          onStationSelect={handleMapStationSelect}
          isLoading={isLoading}
          error={error instanceof Error ? error : null}
        />
        <StationDetailsPanel
          station={selectedStation}
          selectedSensorId={selectedSensorId}
          onSensorSelect={setSelectedSensorId}
          onClose={handleClose}
        />
      </div>
    </Layout>
  );
}

export default App;
