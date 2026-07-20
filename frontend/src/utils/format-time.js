import { format, getTime, formatDistanceToNow } from 'date-fns';

// ----------------------------------------------------------------------

export function fDate(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy';

  return date ? format(new Date(date), fm) : '';
}

export function fDateTime(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy p';

  return date ? format(new Date(date), fm) : '';
}

export function fTimestamp(date) {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow(date) {
    // Parse event.createdAt as a Date object (assuming it's in ISO 8601 format)
    const eventCreatedAt = new Date(date);

    // Subtract 2 hours from the date to adjust for the time zone difference
    eventCreatedAt.setHours(eventCreatedAt.getHours() - 2);
  return date
    ? formatDistanceToNow(new Date(eventCreatedAt), {
        addSuffix: true,
      })
    : '';
}



