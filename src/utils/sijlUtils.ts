import { DayReportData, ShiftCellData, SijlField, SijlRow, Worker } from '../types';

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
  sick: number[];
  unjust: number[];
  late: number[];
  early: number[];
  comp: number[];
  /** Total absence days (sick + unjustified). */
  absDays: number;
  /** Total absence hours: full-day absences × daily hours + delays + early leaves (1h each). */
  absHours: number | null;
  compDays: number;
  netKind: 'abs' | 'comp' | 'zero';
  /** Net remaining days (absence days if absences win, compensation days if compensations win). */
  netDays: number;
}

const daysIn = (arr: unknown, maxDay: number): number[] =>
  Array.isArray(arr)
    ? arr.filter((d) => Number.isInteger(d) && (d as number) >= 1 && (d as number) <= maxDay)
    : [];

/**
 * Full statistics for one worker row given average daily hours.
 * Each delay / early-leave mark counts as one hour.
 */
export function computeSijlStats(row: SijlRow | undefined, dailyHours: number | null, maxDay = 31): SijlStats {
  const sick = daysIn(row?.sick, maxDay);
  const unjust = daysIn(row?.unjust, maxDay);
  const late = daysIn(row?.late, maxDay);
  const early = daysIn(row?.early, maxDay);
  const comp = daysIn(row?.comp, maxDay);
  const absDays = sick.length + unjust.length;
  const absHours = dailyHours !== null ? absDays * dailyHours + late.length + early.length : null;
  const compDays = comp.length;
  const diff = absDays - compDays;
  return {
    sick,
    unjust,
    late,
    early,
    comp,
    absDays,
    absHours,
    compDays,
    netKind: diff > 0 ? 'abs' : diff < 0 ? 'comp' : 'zero',
    netDays: Math.abs(diff),
  };
}

/** Round to 2 decimals for display. */
export function fmt(n: number): string {
  return String(Math.round(n * 100) / 100);
}

// =========================================================================
// الجلب الآلي من التقارير اليومية
// =========================================================================

/**
 * Map a daily status label → sijl field.
 * Returns null for non-absence statuses (حاضر، يوم كامل، تسخير، عطلة استثنائية...).
 */
export function sijlFieldForStatus(status?: string): SijlField | null {
  switch ((status || '').trim()) {
    case 'عطلة مرضية':
      return 'sick';
    case 'غياب غير شرعي':
    case 'غير مبرر':
    case 'عدم الإمضاء على ورقة الحضور':
    case 'طلب غياب':
      return 'unjust';
    case 'تأخر':
      return 'late';
    case 'خروج قبل الوقت':
    case 'رخصة الخروج قبل الوقت':
      return 'early';
    case 'تعويض يوم':
    case 'طلب تعويض':
      return 'comp';
    default:
      return null;
  }
}

/** Keyword fallback for free-text duration/reason in detailed attendance rows. */
export function sijlFieldForText(text?: string): SijlField | null {
  const t = (text || '').trim();
  if (!t) return null;
  const exact = sijlFieldForStatus(t);
  if (exact) return exact;
  if (/مرض|مريض|طبية|طبيب/.test(t)) return 'sick';
  if (/تعويض|عوض/.test(t)) return 'comp';
  if (/تأخر|متأخر/.test(t)) return 'late';
  if (/خروج|مبكر|مبكرة|قبل الوقت/.test(t)) return 'early';
  if (/غير شرعي|غير مبرر|بدون مبرر|غياب/.test(t)) return 'unjust';
  return null;
}

/**
 * Auto-derive sijl marks from daily reports:
 * 1) workerStatus per worker/day → mapped field,
 * 2) detailed attendance rows (المواظبة) matched by worker name → field from
 *    duration, then reason, defaulting to unjustified (it's an absence row).
 */
export function computeAutoSijl(
  days: Record<number, DayReportData>,
  workers: Worker[],
  maxDay = 31
): Record<string, SijlRow> {
  const out: Record<string, SijlRow> = {};
  const add = (wid: string, f: SijlField, d: number) => {
    if (!Number.isInteger(d) || d < 1 || d > maxDay) return;
    const row = out[wid] || (out[wid] = {});
    const arr = row[f] || (row[f] = []);
    if (!arr.includes(d)) arr.push(d);
  };
  const byName = new Map<string, string>();
  workers.forEach((w) => {
    const n = (w.name || '').trim();
    if (n && !byName.has(n)) byName.set(n, w.id);
  });
  for (let d = 1; d <= maxDay; d++) {
    const day = days[d];
    if (!day) continue;
    workers.forEach((w) => {
      const f = sijlFieldForStatus(day.workerStatus?.[w.id]);
      if (f) add(w.id, f, d);
    });
    (day.attendance || []).forEach((a) => {
      const wid = byName.get((a?.name || '').trim());
      if (!wid) return;
      const f = sijlFieldForText(a.duration) || sijlFieldForText(a.reason) || 'unjust';
      add(wid, f, d);
    });
  }
  Object.values(out).forEach((row) => {
    (Object.keys(row) as SijlField[]).forEach((f) => row[f]?.sort((x, y) => x - y));
  });
  return out;
}

/** Union of manual marks + auto-derived marks (no double counting). */
export function mergeSijlRows(manual: SijlRow | undefined, auto: SijlRow | undefined): SijlRow {
  const fields: SijlField[] = ['sick', 'unjust', 'late', 'early', 'comp'];
  const out: SijlRow = {};
  fields.forEach((f) => {
    const set = new Set<number>([...(manual?.[f] || []), ...(auto?.[f] || [])]);
    if (set.size > 0) out[f] = [...set].sort((a, b) => a - b);
  });
  return out;
}
