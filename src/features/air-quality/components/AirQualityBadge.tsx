import { getAqiBadgeTextColour, getAqiInfo } from '@/features/air-quality/utils/airQualityScale';

interface AirQualityBadgeProps {
  aqiLevel: number | null;
  aqiName: string | null;
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
  size = 'md',
}: AirQualityBadgeProps) {
  const { colour, name } = getAqiInfo(aqiLevel);
  const label = aqiLevel === null ? name : (aqiName ?? name);

  return (
    <span
      role="status"
      aria-label={`Indeks jakości powietrza: ${aqiName ?? 'Brak danych'}`}
      className={`inline-flex items-center rounded-full font-semibold ${sizeClasses[size]}`}
      style={{
        backgroundColor: colour,
        color: getAqiBadgeTextColour(aqiLevel),
      }}
    >
      {label}
    </span>
  );
}
