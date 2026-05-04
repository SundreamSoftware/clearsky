import { AirQualityBadge } from '@/features/air-quality/components/AirQualityBadge';
import { PollutantCard } from '@/features/air-quality/components/PollutantCard';
import { PollutantChart } from '@/features/air-quality/components/PollutantChart';
import { useAirQualityIndex } from '@/features/air-quality/hooks/useAirQualityIndex';
import { useSensorMeasurements } from '@/features/air-quality/hooks/useSensorMeasurements';
import { useStationSensors } from '@/features/air-quality/hooks/useStationSensors';
import type { Sensor } from '@/features/air-quality/model/sensor.types';
import type { Station } from '@/features/air-quality/model/station.types';
import { formatDateTime } from '@/shared/utils/dateTime';

interface StationDetailsPanelProps {
  station: Station | null;
  selectedSensorId: number | null;
  onSensorSelect: (sensorId: number) => void;
  onClose: () => void;
}

const SUPPORTED_POLLUTANTS = ['PM2.5', 'PM10', 'NO2', 'O3', 'SO2', 'CO'] as const;

export function StationDetailsPanel({
  station,
  selectedSensorId,
  onSensorSelect,
  onClose,
}: StationDetailsPanelProps) {
  const { data: aqi, isLoading: aqiLoading, error: aqiError } = useAirQualityIndex(station?.id ?? null);
  const {
    data: sensors = [],
    isLoading: sensorsLoading,
    error: sensorsError,
  } = useStationSensors(station?.id ?? null);

  const supportedSensors = sensors.filter((sensor) =>
    SUPPORTED_POLLUTANTS.includes(sensor.parameterCode as (typeof SUPPORTED_POLLUTANTS)[number]),
  );

  if (!station) {
    return null;
  }

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-40 h-2/3 overflow-y-auto rounded-t-2xl bg-white shadow-xl lg:bottom-0 lg:left-auto lg:right-0 lg:top-[5rem] lg:h-auto lg:w-96 lg:rounded-none">
      <div className="w-8 h-1 bg-gray-300 rounded mx-auto mt-2 mb-1 lg:hidden" />
      <div className="border-b border-gray-100 px-5 pb-5 pt-3">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{station.name}</h2>
            <p className="text-sm text-gray-500">
              {station.city}
              {station.address ? `, ${station.address}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij panel"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-xl text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      </div>

      <section className="border-b border-gray-100 px-5 py-4">
        <p className="mb-3 text-sm font-medium text-gray-500">Air Quality Index</p>
        {aqiLoading ? (
          <div className="animate-pulse bg-gray-200 rounded h-8 w-32" />
        ) : aqiError ? (
          <p className="text-sm text-red-500">Błąd ładowania danych</p>
        ) : (
          <div className="space-y-3">
            <AirQualityBadge aqiLevel={aqi?.indexLevel ?? null} aqiName={aqi?.indexName ?? null} size="lg" />
            <p className="text-sm text-gray-500">
              Calculated at:{' '}
              <span className="text-gray-700">
                {aqi?.calculatedAt ? formatDateTime(aqi.calculatedAt) : 'Brak danych'}
              </span>
            </p>
          </div>
        )}
      </section>

      <section className="border-b border-gray-100 px-5 py-4">
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-500">Pollutant Measurements</p>
        </div>

        {sensorsLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="animate-pulse rounded-xl bg-gray-100 h-24" />
            ))}
          </div>
        ) : sensorsError ? (
          <p className="text-sm text-red-500">Błąd ładowania sensorów</p>
        ) : supportedSensors.length === 0 ? (
          <p className="text-sm text-gray-500">Brak obsługiwanych sensorów.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {supportedSensors.map((sensor) => (
              <PollutantCardWithData
                key={sensor.id}
                sensor={sensor}
                isSelected={sensor.id === selectedSensorId}
                onSelect={() => onSensorSelect(sensor.id)}
              />
            ))}
          </div>
        )}
      </section>

      <div className="px-4 pb-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Wykres pomiarów
        </h3>
        {selectedSensorId !== null ? (
          (() => {
            const sensor = supportedSensors.find((item) => item.id === selectedSensorId);
            return sensor ? (
              <PollutantChart
                sensorId={selectedSensorId}
                parameterCode={sensor.parameterCode}
                parameterName={sensor.parameterName}
                unit={sensor.unit}
              />
            ) : null;
          })()
        ) : (
          <p className="py-4 text-center text-sm text-gray-400">
            Kliknij kartę czujnika, aby zobaczyć wykres.
          </p>
        )}
      </div>
    </aside>
  );
}

function PollutantCardWithData({
  sensor,
  isSelected,
  onSelect,
}: {
  sensor: Sensor;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { data: measurements = [], isLoading } = useSensorMeasurements(sensor.id);
  const latestMeasurement = measurements[0] ?? null;

  return (
    <PollutantCard
      sensor={sensor}
      latestMeasurement={latestMeasurement}
      isLoading={isLoading}
      isSelected={isSelected}
      onSelect={onSelect}
    />
  );
}

