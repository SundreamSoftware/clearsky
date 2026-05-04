import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';

export function formatDateTime(isoString: string): string {
  try {
    return format(parseISO(isoString), 'dd.MM.yyyy HH:mm', { locale: pl });
  } catch {
    return isoString;
  }
}

export function formatDate(isoString: string): string {
  try {
    return format(parseISO(isoString), 'dd.MM.yyyy', { locale: pl });
  } catch {
    return isoString;
  }
}
