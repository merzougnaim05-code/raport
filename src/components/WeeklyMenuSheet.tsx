import React from 'react';
import { InstitutionMeta, MealTemplate } from '../types';
import { WeekDayInfo, formatWeekDay, formatArabicDate, getCanonicalMonthName } from '../utils/dateUtils';

interface WeeklyMenuSheetProps {
  meta: InstitutionMeta;
  days: WeekDayInfo[];
  meals: (MealTemplate | null)[];
  notes: string[];
  issuedDate: string; // YYYY-MM-DD — تاريخ «وادي الماء في:»
  editable?: boolean;
  onNoteChange?: (i: number, v: string) => void;
  onIssuedDateChange?: (v: string) => void;
}

/** تحويل YYYY-MM-DD إلى Date محلي (دون انزياح المنطقة الزمنية). */
function parseISODate(iso: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date();
}

/** مكونات الوجبة: وصف المكتبة «كسكس، خضار، لحم» يُقسَّم على الفاصلة العربية أو اللاتينية. */
function splitComponents(meal: MealTemplate): string[] {
  const desc = (meal.description || '').trim();
  if (!desc || desc === meal.name) return [];
  return desc
    .split(/،|,/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * جدول الوجبات الغذائية الأسبوعي (الأحد–الخميس) — ورقة رسمية بخط القاهرة:
 * ترويسة خاصة بالجدول (جمهورية/وزارة/مديرية/مؤسسة/سنة دراسية)، عنوان كبير
 * بخط عريض مع زخرفة ✦ وتاريخي البداية والنهاية، جدول بأيام (اليوم والتاريخ |
 * الوجبة المقدمة | الملاحظات) — مكونات كل وجبة مرتبة اثنين اثنين ويفصل بينها
 * الرمز ✦ — ثم سطر «وادي الماء في:» بالتاريخ، وثلاث توقيعات
 * (المقتصد يميناً، الطبيب وسطاً، المدير يساراً).
 */
export const WeeklyMenuSheet: React.FC<WeeklyMenuSheetProps> = ({
  meta,
  days,
  meals,
  notes,
  issuedDate,
  editable = false,
  onNoteChange,
  onIssuedDateChange,
}) => {
  const range = days.length === 5
    ? `من ${formatWeekDay(days[0])} إلى ${formatWeekDay(days[4])}`
    : '';
  const issued = parseISODate(issuedDate);
  const issuedLabel = formatArabicDate(issued);

  return (
    <div
      dir="rtl"
      className="text-slate-900 leading-normal"
      style={{ fontFamily: "'Cairo','IBM Plex Sans Arabic',sans-serif" }}
    >
      {/* إطار مزدوج مزخرف */}
      <div className="border-[3px] border-double border-emerald-900 p-1.5">
        <div className="border border-emerald-900/60 px-5 py-6">
          {/* الترويسة الرسمية — خاصة بهذا الجدول */}
          <div className="text-center pb-4 mb-5 border-b-2 border-emerald-900">
            <div className="text-[13px] font-semibold text-emerald-900">
              {meta.republic || 'الجمهورية الجزائرية الديمقراطية الشعبية'}
            </div>
            <div className="text-[16px] font-extrabold text-emerald-950 mt-1">
              {meta.ministry || 'وزارة التربية الوطنية'}
            </div>
            <div className="flex justify-between items-start text-[12px] font-bold text-slate-700 mt-3 px-1">
              <div className="text-right">
                <div>
                  <span className="text-slate-800">مديرية التربية لولاية:</span>{' '}
                  {meta.wilaya || '—'}
                </div>
                <div className="text-emerald-950 text-[15px] font-black mt-0.5">
                  {meta.institution || '—'}
                </div>
              </div>
              <div className="text-left shrink-0">
                <span className="text-slate-800">السنة الدراسية:</span>{' '}
                {meta.year || '—'}
              </div>
            </div>
          </div>

          {/* العنوان */}
          <div className="text-center mb-5">
            <h2 className="text-[26px] leading-tight font-black text-emerald-950">
              جدول الوجبات الغذائية الأسبوعية
            </h2>
            <div className="flex items-center justify-center gap-2 mt-2" aria-hidden="true">
              <span className="w-16 border-t-2 border-emerald-800" />
              <span className="text-emerald-700 text-sm leading-none">✦</span>
              <span className="w-16 border-t-2 border-emerald-800" />
            </div>
            {range && (
              <div className="text-[14px] font-bold text-emerald-800 mt-2">{range}</div>
            )}
          </div>

          {/* جدول الأيام */}
          <table className="w-full border-collapse text-center">
            <colgroup>
              <col style={{ width: '20%' }} />
              <col style={{ width: '50%' }} />
              <col style={{ width: '30%' }} />
            </colgroup>
            <thead>
              <tr className="bg-emerald-100 text-emerald-950">
                <th className="border border-emerald-900/50 border-b-2 border-b-emerald-900 py-2 px-2 text-[15px] font-black">اليوم</th>
                <th className="border border-emerald-900/50 border-b-2 border-b-emerald-900 py-2 px-2 text-[15px] font-black">الوجبة المقدمة</th>
                <th className="border border-emerald-900/50 border-b-2 border-b-emerald-900 py-2 px-2 text-[15px] font-black">الملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d, i) => {
                const meal = meals[i] || null;
                const note = notes[i] || '';
                const components = meal ? splitComponents(meal) : [];
                return (
                  <tr key={i} className={i % 2 === 1 ? 'bg-emerald-50/50' : 'bg-white'}>
                    <td className="border border-emerald-900/40 py-3 px-2">
                      <div className="font-black text-[15px] text-emerald-950">{d.weekday}</div>
                      <div className="text-[13px] font-semibold text-slate-600 mt-0.5">
                        {String(d.dayNum).padStart(2, '0')} {getCanonicalMonthName(d.monthNum)} {d.year}
                      </div>
                    </td>
                    <td className="border border-emerald-900/40 py-3 px-3 text-right">
                      {meal ? (
                        <>
                          <div className="font-black text-[15px] leading-snug text-emerald-950">{meal.name}</div>
                          {components.length > 0 && (
                            <div className="flex flex-wrap mt-1.5 gap-y-1">
                              {components.map((c, j) => (
                                <span
                                  key={j}
                                  className="basis-1/2 flex items-center gap-1.5 text-[13px] font-semibold text-slate-700"
                                >
                                  <span className="text-emerald-600 text-[10px] leading-none">✦</span>
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400">{editable ? 'لم تُختر وجبة بعد' : '—'}</span>
                      )}
                    </td>
                    <td className="border border-emerald-900/40 py-3 px-2">
                      {editable ? (
                        <input
                          type="text"
                          value={note}
                          onChange={(e) => onNoteChange?.(i, e.target.value)}
                          placeholder="ملاحظة..."
                          className="w-full bg-transparent text-center text-sm py-1 px-1 border-b border-dotted border-slate-300 focus:border-emerald-600 focus:outline-none"
                        />
                      ) : (
                        <span className="text-sm leading-relaxed">{note || '—'}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* سطر المكان والتاريخ — أقصى اليسار */}
          <div className="text-left mt-6 text-base font-bold">
            <span>وادي الماء في: </span>
            {editable ? (
              <input
                type="date"
                value={issuedDate}
                onChange={(e) => e.target.value && onIssuedDateChange?.(e.target.value)}
                className="bg-transparent border-b border-dotted border-slate-400 focus:border-emerald-600 focus:outline-none font-bold px-1"
                style={{ fontFamily: 'inherit' }}
              />
            ) : (
              <span>{issuedLabel}</span>
            )}
          </div>

          {/* التوقيعات الثلاثة: المقتصد يميناً، الطبيب وسطاً، المدير يساراً */}
          <div className="flex justify-between items-start text-center mt-10">
            <div>
              <div className="font-black text-base">المقتصد</div>
              {meta.economistName && (
                <div className="text-sm text-slate-700 mt-0.5">{meta.economistName}</div>
              )}
              <div className="h-14 w-32 border-b border-dotted border-black mt-2 mx-auto" />
            </div>
            <div>
              <div className="font-black text-base">الطبيب</div>
              <div className="h-14 w-32 border-b border-dotted border-black mt-2 mx-auto" />
            </div>
            <div>
              <div className="font-black text-base">المدير</div>
              {meta.directorName && (
                <div className="text-sm text-slate-700 mt-0.5">{meta.directorName}</div>
              )}
              <div className="h-14 w-32 border-b border-dotted border-black mt-2 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
