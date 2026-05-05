import { useEffect, useRef, useState } from 'react';
import { AirQualityBadge } from '@/features/air-quality/components/AirQualityBadge';
import { PollutantCard } from '@/features/air-quality/components/PollutantCard';
import { PollutantChart } from '@/features/air-quality/components/PollutantChart';
import { useAirQualityIndex } from '@/features/air-quality/hooks/useAirQualityIndex';
import { useSensorMeasurements } from '@/features/air-quality/hooks/useSensorMeasurements';
import { useStationSensors } from '@/features/air-quality/hooks/useStationSensors';
import { useWaqiStationDetail } from '@/features/air-quality/hooks/useWaqiStationDetail';
import type { Sensor } from '@/features/air-quality/model/sensor.types';
import type { Station } from '@/features/air-quality/model/station.types';
import type { WaqiFeedDataDto } from '@/features/air-quality/api/waqi.dto';
import { getAqiInfo, pm25ToAqiLevel } from '@/features/air-quality/utils/airQualityScale';
import type { AqiLevel } from '@/features/air-quality/utils/airQualityScale';
import { useWeather } from '@/features/weather/hooks/useWeather';
import { WeatherPanel } from '@/features/weather/components/WeatherPanel';
import { WeatherHistoryChart } from '@/features/weather/components/WeatherHistoryChart';
import { LoadingState } from '@/shared/components/LoadingState';
import { formatDateTime } from '@/shared/utils/dateTime';
import { formatMeasurementValue } from '@/features/air-quality/utils/measurementFormatter';

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
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [chartRange, setChartRange] = useState<'24h' | '7d'>('24h');
  const stationId = station?.id ?? null;
  const isGios = station?.source === 'gios';
  const isWaqi = station?.source === 'waqi';

  // GIOŚ-only hooks (disabled for WAQI)
  const { data: giosAqi, isLoading: aqiLoading } = useAirQualityIndex(isGios ? stationId : null);
  const {
    data: sensors = [],
    isLoading: sensorsLoading,
    error: sensorsError,
  } = useStationSensors(isGios ? stationId : null);

  // WAQI-only hook (disabled for GIOŚ)
  const { data: waqiDetail, isLoading: waqiLoading, isError: waqiFeedError } = useWaqiStationDetail(
    isWaqi ? station : null,
  );

  const {
    data: weather,
    isLoading: weatherLoading,
  } = useWeather(station?.latitude ?? null, station?.longitude ?? null);

  const supportedSensors = sensors.filter((sensor) =>
    SUPPORTED_POLLUTANTS.includes(sensor.parameterCode as (typeof SUPPORTED_POLLUTANTS)[number]),
  );

  // Fallback AQI for GIOŚ stations: GIOŚ API only computes an official index for continuous
  // monitoring stations. For stations where indexLevel is null, derive AQI from PM2.5 if available.
  const pm25SensorId = supportedSensors.find((s) => s.parameterCode === 'PM2.5')?.id ?? null;
  const { data: pm25Measurements = [] } = useSensorMeasurements(
    isGios ? pm25SensorId : null,
    'PM2.5',
  );
  const firstPm25 = pm25Measurements[0];
  const fallbackAqiLevel: AqiLevel | null =
    firstPm25 != null ? pm25ToAqiLevel(firstPm25.value) : null;

  // Unified AQI display values
  const aqiLevel = isGios ? (giosAqi?.indexLevel ?? fallbackAqiLevel) : (station?.aqiLevel ?? null);
  const aqiName = isGios
    ? (giosAqi?.indexName ?? (aqiLevel !== null ? getAqiInfo(aqiLevel).name : null))
    : getAqiInfo(aqiLevel).name;
  // Raw numeric AQI: available for WAQI stations only. Prefer the live feed value over the
  // pre-fetched bounds value as the feed is fetched fresh when the station is selected.
  const rawAqi: number | null = isGios
    ? null
    : (() => {
        const feedAqi = waqiDetail?.aqi;
        if (typeof feedAqi === 'number' && feedAqi >= 0) return feedAqi;
        if (typeof feedAqi === 'string') {
          const n = parseInt(feedAqi, 10);
          if (!isNaN(n) && n >= 0) return n;
        }
        return station?.rawAqi ?? null;
      })();
  const aqiCalculatedAt = isGios
    ? (giosAqi?.calculatedAt ?? null)
    : (waqiDetail?.time?.s ?? null);
  const isAqiLoading = isGios ? aqiLoading : waqiLoading;

  useEffect(() => {
    if (stationId !== null) {
      headingRef.current?.focus();
    }
  }, [stationId]);

  if (!station) {
    return null;
  }

  return (
    <aside className="flex min-h-full flex-col" data-testid="station-details-panel">
      <div className="border-b border-gray-100 px-5 pb-5 pt-3">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-lg font-semibold text-gray-900 focus:outline-none"
            >
              {station.name}
            </h2>
            <p className="text-sm text-gray-500">
              {station.city}
              {station.address ? `, ${station.address}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij szczegóły stacji"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-xl text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      </div>

      <section className="border-b border-gray-100 px-5 py-4">
        <p className="mb-3 text-sm font-medium text-gray-500">Air Quality Index</p>
        {isAqiLoading ? (
          <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
        ) : (
          <div className="space-y-3">
            <AirQualityBadge aqiLevel={aqiLevel} aqiName={aqiName} rawValue={rawAqi} size="lg" />
            <p className="text-sm text-gray-500">
              Calculated at:{' '}
              <span className="text-gray-700">
                {aqiCalculatedAt ? formatDateTime(aqiCalculatedAt) : 'Brak danych'}
              </span>
            </p>
          </div>
        )}
      </section>

      <section className="border-b border-gray-100 px-5 py-4">
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-500">Pollutant Measurements</p>
        </div>

        {isGios && (
          sensorsLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : sensorsError ? (
            <p className="text-sm text-gray-500">Brak danych czujnikowych.</p>
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
          )
        )}

        {isWaqi && (
          waqiLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : waqiFeedError ? (
            <p className="text-sm text-gray-500">Nie udało się załadować szczegółów stacji.</p>
          ) : waqiDetail?.iaqi ? (
            <WaqiPollutantsSection iaqi={waqiDetail.iaqi} />
          ) : (
            <p className="text-sm text-gray-500">
              Ta stacja raportuje wyłącznie zbiorczy wskaźnik AQI — dane poszczególnych zanieczyszczeń są niedostępne.
            </p>
          )
        )}
      </section>

      {isGios && (
        <div className="px-4 pb-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Wykres pomiarów
            </h3>
            <div className="flex gap-1">
              {(['24h', '7d'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setChartRange(r)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    chartRange === r
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
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
      )}

      {(weatherLoading || weather) && (
        <section className="border-t border-gray-100 px-5 py-4">
          <h3 className="mb-3 text-sm font-medium text-gray-500">Warunki pogodowe</h3>
          {weatherLoading ? (
            <LoadingState message="Ładowanie pogody..." />
          ) : weather ? (
            <WeatherPanel weather={weather} />
          ) : null}
        </section>
      )}

      {station && (
        <section className="border-t border-gray-100 px-5 py-4">
          <h3 className="mb-3 text-sm font-medium text-gray-500">Historia pogody</h3>
          <WeatherHistoryChart lat={station.latitude} lon={station.longitude} range={chartRange} />
        </section>
      )}
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
  const { data: measurements = [], isLoading } = useSensorMeasurements(sensor.id, sensor.parameterCode);
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

type WaqiIaqi = NonNullable<WaqiFeedDataDto['iaqi']>;

const WAQI_POLLUTANTS: { key: keyof WaqiIaqi; name: string; code: string; unit: string }[] = [
  { key: 'pm25', name: 'Particulate matter < 2.5 µm', code: 'PM2.5', unit: 'µg/m³' },
  { key: 'pm10', name: 'Particulate matter < 10 µm', code: 'PM10', unit: 'µg/m³' },
  { key: 'no2', name: 'Nitrogen dioxide', code: 'NO2', unit: 'ppb' },
  { key: 'o3', name: 'Ozone', code: 'O3', unit: 'ppb' },
  { key: 'so2', name: 'Sulfur dioxide', code: 'SO2', unit: 'ppb' },
  { key: 'co', name: 'Carbon monoxide', code: 'CO', unit: 'ppm' },
];

function WaqiPollutantsSection({ iaqi }: { iaqi: WaqiIaqi }) {
  const available = WAQI_POLLUTANTS.filter((p) => iaqi[p.key] !== undefined);

  if (available.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Ta stacja raportuje wyłącznie zbiorczy wskaźnik AQI — dane poszczególnych zanieczyszczeń są niedostępne.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1" data-testid="pollutant-card">
      {available.map((p) => {
        const entry = iaqi[p.key];
        const value = entry?.v ?? null;
        return (
          <div
            key={p.key}
            className="flex w-full overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            <div className="h-full w-1 shrink-0 self-stretch bg-gray-300" />
            <div className="flex-1 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs uppercase tracking-wide text-gray-500">{p.code}</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {value !== null ? formatMeasurementValue(value, p.unit) : '–'}
                </p>
              </div>
              <p className="mt-2 text-xs text-gray-500">Jednostka: {p.unit}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

