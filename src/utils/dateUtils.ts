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
  // تصحيح الصيغة المقلوبة (مثل "2027/2026"): نرتب السنتين تصاعديًا —
  // سبتمبر–ديسمبر => الأصغر، جانفي–أوت => الأكبر.
  const sorted = [...years].sort((a, b) => a - b);
  if (sorted.length >= 2) return m >= 9 ? sorted[0] : sorted[1];
  if (sorted.length === 1) return sorted[0];
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

/** يوم من أيام أسبوع الجدول (الأحد–الخميس). */
export interface WeekDayInfo {
  date: Date;
  dayNum: number;
  monthNum: number;
  year: number;
  weekday: string;
}

/**
 * أيام الأسبوع رقم weekNum (1..4) من الشهر المختار في البرنامج:
 * الأسبوع يُرسى على الأحد رقم weekNum في الشهر (الأحد الأول/الثاني/الثالث/الرابع)،
 * وأيامه الأحد–الخميس. اليوم الأخير قد يقع في الشهر التالي (أسبوع 4) فيُعرض بتاريخه.
 */
export function getWeekDays(meta: InstitutionMeta, weekNum: number, now: Date = new Date()): WeekDayInfo[] {
  const m = meta.monthNum && meta.monthNum >= 1 && meta.monthNum <= 12 ? meta.monthNum : now.getMonth() + 1;
  const y = resolveReportYear(meta, now);
  const first = new Date(y, m - 1, 1);
  const firstSunday = 1 + ((7 - first.getDay()) % 7);
  const wn = Math.min(Math.max(Math.floor(weekNum) || 1, 1), 4);
  const sundayDay = firstSunday + (wn - 1) * 7;
  const days: WeekDayInfo[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(y, m - 1, sundayDay + i);
    days.push({
      date: d,
      dayNum: d.getDate(),
      monthNum: d.getMonth() + 1,
      year: d.getFullYear(),
      weekday: WEEKDAY_AR[d.getDay()],
    });
  }
  return days;
}

/** مفتاح حفظ جدول أسبوعي: «سنة-شهر-أسبوع» (مثال: 2026-11-w2). */
export function weeklyMenuKey(meta: InstitutionMeta, weekNum: number, now: Date = new Date()): string {
  const m = meta.monthNum && meta.monthNum >= 1 && meta.monthNum <= 12 ? meta.monthNum : now.getMonth() + 1;
  const y = resolveReportYear(meta, now);
  return `${y}-${String(m).padStart(2, '0')}-w${Math.min(Math.max(Math.floor(weekNum) || 1, 1), 4)}`;
}

/**
 * رقم الأسبوع (1..4) الذي يقع فيه اليوم الحالي داخل الشهر المختار؛
 * إن كان اليوم خارج الشهر المختار فالأسبوع الأول.
 */
export function getCurrentWeekNum(meta: InstitutionMeta, now: Date = new Date()): number {
  const m = meta.monthNum && meta.monthNum >= 1 && meta.monthNum <= 12 ? meta.monthNum : now.getMonth() + 1;
  const y = resolveReportYear(meta, now);
  if (now.getFullYear() !== y || now.getMonth() + 1 !== m) return 1;
  const first = new Date(y, m - 1, 1);
  const firstSunday = 1 + ((7 - first.getDay()) % 7);
  const today = now.getDate();
  if (today < firstSunday) return 1;
  return Math.min(Math.floor((today - firstSunday) / 7) + 1, 4);
}

/** تاريخ عربي كامل: «25 نوفمبر 2026». */
export function formatArabicDate(date: Date): string {
  return `${date.getDate()} ${getCanonicalMonthName(date.getMonth() + 1)} ${date.getFullYear()}`;
}

/** يوم أسبوع بصيغة عربية كاملة: «الأحد 01 نوفمبر 2026». */
export function formatWeekDay(d: WeekDayInfo): string {
  return `${d.weekday} ${String(d.dayNum).padStart(2, '0')} ${getCanonicalMonthName(d.monthNum)} ${d.year}`;
}
