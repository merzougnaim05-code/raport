import { InstitutionMeta } from '../types';
import { WEEKDAY_AR } from '../data/initialData';

/** Extract all 4-digit years from a school-year string like "2025 / 2026". */
export function extractYears(yearStr: string): number[] {
  const matches = String(yearStr || '').match(/\d{4}/g);
  if (!matches) return [];
  return matches.map((m) => parseInt(m, 10)).filter((n) => n >= 1900 && n <= 2100);
}

/** Current school year label based on real date: Sep-Dec => "Y / Y+1", else "Y-1 / Y". */
export function getDefaultSchoolYear(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  if (m >= 9) return `${y} / ${y + 1}`;
  return `${y - 1} / ${y}`;
}

/**
 * Resolve the Gregorian year for a day number in the current report month.
 * - If the viewed month is the current real month, trust the real year
 *   (fixes outdated "السنة الدراسية" setting, e.g. Sep 2026 showing 2025).
 * - Else with a "YYYY / YYYY" range: Sep-Dec => first year, Jan-Aug => second.
 * - Else single year or fallback to current year.
 */
export function resolveReportYear(meta: InstitutionMeta, now: Date = new Date()): number {
  const m = meta.monthNum || now.getMonth() + 1;
  // Current month viewed => real calendar year is always correct.
  if (m === now.getMonth() + 1) return now.getFullYear();

  const years = extractYears(meta.year || '');
  if (years.length >= 2) return m >= 9 ? years[0] : years[1];
  if (years.length === 1) return years[0];
  return now.getFullYear();
}

/** Arabic weekday name for a day number, e.g. 27 سبتمبر 2026 => "الأحد". */
export function getWeekdayName(dayNum: number, meta: InstitutionMeta, now: Date = new Date()): string {
  const m = meta.monthNum || now.getMonth() + 1;
  const y = resolveReportYear(meta, now);
  try {
    const dt = new Date(y, m - 1, dayNum);
    if (dt.getMonth() !== m - 1) return '';
    return WEEKDAY_AR[dt.getDay()];
  } catch {
    return '';
  }
}
