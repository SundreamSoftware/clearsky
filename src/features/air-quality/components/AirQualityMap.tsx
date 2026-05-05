import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { Station } from '@/features/air-quality/model/station.types';
import type { MapBounds } from '@/features/air-quality/hooks/useGlobalStations';
import { useAirQualityIndex } from '@/features/air-quality/hooks/useAirQualityIndex';
import { AQI_SCALE, UNKNOWN_AQI } from '@/features/air-quality/utils/airQualityScale';
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
  waqiError?: boolean;
}

interface MapControllerProps {
  selectedStation: Station | null;
  onBoundsChange?: (bounds: MapBounds) => void;
}

function MapController({ selectedStation, onBoundsChange }: MapControllerProps) {
  const map = useMap();
  const lastFlownStationIdRef = useRef<string | null>(null);

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
    if (selectedStation && selectedStation.id !== lastFlownStationIdRef.current) {
      lastFlownStationIdRef.current = selectedStation.id;
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

function MapLegend() {
  return (
    <div className="absolute bottom-8 left-2 z-[1000] rounded-lg bg-white/90 px-3 py-2 shadow-md text-xs backdrop-blur-sm">
      <p className="mb-1.5 font-semibold text-gray-700">Jakość powietrza</p>
      {(Object.entries(AQI_SCALE) as [string, { name: string; colour: string }][]).map(
        ([level, { name, colour }]) => (
          <div key={level} className="flex items-center gap-2 py-0.5">
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: colour }} />
            <span className="text-gray-600">{name}</span>
          </div>
        ),
      )}
      <div className="flex items-center gap-2 py-0.5">
        <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: UNKNOWN_AQI.colour }} />
        <span className="text-gray-600">{UNKNOWN_AQI.name}</span>
      </div>
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
      className="relative h-full w-full overflow-hidden rounded-lg shadow-md isolate"
      data-testid="map-container"
    >
      {isLoading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/60">
          <LoadingState message="Ładowanie stacji..." />
        </div>
      )}
      {waqiError && (
        <div className="absolute left-1/2 top-2 z-[1000] -translate-x-1/2 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800 shadow-md ring-1 ring-amber-200">
          Global stations could not be loaded — check WAQI token configuration.
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
      <MapLegend />
    </div>
  );
}
