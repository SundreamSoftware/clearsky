export function formatMeasurementValue(
  value: number | null,
  unit: string,
): string {
  if (value === null) {
    return '—';
  }

  return `${value.toFixed(2)} ${unit}`.trim();
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleString('pl-PL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}
