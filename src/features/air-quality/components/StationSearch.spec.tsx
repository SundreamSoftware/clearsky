import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { Station } from '@/features/air-quality/model/station.types';
import { StationSearch } from './StationSearch';

const mockStations: Station[] = [
  {
    id: '1',
    name: 'Warszawa - Centrum',
    city: 'Warszawa',
    address: '',
    latitude: 52.2,
    longitude: 21.0,
    voivodeship: null,
    source: 'gios',
    country: 'PL',
  },
  {
    id: '2',
    name: 'Kraków - Nowa Huta',
    city: 'Kraków',
    address: '',
    latitude: 50.0,
    longitude: 19.9,
    voivodeship: null,
    source: 'gios',
    country: 'PL',
  },
  {
    id: '3',
    name: 'Gdańsk - Port',
    city: 'Gdańsk',
    address: '',
    latitude: 54.3,
    longitude: 18.6,
    voivodeship: null,
    source: 'gios',
    country: 'PL',
  },
];

describe('StationSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders search input', () => {
    render(<StationSearch stations={mockStations} onStationSelect={() => {}} />);

    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('shows dropdown with results when typing after debounce', () => {
    render(<StationSearch stations={mockStations} onStationSelect={() => {}} />);

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'Warszawa' } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();
    expect(screen.getByText('Warszawa - Centrum')).toBeInTheDocument();
  });

  it('calls onStationSelect when result is clicked', () => {
    const onSelect = vi.fn();

    render(<StationSearch stations={mockStations} onStationSelect={onSelect} />);

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'Kraków' } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    fireEvent.mouseDown(screen.getByText('Kraków - Nowa Huta'));

    expect(onSelect).toHaveBeenCalledWith(mockStations[1]);
  });

  it('clears input after selection', () => {
    render(<StationSearch stations={mockStations} onStationSelect={() => {}} />);

    const input = screen.getByTestId('search-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Kraków' } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    fireEvent.mouseDown(screen.getByText('Kraków - Nowa Huta'));

    expect(input.value).toBe('');
  });

  it('shows no results message when query does not match', () => {
    render(<StationSearch stations={mockStations} onStationSelect={() => {}} />);

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'xyz999' } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(/nie znaleziono/i)).toBeInTheDocument();
  });

  it('has correct ARIA attributes on input', () => {
    render(<StationSearch stations={mockStations} onStationSelect={() => {}} />);

    const input = screen.getByTestId('search-input');
    expect(input).toHaveAttribute('role', 'combobox');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-haspopup', 'listbox');
  });

  it('sets aria-expanded to true when dropdown is open', () => {
    render(<StationSearch stations={mockStations} onStationSelect={() => {}} />);

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'Warszawa' } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('sets aria-selected on highlighted result', () => {
    render(<StationSearch stations={mockStations} onStationSelect={() => {}} />);

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'Warszawa' } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByTestId('search-dropdown')).toBeInTheDocument();
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
  });

  it('supports keyboard navigation and selection', () => {
    const onSelect = vi.fn();

    render(<StationSearch stations={mockStations} onStationSelect={onSelect} />);

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'a' } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(onSelect).toHaveBeenCalledWith(mockStations[0]);
    expect(screen.queryByTestId('search-dropdown')).not.toBeInTheDocument();
  });

  it('closes dropdown on Escape key', () => {
    render(<StationSearch stations={mockStations} onStationSelect={() => {}} />);

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'Warszawa' } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.queryByTestId('search-dropdown')).not.toBeInTheDocument();
  });
});
