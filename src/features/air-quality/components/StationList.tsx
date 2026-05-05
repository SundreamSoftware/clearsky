import { clsx } from 'clsx';
import type { Station } from '@/features/air-quality/model/station.types';

interface StationListProps {
  stations: Station[];
  highlightedIndex: number;
  onSelect: (station: Station) => void;
  listboxId: string;
  getOptionId: (index: number) => string;
}

export function StationList({
  stations,
  highlightedIndex,
  onSelect,
  listboxId,
  getOptionId,
}: StationListProps) {
  return (
    <ul id={listboxId} role="listbox">
      {stations.length === 0 ? (
        <li className="px-4 py-3 text-sm text-[var(--text-muted)]">Nie znaleziono stacji.</li>
      ) : (
        stations.map((station, index) => (
          <li
            key={station.id}
            id={getOptionId(index)}
            role="option"
            aria-selected={index === highlightedIndex}
            className={clsx(
              'flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm transition',
              index === highlightedIndex
                ? 'bg-[var(--accent-subtle)] text-[var(--text)]'
                : 'text-[var(--text)] hover:bg-[var(--bg-secondary)]',
            )}
            onMouseDown={(event) => {
              event.preventDefault();
              onSelect(station);
            }}
          >
            <span className="truncate font-medium">{station.name}</span>
            <span className="ml-2 shrink-0 text-xs text-[var(--text-muted)]">{station.city}</span>
          </li>
        ))
      )}
    </ul>
  );
}
