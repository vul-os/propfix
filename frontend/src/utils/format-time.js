import { format, getTime, formatDistanceToNow } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz'; // Import zonedTimeToUtc

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

export function fToNow(date, timeZone) {
  if (!date) {
    return '';
  }

  // Convert the input date to UTC using zonedTimeToUtc
  const utcDate = zonedTimeToUtc(new Date(date), timeZone);

  const timeDifferenceInSeconds = Math.abs(
    Math.floor((new Date().getTime() - utcDate.getTime()) / 1000)
  );

  if (timeDifferenceInSeconds === 0) {
    return 'now'; // Event was created at this exact moment
  } else if (timeDifferenceInSeconds <= 60) {
    return `${timeDifferenceInSeconds} second${timeDifferenceInSeconds > 1 ? 's' : ''} ago`; // Event was created within 60 seconds
  } else {
    // Event was created more than 60 seconds ago
    const minutesDifference = Math.floor(timeDifferenceInSeconds / 60);
    return `${minutesDifference} minute${minutesDifference > 1 ? 's' : ''} ago`;
  }
}

