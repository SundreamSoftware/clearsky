import { useState } from 'react';
import { AirQualityMap } from '@/features/air-quality/components/AirQualityMap';
import { useStations } from '@/features/air-quality/hooks/useStations';
import { Layout } from '@/shared/components/Layout';

function App() {
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const { data: stations = [], isLoading, error } = useStations();

  return (
    <Layout>
      <div className="h-[calc(100vh-8rem)]">
        <AirQualityMap
          stations={stations}
          selectedStationId={selectedStationId}
          onStationSelect={setSelectedStationId}
          isLoading={isLoading}
          error={error instanceof Error ? error : null}
        />
      </div>
    </Layout>
  );
}

export default App;
