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
 * السنة تُستمد حصريًا من «السنة الدراسية / المالية» التي أدخلها المستخدم:
 * - "YYYY / YYYY": سبتمبر–ديسمبر => السنة الأولى، جانفي–أوت => السنة الثانية.
 * - سنة واحدة => تُعتمد كما هي.
 * لا فرض لسنة اليوم الحقيقي حتى لا "تتبدل" السنة عند تغيير الشهر.
 */
export function resolveReportYear(meta: InstitutionMeta, now: Date = new Date()): number {
  const m = meta.monthNum || now.getMonth() + 1;

  const years = extractYears(meta.year || '');
  if (years.length >= 2) return m >= 9 ? years[0] : years[1];
  if (years.length === 1) return years[0];
  return now.getFullYear();
}

/** هل تبدو «السنة الدراسية» المدخلة منتهية الصلاحية مقارنة بسنة اليوم الحقيقية؟ */
export function isSchoolYearStale(meta: InstitutionMeta, now: Date = new Date()): boolean {
  const real = now.getFullYear();
  const years = extractYears(meta.year || '');
  if (years.length === 0) return true;
  return !years.includes(real);
}

/** Arabic month names (canonical source — must match initialData.ARABIC_MONTHS). */
export const CANONICAL_ARABIC_MONTHS = [
  'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
  'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

/** Canonical month name for a month number (1-12). */
export function getCanonicalMonthName(monthNum: number): string {
  if (monthNum >= 1 && monthNum <= 12) return CANONICAL_ARABIC_MONTHS[monthNum - 1];
  return '';
}

/** Number of days in the currently viewed report month (uses resolved year). */
export function getDaysInMonth(meta: InstitutionMeta, now: Date = new Date()): number {
  const m = meta.monthNum && meta.monthNum >= 1 && meta.monthNum <= 12 ? meta.monthNum : now.getMonth() + 1;
  const y = resolveReportYear(meta, now);
  return new Date(y, m, 0).getDate();
}

/** Unified display label for a day: weekday + day + canonical month + resolved year. */
export function getDayDisplayLabel(dayNum: number, meta: InstitutionMeta, now: Date = new Date()): string {
  const m = meta.monthNum || now.getMonth() + 1;
  const y = resolveReportYear(meta, now);
  const monthName = getCanonicalMonthName(m) || meta.monthName;
  return `${dayNum} ${monthName} ${y}`;
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
