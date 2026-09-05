import { CircleMarker, Tooltip } from 'react-leaflet';
import type { Station } from '@/features/air-quality/model/station.types';
import { formatDateTime } from '@/shared/utils/dateTime';
import {
  US_AQI_SCALE,
  getAqiInfo,
} from '@/features/air-quality/utils/airQualityScale';

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
  if (aqiLevel === null) return null;
  const { colour, name } =
    station.source === 'waqi'
      ? US_AQI_SCALE[aqiLevel as keyof typeof US_AQI_SCALE]
      : getAqiInfo(aqiLevel);

  return (
    <CircleMarker
      center={[station.latitude, station.longitude]}
      radius={isSelected ? 10 : 6}
      pathOptions={{
        fillColor: colour,
        fillOpacity: 0.9,
        color: '#fff',
        weight: isSelected ? 3 : 1,
      }}
      eventHandlers={{
        click: () => onSelect(station.id),
      }}
    >
      <Tooltip direction="top" offset={[0, -8]}>
        <span className="font-medium">{station.name}</span>
        <br />
        <span className="text-xs text-gray-500">
          {name}
          {station.rawAqi != null ? ` · AQI ${station.rawAqi}` : ''}
        </span>
        <br />
        <span>
          {station.source === 'waqi' ? 'WAQI · US AQI' : 'GIOŚ · Polski indeks'}
        </span>
        {station.observedAt && (
          <>
            <br />
            <span>{formatDateTime(station.observedAt)}</span>
          </>
        )}
      </Tooltip>
    </CircleMarker>
  );
}
