import { format, parseISO, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { addHours, isWithinInterval, parse } from 'date-fns';

export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const formatTimeInTimezone = (date: Date, timezone: string): string => {
  const zonedDate = utcToZonedTime(date, timezone);
  return format(zonedDate, 'HH:mm', { timeZone: timezone });
};

export const formatDateInTimezone = (date: Date, timezone: string): string => {
  const zonedDate = utcToZonedTime(date, timezone);
  return format(zonedDate, 'MMM dd, yyyy HH:mm', { timeZone: timezone });
};

export const getCurrentTimeInTimezone = (timezone: string): string => {
  return formatTimeInTimezone(new Date(), timezone);
};

export const isUserWorkingHours = (
  timezone: string,
  workingHours: { start: string; end: string }
): boolean => {
  const now = new Date();
  const currentTime = formatTimeInTimezone(now, timezone);
  
  const startTime = workingHours.start;
  const endTime = workingHours.end;
  
  return currentTime >= startTime && currentTime <= endTime;
};

export const findOptimalOverlapWindows = (
  users: Array<{
    timezone: string;
    workingHours: { start: string; end: string };
  }>
): Array<{
  startTime: string;
  endTime: string;
  duration: number;
  participants: number;
}> => {
  const overlaps: Array<{
    startTime: string;
    endTime: string;
    duration: number;
    participants: number;
  }> = [];

  // Convert all working hours to UTC for comparison
  const utcWindows = users.map(user => {
    const today = new Date();
    const startTime = parse(user.workingHours.start, 'HH:mm', today);
    const endTime = parse(user.workingHours.end, 'HH:mm', today);
    
    const utcStart = zonedTimeToUtc(startTime, user.timezone);
    const utcEnd = zonedTimeToUtc(endTime, user.timezone);
    
    return { utcStart, utcEnd };
  });

  // Find overlapping windows (simplified algorithm)
  for (let i = 0; i < 24; i++) {
    const hourStart = new Date();
    hourStart.setUTCHours(i, 0, 0, 0);
    const hourEnd = new Date();
    hourEnd.setUTCHours(i + 1, 0, 0, 0);

    const participantsCount = utcWindows.filter(window =>
      isWithinInterval(hourStart, { start: window.utcStart, end: window.utcEnd }) ||
      isWithinInterval(hourEnd, { start: window.utcStart, end: window.utcEnd })
    ).length;

    if (participantsCount > 1) {
      overlaps.push({
        startTime: format(hourStart, 'HH:mm'),
        endTime: format(hourEnd, 'HH:mm'),
        duration: 60,
        participants: participantsCount
      });
    }
  }

  return overlaps.sort((a, b) => b.participants - a.participants);
};

export const translateMessageTime = (
  originalTime: Date,
  fromTimezone: string,
  toTimezone: string
): string => {
  const originalZonedTime = utcToZonedTime(originalTime, fromTimezone);
  const targetZonedTime = utcToZonedTime(originalTime, toTimezone);
  
  return `${format(originalZonedTime, 'HH:mm', { timeZone: fromTimezone })} (${fromTimezone}) → ${format(targetZonedTime, 'HH:mm', { timeZone: toTimezone })} (your time)`;
};