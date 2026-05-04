import { render, screen } from '@testing-library/react';
import { AirQualityBadge } from './AirQualityBadge';

describe('AirQualityBadge', () => {
  it('renders "Bardzo dobry" for level 0', () => {
    render(<AirQualityBadge aqiLevel={0} aqiName="Bardzo dobry" />);
    expect(screen.getByText('Bardzo dobry')).toBeInTheDocument();
  });

  it('renders "Zły" for level 4', () => {
    render(<AirQualityBadge aqiLevel={4} aqiName="Zły" />);
    expect(screen.getByText('Zły')).toBeInTheDocument();
  });

  it('renders "Brak danych" for null level', () => {
    render(<AirQualityBadge aqiLevel={null} aqiName={null} />);
    expect(screen.getByText('Brak danych')).toBeInTheDocument();
  });

  it('applies background colour via inline style', () => {
    const { container } = render(<AirQualityBadge aqiLevel={1} aqiName="Dobry" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge.style.backgroundColor).toBeTruthy();
  });

  it('renders small size', () => {
    render(<AirQualityBadge aqiLevel={0} aqiName="Bardzo dobry" size="sm" />);
    expect(screen.getByText('Bardzo dobry')).toBeInTheDocument();
  });
});
