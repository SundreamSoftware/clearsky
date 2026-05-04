import type { Measurement } from '@/features/air-quality/model/measurement.types';
import { formatDateTime } from '@/shared/utils/dateTime';
import { formatNumber } from '@/shared/utils/number';

interface SensorMeasurementsTableProps {
  measurements: Measurement[];
  unit: string;
}

export function SensorMeasurementsTable({
  measurements,
  unit,
}: SensorMeasurementsTableProps) {
  const rows = measurements.slice(0, 20);

  if (rows.length === 0) {
    return <p className="text-sm text-gray-500">Brak pomiarów</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white" data-testid="measurements-table">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Data / czas</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Wartość</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Jednostka</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {rows.map((measurement) => (
              <tr key={`${measurement.sensorId}-${measurement.date}`}>
                <td className="px-4 py-3 text-gray-700">{formatDateTime(measurement.date)}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{formatNumber(measurement.value)}</td>
                <td className="px-4 py-3 text-gray-600">{unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
