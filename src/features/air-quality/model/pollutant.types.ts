export type PollutantCode = 'PM2.5' | 'PM10' | 'NO2' | 'O3' | 'SO2' | 'CO';

export interface Pollutant {
  code: PollutantCode;
  name: string;
  unit: string;
}
