import { render, screen, fireEvent } from '@testing-library/react';
import type { Measurement } from '@/features/air-quality/model/measurement.types';
import type { Sensor } from '@/features/air-quality/model/sensor.types';
import { PollutantCard } from './PollutantCard';

const mockSensor: Sensor = {
  id: 101,
  stationId: 1,
  parameterCode: 'PM2.5',
  parameterName: 'Pył zawieszony PM2.5',
  unit: 'µg/m³',
};

const mockMeasurement: Measurement = {
  sensorId: 101,
  date: '2024-05-04 12:00:00',
  value: 12.5,
  unit: 'µg/m³',
};

describe('PollutantCard', () => {
  it('renders parameter name and value', () => {
    render(
      <PollutantCard
        sensor={mockSensor}
        latestMeasurement={mockMeasurement}
        isLoading={false}
        isSelected={false}
        onSelect={() => {}}
      />,
    );

    expect(screen.getByText('Pył zawieszony PM2.5')).toBeInTheDocument();
    expect(screen.getByText('PM2.5')).toBeInTheDocument();
    expect(screen.getByText(/12.50/)).toBeInTheDocument();
  });

  it('renders loading state when isLoading is true', () => {
    const { container } = render(
      <PollutantCard
        sensor={mockSensor}
        latestMeasurement={null}
        isLoading={true}
        isSelected={false}
        onSelect={() => {}}
      />,
    );

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders dash for null measurement', () => {
    render(
      <PollutantCard
        sensor={mockSensor}
        latestMeasurement={null}
        isLoading={false}
        isSelected={false}
        onSelect={() => {}}
      />,
    );

    expect(screen.getByText('–')).toBeInTheDocument();
  });

  it('applies selected styling when isSelected is true', () => {
    render(
      <PollutantCard
        sensor={mockSensor}
        latestMeasurement={mockMeasurement}
        isLoading={false}
        isSelected={true}
        onSelect={() => {}}
      />,
    );

    expect(screen.getByTestId('pollutant-card')).toHaveClass('border-[var(--accent)]');
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();

    render(
      <PollutantCard
        sensor={mockSensor}
        latestMeasurement={mockMeasurement}
        isLoading={false}
        isSelected={false}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByTestId('pollutant-card'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
