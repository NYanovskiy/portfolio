import { format, parseISO, isSameDay, subDays, eachDayOfInterval, startOfMonth, endOfMonth, differenceInCalendarDays } from 'date-fns';

// Safely parse date
export const safeParse = (value) => {
  try {
    if (!value) return null;
    if (typeof value === 'string') return parseISO(value);
    return value instanceof Date ? value : new Date(value);
  } catch {
    return null;
  }
};

// Get date key for storage
export const keyOf = (date) => {
  const dateTime = safeParse(date) || new Date();
  try {
    return format(dateTime, 'yyyy-MM-dd');
  } catch {
    return String(date);
  }
};

// Get last 7 days
export const getLast7Days = () => {
  const end = new Date();
  const start = subDays(end, 6);
  return eachDayOfInterval({ start, end });
};

// Get month interval
export const getMonthInterval = () => {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now)
  };
};

// Calculate days difference
export const getDaysDifference = (start, end) => {
  return differenceInCalendarDays(end, start) + 1;
};

