import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Station } from '@/features/air-quality/model/station.types';
import { AQI_SCALE, UNKNOWN_AQI } from '@/features/air-quality/utils/airQualityScale';
import { StationMarker } from './StationMarker';

vi.mock('react-leaflet', () => ({
  CircleMarker: ({
    children,
    eventHandlers,
    pathOptions,
  }: {
    children?: ReactNode;
    eventHandlers?: { click?: () => void };
    pathOptions?: { fillColor?: string };
  }) => (
    <div
      data-testid="marker"
      data-fill={pathOptions?.fillColor}
      onClick={() => eventHandlers?.click?.()}
    >
      {children}
    </div>
  ),
  Tooltip: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const station: Station = {
  id: 42,
  name: 'Test Station',
  city: 'Testowo',
  address: '',
  latitude: 52.0,
  longitude: 21.0,
  voivodeship: null,
};

describe('StationMarker', () => {
  it('calls onSelect with station id on click', () => {
    const onSelect = vi.fn();

    render(
      <StationMarker station={station} aqiLevel={null} isSelected={false} onSelect={onSelect} />,
    );

    fireEvent.click(screen.getByTestId('marker'));

    expect(onSelect).toHaveBeenCalledWith(42);
  });

  it('applies correct fill colour for AQI level 0', () => {
    render(
      <StationMarker station={station} aqiLevel={0} isSelected={false} onSelect={() => {}} />,
    );

    expect(screen.getByTestId('marker')).toHaveAttribute('data-fill', AQI_SCALE[0].colour);
  });

  it('applies grey colour for null AQI', () => {
    render(
      <StationMarker station={station} aqiLevel={null} isSelected={false} onSelect={() => {}} />,
    );

    expect(screen.getByTestId('marker')).toHaveAttribute('data-fill', UNKNOWN_AQI.colour);
  });
});
