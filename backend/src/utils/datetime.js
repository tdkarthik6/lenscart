const { format, parseISO, isValid } = require('date-fns');
const { toZonedTime, fromZonedTime } = require('date-fns-tz');

const TIMEZONE = process.env.BUSINESS_TIMEZONE || 'Asia/Kolkata';

/**
 * Get current time in IST
 */
const nowIST = () => toZonedTime(new Date(), TIMEZONE);

/**
 * Format a date to YYYY-MM-DD in IST
 */
const toDateString = (date) => format(toZonedTime(new Date(date), TIMEZONE), 'yyyy-MM-dd');

/**
 * Format a time to HH:mm:ss
 */
const toTimeString = (timeStr) => {
  if (!timeStr) return null;
  // Accepts HH:mm or HH:mm:ss
  const parts = timeStr.split(':');
  if (parts.length < 2) return null;
  return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}:00`;
};

/**
 * Check if a date string (YYYY-MM-DD) is today or in the future (IST)
 */
const isFutureOrToday = (dateStr) => {
  const today = format(nowIST(), 'yyyy-MM-dd');
  return dateStr >= today;
};

/**
 * Compare two time strings HH:mm:ss
 */
const isTimeBefore = (time1, time2) => {
  return time1 < time2;
};

/**
 * Format date for display
 */
const formatDisplayDate = (dateStr) => {
  try {
    const d = parseISO(dateStr);
    return format(d, 'dd MMMM yyyy');
  } catch {
    return dateStr;
  }
};

/**
 * Format time for display  
 */
const formatDisplayTime = (timeStr) => {
  if (!timeStr) return '';
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const suffix = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    return `${h}:${String(minutes).padStart(2, '0')} ${suffix}`;
  } catch {
    return timeStr;
  }
};

module.exports = {
  TIMEZONE,
  nowIST,
  toDateString,
  toTimeString,
  isFutureOrToday,
  isTimeBefore,
  formatDisplayDate,
  formatDisplayTime,
};
