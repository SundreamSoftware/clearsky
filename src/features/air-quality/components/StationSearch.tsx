import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { Station } from '@/features/air-quality/model/station.types';
import { filterStations } from '@/features/air-quality/utils/stationFilters';
import { useDebounce } from '@/shared/utils/useDebounce';
import { StationList } from './StationList';

interface StationSearchProps {
  stations: Station[];
  onStationSelect: (station: Station) => void;
}

const MAX_RESULTS = 10;

export function StationSearch({ stations, onStationSelect }: StationSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);
  const hasDebouncedQuery = debouncedQuery.trim().length > 0;
  const results = hasDebouncedQuery
    ? filterStations(stations, debouncedQuery).slice(0, MAX_RESULTS)
    : [];

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  const handleSelect = useCallback(
    (station: Station) => {
      onStationSelect(station);
      setQuery('');
      closeDropdown();
    },
    [closeDropdown, onStationSelect],
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeDropdown]);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setHighlightedIndex((index) => Math.min(index + 1, results.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setHighlightedIndex((index) => Math.max(index - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          handleSelect(results[highlightedIndex]);
        }
        break;
      case 'Escape':
      case 'Tab':
        closeDropdown();
        break;
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md" data-testid="station-search">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          role="combobox"
          aria-expanded={isOpen && hasDebouncedQuery}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            setHighlightedIndex(-1);
            setIsOpen(nextQuery.trim().length > 0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Szukaj stacji lub miasta..."
          className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand"
          data-testid="search-input"
        />
      </div>

      {isOpen && hasDebouncedQuery && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
          data-testid="search-dropdown"
        >
          <StationList
            stations={results}
            highlightedIndex={highlightedIndex}
            onSelect={handleSelect}
          />
        </div>
      )}
    </div>
  );
}
