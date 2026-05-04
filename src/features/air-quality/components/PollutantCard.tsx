import { formatMeasurementValue } from '@/features/air-quality/utils/measurementFormatter';
import { getAqiInfo } from '@/features/air-quality/utils/airQualityScale';
import type { Measurement } from '@/features/air-quality/model/measurement.types';
import type { Sensor } from '@/features/air-quality/model/sensor.types';

interface PollutantCardProps {
  sensor: Sensor;
  latestMeasurement: Measurement | null;
  isLoading: boolean;
  isSelected: boolean;
  onSelect: () => void;
}

export function PollutantCard({
  sensor,
  latestMeasurement,
  isLoading,
  isSelected,
  onSelect,
}: PollutantCardProps) {
  const { colour } = getAqiInfo(null);

  return (
    <button
      type="button"
      onClick={onSelect}
      data-testid="pollutant-card"
      className={`flex w-full overflow-hidden rounded-xl border border-gray-200 bg-white text-left transition hover:border-blue-300 hover:shadow-sm ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div className="h-full w-1 shrink-0 self-stretch" style={{ backgroundColor: colour }} />
      <div className="flex-1 p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">{sensor.parameterName}</p>
            <p className="text-xs uppercase tracking-wide text-gray-500">{sensor.parameterCode}</p>
          </div>
          <div className="text-right">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="mb-2 h-4 w-16 rounded bg-gray-200" />
                <div className="h-6 w-24 rounded bg-gray-200" />
              </div>
            ) : (
              <p className="text-lg font-semibold text-gray-900">
                {latestMeasurement
                  ? formatMeasurementValue(latestMeasurement.value, latestMeasurement.unit || sensor.unit)
                  : '–'}
              </p>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500">Jednostka: {sensor.unit}</p>
      </div>
    </button>
  );
}
