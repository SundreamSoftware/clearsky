import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { Station } from '@/features/air-quality/model/station.types';
import type { MapBounds } from '@/features/air-quality/hooks/useGlobalStations';
import { useAirQualityIndex } from '@/features/air-quality/hooks/useAirQualityIndex';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { StationMarker } from './StationMarker';

interface AirQualityMapProps {
  stations: Station[];
  selectedStation: Station | null;
  selectedStationId: string | null;
  onStationSelect: (stationId: string) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
  isLoading: boolean;
  error: Error | null;
}

interface MapControllerProps {
  selectedStation: Station | null;
  onBoundsChange?: (bounds: MapBounds) => void;
}

function MapController({ selectedStation, onBoundsChange }: MapControllerProps) {
  const map = useMap();

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
    if (selectedStation) {
      map.flyTo([selectedStation.latitude, selectedStation.longitude], 12, {
        duration: 0.8,
      });
    }
  }, [map, selectedStation]);

  return null;
}

function GiosStationMarker({
  station,
  isSelected,
  onSelect,
}: {
  station: Station;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const { data: aqi } = useAirQualityIndex(station.id);
  return (
    <StationMarker
      station={station}
      aqiLevel={aqi?.indexLevel ?? null}
      isSelected={isSelected}
      onSelect={onSelect}
    />
  );
}

function WaqiStationMarker({
  station,
  isSelected,
  onSelect,
}: {
  station: Station;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <StationMarker
      station={station}
      aqiLevel={station.aqiLevel ?? null}
      isSelected={isSelected}
      onSelect={onSelect}
    />
  );
}

// Start centered on Europe at zoom 4 so WAQI stations outside Poland are immediately visible.
const EUROPE_CENTER: [number, number] = [50.0, 10.0];
const DEFAULT_ZOOM = 4;

export function AirQualityMap({
  stations,
  selectedStation,
  selectedStationId,
  onStationSelect,
  onBoundsChange,
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
        center={EUROPE_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full"
        data-testid="map"
      >
        <MapController selectedStation={selectedStation} onBoundsChange={onBoundsChange} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {stations.map((station) =>
          station.source === 'waqi' ? (
            <WaqiStationMarker
              key={station.id}
              station={station}
              isSelected={station.id === selectedStationId}
              onSelect={onStationSelect}
            />
          ) : (
            <GiosStationMarker
              key={station.id}
              station={station}
              isSelected={station.id === selectedStationId}
              onSelect={onStationSelect}
            />
          ),
        )}
      </MapContainer>
    </div>
  );
}
