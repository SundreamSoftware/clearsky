interface WeatherCardProps {
  label: string;
  value: string;
  icon: string;
}

export function WeatherCard({ label, value, icon }: WeatherCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
      <span className="text-2xl" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="truncate text-sm font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
