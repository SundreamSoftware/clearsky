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
      className={`flex w-full overflow-hidden rounded-xl border bg-[var(--bg-secondary)] text-left transition hover:shadow-sm ${
        isSelected
          ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]/50'
          : 'border-[var(--border)] hover:border-[var(--accent)]/50'
      }`}
    >
      <div className="h-full w-1 shrink-0 self-stretch" style={{ backgroundColor: colour }} />
      <div className="flex-1 p-3.5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text)]">{sensor.parameterName}</p>
            <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{sensor.parameterCode}</p>
          </div>
          <div className="text-right">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="mb-1 h-4 w-14 rounded bg-[var(--border)]" />
                <div className="h-5 w-20 rounded bg-[var(--border)]" />
              </div>
            ) : (
              <p className="text-lg font-bold text-[var(--text)]">
                {latestMeasurement
                  ? formatMeasurementValue(latestMeasurement.value, latestMeasurement.unit || sensor.unit)
                  : '–'}
              </p>
            )}
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)]">{sensor.unit}</p>
      </div>
    </button>
  );
}
