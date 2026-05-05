import { getAqiBadgeTextColour, getAqiInfo } from '@/features/air-quality/utils/airQualityScale';

interface AirQualityBadgeProps {
  aqiLevel: number | null;
  aqiName: string | null;
  rawValue?: number | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
} satisfies Record<NonNullable<AirQualityBadgeProps['size']>, string>;

export function AirQualityBadge({
  aqiLevel,
  aqiName,
  rawValue,
  size = 'md',
}: AirQualityBadgeProps) {
  const { colour, name } = getAqiInfo(aqiLevel);
  const label = aqiLevel === null ? name : (aqiName ?? name);
  const textColour = getAqiBadgeTextColour(aqiLevel);

  if (rawValue != null) {
    return (
      <span
        role="status"
        aria-label={`Indeks jakości powietrza: ${aqiName ?? 'Brak danych'}`}
        className={`inline-flex flex-col items-center rounded-xl font-semibold ${sizeClasses[size]}`}
        style={{ backgroundColor: colour, color: textColour }}
      >
        <span className={size === 'lg' ? 'text-2xl font-bold leading-none' : 'font-bold leading-none'}>
          {rawValue}
        </span>
        <span className={size === 'lg' ? 'mt-0.5 text-xs font-medium opacity-90' : 'text-xs font-medium opacity-90'}>
          {label}
        </span>
      </span>
    );
  }

  return (
    <span
      role="status"
      aria-label={`Indeks jakości powietrza: ${aqiName ?? 'Brak danych'}`}
      className={`inline-flex items-center rounded-full font-semibold ${sizeClasses[size]}`}
      style={{
        backgroundColor: colour,
        color: textColour,
      }}
    >
      {label}
    </span>
  );
}
