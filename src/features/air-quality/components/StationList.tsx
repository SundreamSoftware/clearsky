import { clsx } from 'clsx';
import type { Station } from '@/features/air-quality/model/station.types';

interface StationListProps {
  stations: Station[];
  highlightedIndex: number;
  onSelect: (station: Station) => void;
}

export function StationList({ stations, highlightedIndex, onSelect }: StationListProps) {
  if (stations.length === 0) {
    return <div className="px-4 py-3 text-sm text-gray-500">Nie znaleziono stacji.</div>;
  }

  return (
    <ul role="listbox">
      {stations.map((station, index) => (
        <li
          key={station.id}
          role="option"
          aria-selected={index === highlightedIndex}
          className={clsx(
            'flex cursor-pointer items-center justify-between px-4 py-2 text-sm',
            index === highlightedIndex ? 'bg-blue-50 text-blue-900' : 'hover:bg-gray-50',
          )}
          onMouseDown={(event) => {
            event.preventDefault();
            onSelect(station);
          }}
        >
          <span className="truncate font-medium">{station.name}</span>
          <span className="ml-2 shrink-0 text-xs text-gray-400">{station.city}</span>
        </li>
      ))}
    </ul>
  );
}
