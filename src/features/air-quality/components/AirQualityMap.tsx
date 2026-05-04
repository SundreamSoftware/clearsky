import { MapContainer, TileLayer } from 'react-leaflet';
import type { Station } from '@/features/air-quality/model/station.types';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { StationMarker } from './StationMarker';

interface AirQualityMapProps {
  stations: Station[];
  selectedStationId: number | null;
  onStationSelect: (stationId: number) => void;
  isLoading: boolean;
  error: Error | null;
}

const POLAND_CENTER: [number, number] = [52.0, 19.5];
const DEFAULT_ZOOM = 6;

export function AirQualityMap({
  stations,
  selectedStationId,
  onStationSelect,
  isLoading,
  error,
}: AirQualityMapProps) {
  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-50">
        <ErrorState message="Nie udało się załadować stacji pomiarowych." />
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-lg shadow-md"
      data-testid="map-container"
    >
      {isLoading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/60">
          <LoadingState message="Ładowanie stacji..." />
        </div>
      )}
      <MapContainer
        center={POLAND_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        data-testid="map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {stations.map((station) => (
          <StationMarker
            key={station.id}
            station={station}
            aqiLevel={null}
            isSelected={station.id === selectedStationId}
            onSelect={onStationSelect}
          />
        ))}
      </MapContainer>
    </div>
  );
}
