/** A reading is current for six hours; older or undated data is never a live marker. */
export const MAX_READING_AGE_MS = 6 * 60 * 60 * 1000;

export function parseAqi(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && !/^\d+(\.\d+)?$/.test(value.trim()))
    return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

export function isCurrentReading(
  date: string | null | undefined,
  now = Date.now(),
): boolean {
  if (!date) return false;
  const timestamp = Date.parse(date);
  return (
    Number.isFinite(timestamp) &&
    timestamp <= now + 5 * 60 * 1000 &&
    now - timestamp <= MAX_READING_AGE_MS
  );
}

/** GIOŚ wall-clock timestamps are in Europe/Warsaw, independent of browser timezone. */
export function giosTimestamp(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.replace(' ', 'T');
  if (/([+-]\d{2}:\d{2}|Z)$/.test(normalized)) return normalized;
  const wallTime = Date.parse(`${normalized}Z`);
  if (!Number.isFinite(wallTime)) return null;
  let instant = wallTime;
  for (let attempt = 0; attempt < 2; attempt++) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Warsaw',
      timeZoneName: 'longOffset',
    }).formatToParts(new Date(instant));
    const offset = parts
      .find((part) => part.type === 'timeZoneName')
      ?.value.match(/GMT([+-])(\d{2}):(\d{2})/);
    if (!offset) return null;
    const minutes =
      (Number(offset[2]) * 60 + Number(offset[3])) *
      (offset[1] === '+' ? 1 : -1);
    instant = wallTime - minutes * 60_000;
  }
  return new Date(instant).toISOString();
}
