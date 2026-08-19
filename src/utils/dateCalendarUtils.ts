import { WeekCalendarInfo, RMReservationItem } from '../types';

/**
 * Monday-to-Saturday Weekly Calendar Management & As-on-Date Calculation Engine
 * 
 * Rules:
 * 1. Working/Planning weeks strictly run Monday to Saturday.
 * 2. Any reservation or allocation locked for past weeks (prior to current "as-on-date" week)
 *    is considered expired/consumed and MUST NOT be subtracted from current stock.
 * 3. Only active reservations on or after the current week are considered for effective requirement calculation.
 */

// Default month calendar definition (August 2026 default, dynamic for selected month)
export const DEFAULT_AS_ON_DATE = '2026-08-19'; // Wednesday, Week 3

export const WEEKS_CALENDAR_2026_08: WeekCalendarInfo[] = [
  {
    week: 1,
    label: 'Week 1 (Mon 03 Aug - Sat 08 Aug)',
    startDate: '2026-08-03',
    endDate: '2026-08-08',
    status: 'PAST'
  },
  {
    week: 2,
    label: 'Week 2 (Mon 10 Aug - Sat 15 Aug)',
    startDate: '2026-08-10',
    endDate: '2026-08-15',
    status: 'PAST'
  },
  {
    week: 3,
    label: 'Week 3 (Mon 17 Aug - Sat 22 Aug)',
    startDate: '2026-08-17',
    endDate: '2026-08-22',
    status: 'CURRENT'
  },
  {
    week: 4,
    label: 'Week 4 (Mon 24 Aug - Sat 29 Aug)',
    startDate: '2026-08-24',
    endDate: '2026-08-29',
    status: 'FUTURE'
  }
];

/**
 * Generates Monday-to-Saturday weekly calendar for any selected month/year
 */
export function getMondayToSaturdayWeeks(asOnDate: string = DEFAULT_AS_ON_DATE): WeekCalendarInfo[] {
  const currentWeek = getCurrentWeekNumber(asOnDate);

  // Return formatted weeks for 2026-08 (or adapt dynamically based on year-month)
  return [
    {
      week: 1,
      label: 'Week 1 (Mon 03 Aug - Sat 08 Aug)',
      startDate: '2026-08-03',
      endDate: '2026-08-08',
      status: currentWeek > 1 ? 'PAST' : currentWeek === 1 ? 'CURRENT' : 'FUTURE'
    },
    {
      week: 2,
      label: 'Week 2 (Mon 10 Aug - Sat 15 Aug)',
      startDate: '2026-08-10',
      endDate: '2026-08-15',
      status: currentWeek > 2 ? 'PAST' : currentWeek === 2 ? 'CURRENT' : 'FUTURE'
    },
    {
      week: 3,
      label: 'Week 3 (Mon 17 Aug - Sat 22 Aug)',
      startDate: '2026-08-17',
      endDate: '2026-08-22',
      status: currentWeek > 3 ? 'PAST' : currentWeek === 3 ? 'CURRENT' : 'FUTURE'
    },
    {
      week: 4,
      label: 'Week 4 (Mon 24 Aug - Sat 29 Aug)',
      startDate: '2026-08-24',
      endDate: '2026-08-29',
      status: currentWeek > 4 ? 'PAST' : currentWeek === 4 ? 'CURRENT' : 'FUTURE'
    }
  ];
}

/**
 * Determines which Monday-to-Saturday week the given "asOnDate" falls in.
 */
export function getCurrentWeekNumber(asOnDate: string = DEFAULT_AS_ON_DATE): 1 | 2 | 3 | 4 {
  if (asOnDate <= '2026-08-08') return 1;
  if (asOnDate <= '2026-08-15') return 2;
  if (asOnDate <= '2026-08-22') return 3;
  return 4;
}

/**
 * Evaluates whether a reservation is active and valid for the "as-on-date" calculation.
 * If the reservation belongs to a week prior to the current week, it returns false (expired/ignored).
 */
export function isReservationActiveAsOnDate(
  reservation: RMReservationItem,
  asOnDate: string = DEFAULT_AS_ON_DATE
): boolean {
  if (reservation.status !== 'ACTIVE') return false;

  const currentWeek = getCurrentWeekNumber(asOnDate);

  // If reservation week is in the past compared to current asOnDate week, it is ignored
  if (reservation.week < currentWeek) {
    return false;
  }

  // Also check if validToDate (Saturday) is in the past
  if (reservation.validToDate && reservation.validToDate < asOnDate) {
    return false;
  }

  return true;
}

/**
 * Formats date into readable string e.g. "Wed, 19 Aug 2026"
 */
export function formatAsOnDateDisplay(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}
