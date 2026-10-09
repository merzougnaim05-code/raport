import { ShiftCellData, SijlRow } from '../types';

/** "HH:MM" -> minutes since midnight, or null. */
export function parseTimeToMinutes(t?: string): number | null {
  if (!t) return null;
  const m = String(t).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

/** Hours between two "HH:MM" times (overnight shifts wrap past midnight). */
export function shiftHoursBetween(from?: string, to?: string): number | null {
  const a = parseTimeToMinutes(from);
  const b = parseTimeToMinutes(to);
  if (a === null || b === null) return null;
  let diff = b - a;
  if (diff <= 0) diff += 24 * 60;
  return diff / 60;
}

/**
 * Average daily work hours for a worker from the annual program schedule
 * (mean of defined non-rest day shifts). Null when no usable schedule.
 */
export function avgDailyShiftHours(schedule?: Record<string, ShiftCellData>): number | null {
  if (!schedule) return null;
  const hours: number[] = [];
  Object.values(schedule).forEach((cell) => {
    if (!cell || cell.mode === 'راحة') return;
    const h = shiftHoursBetween(cell.from, cell.to);
    if (h !== null && h > 0 && h <= 24) hours.push(h);
  });
  if (hours.length === 0) return null;
  return hours.reduce((s, x) => s + x, 0) / hours.length;
}

export interface SijlStats {
  sick: number;
  unjust: number;
  late: number;
  early: number;
  comp: number;
  /** Total absence days (sick + unjustified). */
  absDays: number;
  /** Total absence hours: full-day absences × daily hours + delays + early leaves. */
  absHours: number | null;
  compDays: number;
  netKind: 'abs' | 'comp' | 'zero';
  /** Net remaining days (absence days if absences win, compensation days if compensations win). */
  netDays: number;
}

const num = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/** Full statistics for one worker row given their average daily hours. */
export function computeSijlStats(row: SijlRow | undefined, dailyHours: number | null): SijlStats {
  const sick = num(row?.sick);
  const unjust = num(row?.unjust);
  const late = num(row?.late);
  const early = num(row?.early);
  const comp = num(row?.comp);
  const absDays = sick + unjust;
  const absHours = dailyHours !== null ? absDays * dailyHours + late + early : null;
  const diff = absDays - comp;
  return {
    sick,
    unjust,
    late,
    early,
    comp,
    absDays,
    absHours,
    compDays: comp,
    netKind: diff > 0 ? 'abs' : diff < 0 ? 'comp' : 'zero',
    netDays: Math.abs(diff),
  };
}

/** Round to 2 decimals for display. */
export function fmt(n: number): string {
  return String(Math.round(n * 100) / 100);
}
