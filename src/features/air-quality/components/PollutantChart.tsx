import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useSensorMeasurements } from '@/features/air-quality/hooks/useSensorMeasurements';
import type { Measurement } from '@/features/air-quality/model/measurement.types';
import { EmptyState } from '@/shared/components/EmptyState';
import { ErrorState } from '@/shared/components/ErrorState';
import { LoadingState } from '@/shared/components/LoadingState';
import { formatDate, formatDateTime } from '@/shared/utils/dateTime';

interface PollutantChartProps {
  sensorId: number | null;
  parameterCode: string;
  parameterName: string;
  unit: string;
}

interface ChartDataPoint {
  date: string;
  value: number;
}

function normalizeDate(value: string): string {
  return value.includes('T') ? value : value.replace(' ', 'T');
}

function formatChartDate(value: string): string {
  return formatDate(normalizeDate(value));
}

function formatChartDateTime(value: string): string {
  return formatDateTime(normalizeDate(value));
}

function toChartData(measurements: Measurement[]): ChartDataPoint[] {
  return [...measurements]
    .filter((measurement): measurement is Measurement & { value: number } => measurement.value !== null)
    .sort((a, b) => new Date(normalizeDate(a.date)).getTime() - new Date(normalizeDate(b.date)).getTime())
    .map((measurement) => ({ date: measurement.date, value: measurement.value }));
}

export function PollutantChart({
  sensorId,
  parameterCode,
  parameterName,
  unit,
}: PollutantChartProps) {
  const { data: measurements = [], isLoading, error, refetch } = useSensorMeasurements(sensorId);

  if (sensorId === null) {
    return null;
  }

  const chartData = toChartData(measurements);

  if (isLoading) {
    return <LoadingState message="Ładowanie danych..." />;
  }

  if (error) {
    return <ErrorState message="Błąd ładowania danych czujnika." onRetry={() => void refetch()} />;
  }

  if (chartData.length === 0) {
    return <EmptyState message="Brak danych pomiarowych dla tego czujnika." />;
  }

  return (
    <div className="h-56" aria-label={`Wykres pomiarów ${parameterCode}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="date"
            tickFormatter={(value: string) => formatChartDate(value)}
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fontSize: 11 }} width={40} />
          <Tooltip
            formatter={(value: unknown) => [`${value as number} ${unit}`, parameterName]}
            labelFormatter={(label: unknown) => formatChartDateTime(String(label))}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#1A73E8"
            fill="#EFF6FF"
            dot={false}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
