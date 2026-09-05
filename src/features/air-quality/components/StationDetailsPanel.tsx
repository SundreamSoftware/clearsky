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
import {
  usAqiToLevel,
  US_AQI_SCALE,
} from '@/features/air-quality/utils/airQualityScale';
import {
  parseAqi,
  isCurrentReading,
  giosTimestamp,
} from '@/features/air-quality/utils/dataValidity';
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

const SUPPORTED_POLLUTANTS = [
  'PM2.5',
  'PM10',
  'NO2',
  'O3',
  'SO2',
  'CO',
] as const;

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
  const { data: giosAqi, isLoading: aqiLoading } = useAirQualityIndex(
    isGios ? stationId : null,
  );
  const {
    data: sensors = [],
    isLoading: sensorsLoading,
    error: sensorsError,
  } = useStationSensors(isGios ? stationId : null);

  // WAQI-only hook (disabled for GIOŚ)
  const {
    data: waqiDetail,
    isLoading: waqiLoading,
    isError: waqiFeedError,
  } = useWaqiStationDetail(isWaqi ? station : null);

  const { data: weather, isLoading: weatherLoading } = useWeather(
    station?.latitude ?? null,
    station?.longitude ?? null,
  );

  const supportedSensors = sensors.filter((sensor) =>
    SUPPORTED_POLLUTANTS.includes(
      sensor.parameterCode as (typeof SUPPORTED_POLLUTANTS)[number],
    ),
  );

  const feedTime = waqiDetail?.time;
  const feedTimestamp =
    feedTime?.iso ??
    (feedTime?.s && feedTime.tz
      ? `${feedTime.s.replace(' ', 'T')}${feedTime.tz}`
      : null);
  const aqiCalculatedAt = isGios
    ? giosTimestamp(giosAqi?.sourceDataDate)
    : waqiDetail
      ? feedTimestamp
      : (station?.observedAt ?? null);
  const current = isCurrentReading(aqiCalculatedAt);
  const rawAqi =
    isGios || !current
      ? null
      : parseAqi(waqiDetail ? waqiDetail.aqi : station?.rawAqi);
  const aqiLevel = !current
    ? null
    : isGios
      ? (giosAqi?.indexLevel ?? null)
      : rawAqi === null
        ? null
        : usAqiToLevel(rawAqi);
  const aqiName = isGios
    ? (giosAqi?.indexName ?? null)
    : aqiLevel === null
      ? null
      : US_AQI_SCALE[aqiLevel as keyof typeof US_AQI_SCALE].name;
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
    <aside
      className="flex min-h-full flex-col bg-[var(--bg)] transition-colors"
      data-testid="station-details-panel"
    >
      <div className="border-b border-[var(--border)] px-5 pb-4 pt-3">
        <div className="mb-2 flex items-start justify-between gap-4">
          <div>
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-base font-semibold text-[var(--text)] focus:outline-none"
            >
              {station.name}
            </h2>
            <p className="mt-0.5 text-sm text-[var(--text-muted)]">
              {station.city}
              {station.address ? `, ${station.address}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij szczegóły stacji"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-lg text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            ×
          </button>
        </div>
      </div>

      <section className="border-b border-[var(--border)] px-5 py-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          {isGios ? 'Polski indeks jakości powietrza · GIOŚ' : 'US AQI · WAQI'}
        </p>
        {isAqiLoading ? (
          <div className="h-14 w-36 animate-pulse rounded-xl bg-[var(--bg-secondary)]" />
        ) : (
          <div className="space-y-2">
            <AirQualityBadge
              source={station.source}
              aqiLevel={aqiLevel}
              aqiName={aqiName}
              rawValue={rawAqi}
              size="lg"
            />
            {!current && (
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Brak aktualnego indeksu. Odczyt jest nieaktualny lub
                niedostępny.
              </p>
            )}
            <p className="text-xs text-[var(--text-muted)]">
              Czas pomiaru:{' '}
              <span className="text-[var(--text)]">
                {aqiCalculatedAt ? formatDateTime(aqiCalculatedAt) : '—'}
              </span>
            </p>
          </div>
        )}
      </section>

      <section className="border-b border-[var(--border)] px-5 py-4">
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Zanieczyszczenia
          </p>
        </div>

        {isGios &&
          (sensorsLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 animate-pulse rounded-xl bg-[var(--bg-secondary)]"
                />
              ))}
            </div>
          ) : sensorsError ? (
            <p className="text-sm text-[var(--text-muted)]">
              Brak danych czujnikowych.
            </p>
          ) : supportedSensors.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              Brak obsługiwanych sensorów.
            </p>
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
          ))}

        {isWaqi &&
          (waqiLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 animate-pulse rounded-xl bg-[var(--bg-secondary)]"
                />
              ))}
            </div>
          ) : waqiFeedError ? (
            <p className="text-sm text-[var(--text-muted)]">
              Nie udało się załadować szczegółów stacji.
            </p>
          ) : !current ? (
            <p className="text-sm text-[var(--text-muted)]">
              Brak aktualnych danych o zanieczyszczeniach.
            </p>
          ) : waqiDetail?.iaqi ? (
            <WaqiPollutantsSection iaqi={waqiDetail.iaqi} />
          ) : (
            <p className="text-sm text-[var(--text-muted)]">
              Ta stacja raportuje wyłącznie zbiorczy wskaźnik AQI — dane
              poszczególnych zanieczyszczeń są niedostępne.
            </p>
          ))}
      </section>

      {isGios && (
        <div className="px-4 pb-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
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
                      ? 'text-white'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--border)]'
                  }`}
                  style={
                    chartRange === r ? { backgroundColor: 'var(--accent)' } : {}
                  }
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          {selectedSensorId !== null ? (
            (() => {
              const sensor = supportedSensors.find(
                (item) => item.id === selectedSensorId,
              );
              return sensor ? (
                <PollutantChart
                  sensorId={selectedSensorId}
                  parameterCode={sensor.parameterCode}
                  parameterName={sensor.parameterName}
                  unit={sensor.unit}
                  range={chartRange}
                />
              ) : null;
            })()
          ) : (
            <p className="py-4 text-center text-sm text-[var(--text-muted)]">
              Kliknij kartę czujnika, aby zobaczyć wykres.
            </p>
          )}
        </div>
      )}

      {(weatherLoading || weather) && (
        <section className="border-t border-[var(--border)] px-5 py-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Warunki pogodowe
          </h3>
          {weatherLoading ? (
            <LoadingState message="Ładowanie pogody..." />
          ) : weather ? (
            <WeatherPanel weather={weather} />
          ) : null}
        </section>
      )}

      <section className="border-t border-[var(--border)] px-5 py-4 text-sm text-[var(--text-muted)]">
        <p>
          Źródło:{' '}
          <a
            className="underline"
            href={
              isGios ? 'https://powietrze.gios.gov.pl/' : 'https://aqicn.org/'
            }
            target="_blank"
            rel="noreferrer"
          >
            {isGios ? 'GIOŚ' : 'World Air Quality Index Project'}
          </a>
        </p>
        {waqiDetail?.attributions
          ?.filter((item) => /^https?:\/\//.test(item.url))
          .map((item) => (
            <a
              className="mt-1 block underline"
              key={item.url}
              href={item.url}
              target="_blank"
              rel="noreferrer"
            >
              {item.name}
            </a>
          ))}
        {isWaqi && (
          <p className="mt-2">
            Wartości zanieczyszczeń to indeksy cząstkowe US AQI, nie stężenia w
            µg/m³. Skala różni się od polskiego indeksu GIOŚ.
          </p>
        )}
      </section>
      {station && (
        <section className="border-t border-[var(--border)] px-5 py-4">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Historia pogody
          </h3>
          <WeatherHistoryChart
            lat={station.latitude}
            lon={station.longitude}
            range={chartRange}
          />
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
  const { data: measurements = [], isLoading } = useSensorMeasurements(
    sensor.id,
    sensor.parameterCode,
  );
  const latestMeasurement =
    measurements.find((measurement) =>
      isCurrentReading(giosTimestamp(measurement.date)),
    ) ?? null;

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

const WAQI_POLLUTANTS: {
  key: keyof WaqiIaqi;
  name: string;
  code: string;
  unit: string;
}[] = [
  { key: 'pm25', name: 'Pył zawieszony PM2.5', code: 'PM2.5', unit: 'AQI' },
  { key: 'pm10', name: 'Pył zawieszony PM10', code: 'PM10', unit: 'AQI' },
  { key: 'no2', name: 'Dwutlenek azotu', code: 'NO2', unit: 'AQI' },
  { key: 'o3', name: 'Ozon', code: 'O3', unit: 'AQI' },
  { key: 'so2', name: 'Dwutlenek siarki', code: 'SO2', unit: 'AQI' },
  { key: 'co', name: 'Tlenek węgla', code: 'CO', unit: 'AQI' },
];

function WaqiPollutantsSection({ iaqi }: { iaqi: WaqiIaqi }) {
  const available = WAQI_POLLUTANTS.filter(
    (p) => parseAqi(iaqi[p.key]?.v) !== null,
  );

  if (available.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        Ta stacja raportuje wyłącznie zbiorczy wskaźnik AQI — dane
        poszczególnych zanieczyszczeń są niedostępne.
      </p>
    );
  }

  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1"
      data-testid="pollutant-card"
    >
      {available.map((p) => {
        const entry = iaqi[p.key];
        const value = entry?.v ?? null;
        return (
          <div
            key={p.key}
            className="flex w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]"
          >
            <div className="h-full w-1 shrink-0 self-stretch bg-[var(--border)]" />
            <div className="flex-1 p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text)]">
                    {p.name}
                  </p>
                  <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                    {p.code}
                  </p>
                </div>
                <p className="text-lg font-bold text-[var(--text)]">
                  {value !== null ? formatMeasurementValue(value, p.unit) : '–'}
                </p>
              </div>
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                {p.unit}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
