import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useHistoricalWeather } from '../hooks/useHistoricalWeather';
import { LoadingState } from '@/shared/components/LoadingState';
import { EmptyState } from '@/shared/components/EmptyState';

type WeatherMetric = 'temperature' | 'humidity' | 'windSpeed';

const METRIC_CONFIG: Record<WeatherMetric, { label: string; unit: string; colour: string }> = {
  temperature: { label: 'Temperatura', unit: '°C', colour: '#ef4444' },
  humidity: { label: 'Wilgotność', unit: '%', colour: '#3b82f6' },
  windSpeed: { label: 'Prędkość wiatru', unit: 'km/h', colour: '#10b981' },
};

interface WeatherHistoryChartProps {
  lat: number;
  lon: number;
  range: '24h' | '7d';
}

export function WeatherHistoryChart({ lat, lon, range }: WeatherHistoryChartProps) {
  const [metric, setMetric] = useState<WeatherMetric>('temperature');
  const { data, isLoading } = useHistoricalWeather(lat, lon, range);

  const config = METRIC_CONFIG[metric];

  if (isLoading) {
    return <LoadingState message="Ładowanie historii pogody..." />;
  }

  if (!data || data.time.length === 0) {
    return <EmptyState message="Brak danych historycznych" />;
  }

  const chartData = data.time.map((t, i) => ({
    time: t.slice(5, 16).replace('T', ' '),
    value: data[metric][i],
  }));

  return (
    <div>
      <div className="mb-3 flex gap-2">
        {(Object.keys(METRIC_CONFIG) as WeatherMetric[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMetric(m)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              metric === m
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {METRIC_CONFIG[m].label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10 }}
            interval={range === '24h' ? 5 : 23}
            tickFormatter={(v: string) => v.slice(0, 5)}
          />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip
            formatter={(value) => [`${value ?? ''} ${config.unit}`, config.label]}
            labelFormatter={(label) => `Czas: ${String(label)}`}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={config.colour}
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
