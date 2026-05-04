export type AqiLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const AQI_SCALE: Record<AqiLevel, { name: string; colour: string }> = {
  0: { name: 'Bardzo dobry', colour: '#00C853' },
  1: { name: 'Dobry', colour: '#64DD17' },
  2: { name: 'Umiarkowany', colour: '#FFD600' },
  3: { name: 'Dostateczny', colour: '#FF6D00' },
  4: { name: 'Zły', colour: '#D50000' },
  5: { name: 'Bardzo zły', colour: '#880E4F' },
};

export const UNKNOWN_AQI = { name: 'Brak danych', colour: '#9E9E9E' };

export function getAqiInfo(level: number | null): {
  name: string;
  colour: string;
} {
  if (level === null || !(level in AQI_SCALE)) {
    return UNKNOWN_AQI;
  }

  return AQI_SCALE[level as AqiLevel];
}

export function getAqiBadgeTextColour(level: number | null): 'black' | 'white' {
  if (level === null) {
    return 'black';
  }

  return level <= 2 ? 'black' : 'white';
}
