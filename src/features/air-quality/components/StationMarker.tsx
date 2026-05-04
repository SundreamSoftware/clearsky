import { CircleMarker, Tooltip } from 'react-leaflet';
import type { Station } from '@/features/air-quality/model/station.types';
import { getAqiInfo } from '@/features/air-quality/utils/airQualityScale';

interface StationMarkerProps {
  station: Station;
  aqiLevel: number | null;
  isSelected: boolean;
  onSelect: (stationId: string) => void;
}

export function StationMarker({
  station,
  aqiLevel,
  isSelected,
  onSelect,
}: StationMarkerProps) {
  const { colour } = getAqiInfo(aqiLevel);

  return (
    <CircleMarker
      center={[station.latitude, station.longitude]}
      radius={isSelected ? 11 : 8}
      pathOptions={{
        fillColor: colour,
        fillOpacity: 0.85,
        color: isSelected ? '#fff' : colour,
        weight: isSelected ? 3 : 1,
      }}
      eventHandlers={{
        click: () => onSelect(station.id),
      }}
    >
      <Tooltip direction="top" offset={[0, -8]}>
        <span className="font-medium">{station.name}</span>
        <br />
        <span className="text-xs text-gray-500">{station.city}</span>
      </Tooltip>
    </CircleMarker>
  );
}
