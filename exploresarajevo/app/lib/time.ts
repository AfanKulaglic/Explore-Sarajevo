type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

/** CMS may return hours as a JSON string (businesses) or parsed object (attractions). */
export type WorkingHoursInput = string | Record<string, unknown> | null | undefined;

function normalizeWorkingHoursInput(input: WorkingHoursInput): string {
  if (input == null) return '';
  if (typeof input === 'string') return input;
  if (typeof input === 'object') {
    try {
      return JSON.stringify(input);
    } catch {
      return '';
    }
  }
  return '';
}

export type TimeRange = {
  startMin: number; // minutes since midnight
  endMin: number;   // minutes since midnight
  overnight?: boolean; // true if endMin < startMin
};

export type DaySchedule = {
  days: DayIndex[];
  ranges: TimeRange[]; // empty -> closed
};

const DAY_MAP: Record<string, DayIndex> = {
  sun: 0, sunday: 0,
  mon: 1, monday: 1,
  tue: 2, tues: 2, tuesday: 2,
  wed: 3, wednesday: 3,
  thu: 4, thur: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6,
};

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(':').map(s => parseInt(s, 10));
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
}

function expandDayToken(token: string): DayIndex[] {
  token = token.trim().toLowerCase();
  if (!token) return [];
  if (token.includes('-')) {
    const [a, b] = token.split('-').map(s => s.trim());
    const start = DAY_MAP[a];
    const end = DAY_MAP[b];
    if (start === undefined || end === undefined) return [];
    const days: DayIndex[] = [];
    let i = start;
    while (true) {
      days.push(i as DayIndex);
      if (i === end) break;
      i = ((i + 1) % 7) as DayIndex;
    }
    return days;
  }
  // single day
  const d = DAY_MAP[token];
  return d === undefined ? [] : [d];
}

/**
 * Parse a human-friendly working hours string into a schedule array.
 * Supported examples:
 * - "24/7"
 * - "closed"
 * - "Mon-Fri:09:00-17:00; Sat-Sun:closed"
 * - "Mon:09:00-12:00,13:00-17:00; Tue:09:00-17:00"
 * - "Mon-Fri:20:00-02:00" (overnight ranges supported)
 * Separators: entries separated by `;` or newline. Time ranges per day separated by `,`.
 */
export function parseWorkingHours(input?: WorkingHoursInput): { schedules: DaySchedule[]; alwaysOpen: boolean; alwaysClosed: boolean; notApplicable: boolean } {
  const normalized = normalizeWorkingHoursInput(input);
  if (!normalized) return { schedules: [], alwaysOpen: false, alwaysClosed: false, notApplicable: false };
  const raw = normalized.trim();
  if (!raw) return { schedules: [], alwaysOpen: false, alwaysClosed: false, notApplicable: false };
  
  // Try to parse as JSON first (new CMS format)
  if (raw.startsWith('{')) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        // Check for not_applicable flag
        if (parsed.not_applicable === true) {
          return { schedules: [], alwaysOpen: false, alwaysClosed: false, notApplicable: true };
        }
        // Check for 24/7 flag
        if (parsed.is_24_7 === true) {
          return { schedules: [], alwaysOpen: true, alwaysClosed: false, notApplicable: false };
        }
        // Parse structured days format
        if (parsed.days && typeof parsed.days === 'object') {
          const dayKeyMap: Record<string, DayIndex> = {
            sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
          };
          const schedules: DaySchedule[] = [];
          
          for (const [dayName, dayData] of Object.entries(parsed.days)) {
            const dayIndex = dayKeyMap[dayName.toLowerCase()];
            if (dayIndex === undefined) continue;
            
            const day = dayData as { is_open?: boolean; open?: string; close?: string };
            if (!day.is_open) {
              schedules.push({ days: [dayIndex], ranges: [] }); // closed
            } else if (day.open && day.close) {
              const startMin = toMinutes(day.open);
              const endMin = toMinutes(day.close);
              schedules.push({
                days: [dayIndex],
                ranges: [{ startMin, endMin, overnight: endMin <= startMin }]
              });
            }
          }
          
          return { schedules, alwaysOpen: false, alwaysClosed: schedules.length === 0, notApplicable: false };
        }
      }
    } catch {
      // Not valid JSON, continue with legacy parsing
    }
  }
  
  const rawLower = raw.toLowerCase();
  if (rawLower === 'not applicable' || rawLower === 'n/a' || rawLower === 'na') return { schedules: [], alwaysOpen: false, alwaysClosed: false, notApplicable: true };
  if (rawLower === '24/7' || rawLower === '24-7' || rawLower === 'always') return { schedules: [], alwaysOpen: true, alwaysClosed: false, notApplicable: false };
  if (rawLower === 'closed' || rawLower === 'closed all' || rawLower === 'closed all days') return { schedules: [], alwaysOpen: false, alwaysClosed: true, notApplicable: false };

  const entries = rawLower.split(/[;\n]+/).map(s => s.trim()).filter(Boolean);
  const schedules: DaySchedule[] = [];

  for (const entry of entries) {
    // format: days:times  or just times (applies to all days)
    const parts = entry.split(':');
    if (parts.length === 1) {
      // treat as times for all days
      const times = parts[0];
      const ranges = times.split(',').map(t => t.trim()).filter(Boolean);
      const parsedRanges: TimeRange[] = [];
      for (const r of ranges) {
        if (r === 'closed') continue;
        const [s, e] = r.split('-').map(x => x.trim());
        if (!s || !e) continue;
        const startMin = toMinutes(s);
        const endMin = toMinutes(e);
        parsedRanges.push({ startMin, endMin, overnight: endMin <= startMin });
      }
      schedules.push({ days: [0,1,2,3,4,5,6], ranges: parsedRanges });
      continue;
    }

    // days token can itself contain commas (e.g., Mon,Wed-Fri)
    const dayPart = parts.shift()!; // token before first ':'
    const timePart = parts.join(':'); // rejoin rest

    const dayTokens = dayPart.split(',').map(t => t.trim()).filter(Boolean);
    let days: DayIndex[] = [];
    for (const dt of dayTokens) days = days.concat(expandDayToken(dt));
    days = Array.from(new Set(days)) as DayIndex[];

    const ranges = timePart.split(',').map(t => t.trim()).filter(Boolean);
    const parsedRanges: TimeRange[] = [];
    for (const r of ranges) {
      if (r === 'closed') continue;
      const [s, e] = r.split('-').map(x => x.trim());
      if (!s || !e) continue;
      const startMin = toMinutes(s);
      const endMin = toMinutes(e);
      parsedRanges.push({ startMin, endMin, overnight: endMin <= startMin });
    }
    schedules.push({ days, ranges: parsedRanges });
  }

  return { schedules, alwaysOpen: false, alwaysClosed: schedules.length === 0, notApplicable: false };
}

/**
 * Returns true if working hours are set and not "Not Applicable" (e.g., landmarks, monuments)
 * Returns false for empty strings, null, undefined, or "Not Applicable"
 */
export function hasApplicableHours(workingHours?: WorkingHoursInput): boolean {
  const normalized = normalizeWorkingHoursInput(workingHours);
  if (!normalized || normalized.trim() === '') return false;
  const parsed = parseWorkingHours(normalized);
  return !parsed.notApplicable;
}

/**
 * Returns true if `now` falls into any of the schedule ranges.
 */
export function isOpenNow(workingHours?: WorkingHoursInput, now = new Date()): boolean {
  const parsed = parseWorkingHours(workingHours);
  if (parsed.alwaysOpen) return true;
  if (parsed.alwaysClosed) return false;

  const weekday = now.getDay() as DayIndex; // 0 = Sunday
  const nowMin = now.getHours() * 60 + now.getMinutes();

  for (const sched of parsed.schedules) {
    if (!sched.days.includes(weekday)) continue;
    if (sched.ranges.length === 0) return false; // explicitly closed
    for (const r of sched.ranges) {
      if (!r.overnight) {
        if (nowMin >= r.startMin && nowMin <= r.endMin) return true;
      } else {
        // overnight, e.g., 20:00-02:00 -> open if now >= start OR now <= end
        if (nowMin >= r.startMin || nowMin <= r.endMin) return true;
      }
    }
  }

  return false;
}

export function exampleFormats(): string[] {
  return [
    '24/7',
    'closed',
    'Mon-Fri:09:00-17:00; Sat-Sun:closed',
    'Mon:09:00-12:00,13:00-17:00; Tue-Thu:09:00-17:00; Fri:09:00-15:00',
    'Mon-Fri:20:00-02:00',
  ];
}

// Bosnian short day names, index 0 = Sunday
const DAY_NAMES = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'];

function formatRange(r: { startMin: number; endMin: number }) {
  const hh = (n: number) => String(Math.floor(n / 60)).padStart(2, '0');
  const mm = (n: number) => String(n % 60).padStart(2, '0');
  return `${hh(r.startMin)}:${mm(r.startMin)}-${hh(r.endMin)}:${mm(r.endMin)}`;
}

/**
 * Format working hours into a human-friendly multiline string.
 * Example output:
 * Mon-Fri: 08:00-17:00
 * Sat: 10:00-16:00
 * Sun: Closed
 */
export function formatWorkingHours(workingHours?: WorkingHoursInput): string {
  const parsed = parseWorkingHours(workingHours);
  if (parsed.alwaysOpen) return 'Open 24/7';
  if (parsed.alwaysClosed) return 'Closed';

  // Build per-day map of range strings
  const dayMap: Record<number, string[]> = {};
  for (let d = 0; d < 7; d++) dayMap[d] = [];

  for (const sched of parsed.schedules) {
    for (const d of sched.days) {
      if (!sched.ranges || sched.ranges.length === 0) {
        // explicit closed for those days
        dayMap[d] = [];
      } else {
        const strs = sched.ranges.map(r => formatRange(r));
        dayMap[d] = dayMap[d].concat(strs);
      }
    }
  }

  // Normalize dayMap: empty array -> Closed
  const dayStrs = dayMap;

  // Compress consecutive days with identical strings into ranges
  // Show Monday-first: order indices [1,2,3,4,5,6,0]
  const order = [1, 2, 3, 4, 5, 6, 0];
  const lines: string[] = [];
  let i = 0;
  while (i < 7) {
    const startIdx = order[i];
    const val = (dayStrs[startIdx] || []).join(', ');
    let j = i + 1;
    while (j < 7) {
      const idx = order[j];
      if ((dayStrs[idx] || []).join(', ') === val) j++; else break;
    }
    const endIdx = order[j - 1];
    const dayLabel = startIdx === endIdx ? DAY_NAMES[startIdx] : `${DAY_NAMES[startIdx]}-${DAY_NAMES[endIdx]}`;
    const display = val ? val : 'Zatvoreno';
    lines.push(`${dayLabel}: ${display}`);
    i = j;
  }

  return lines.join('\n');
}
