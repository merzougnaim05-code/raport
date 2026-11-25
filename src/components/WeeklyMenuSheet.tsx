import React from 'react';
import { InstitutionMeta, MealTemplate } from '../types';
import { Letterhead } from './Letterhead';
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

/**
 * جدول الوجبات الغذائية الأسبوعي (الأحد–الخميس) — ورقة رسمية مزخرفة:
 * ترويسة رسمية، عنوان الجدول مع تاريخي البداية والنهاية، جدول الأيام
 * (اليوم والتاريخ | الوجبة المقدمة | الملاحظات)، سطر «وادي الماء في:»
 * بالتاريخ، ثم ثلاث توقيعات (المقتصد يميناً، الطبيب وسطاً، المدير يساراً).
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
      style={{ fontFamily: "'Traditional Arabic','Amiri','Sakkal Majalla',serif" }}
    >
      {/* إطار مزدوج مزخرف */}
      <div className="border-[3px] border-double border-emerald-900 p-1.5">
        <div className="border border-emerald-900/60 px-5 py-6">
          <Letterhead
            meta={meta}
            title="جدول الوجبات الغذائية الأسبوعية"
            subtitle={range}
          />

          {/* فاصل زخرفي */}
          <div className="flex items-center gap-3 -mt-2 mb-5" aria-hidden="true">
            <span className="flex-1 border-t border-emerald-900/50" />
            <span className="text-emerald-900 text-sm leading-none">◆</span>
            <span className="flex-1 border-t border-emerald-900/50" />
          </div>

          {/* جدول الأيام */}
          <table className="w-full border-collapse text-center">
            <colgroup>
              <col style={{ width: '24%' }} />
              <col style={{ width: '46%' }} />
              <col style={{ width: '30%' }} />
            </colgroup>
            <thead>
              <tr className="bg-emerald-900 text-white">
                <th className="border border-emerald-900 py-2.5 px-2 text-base font-black">اليوم</th>
                <th className="border border-emerald-900 py-2.5 px-2 text-base font-black">الوجبة المقدمة</th>
                <th className="border border-emerald-900 py-2.5 px-2 text-base font-black">الملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {days.map((d, i) => {
                const meal = meals[i] || null;
                const note = notes[i] || '';
                return (
                  <tr key={i} className={i % 2 === 1 ? 'bg-emerald-50/70' : 'bg-white'}>
                    <td className="border border-emerald-900/70 py-3 px-2">
                      <div className="font-black text-base">{d.weekday}</div>
                      <div className="text-sm text-slate-700">
                        {String(d.dayNum).padStart(2, '0')} {getCanonicalMonthName(d.monthNum)} {d.year}
                      </div>
                    </td>
                    <td className="border border-emerald-900/70 py-3 px-3">
                      {meal ? (
                        <>
                          <div className="font-black text-base leading-snug">{meal.name}</div>
                          {meal.description && meal.description !== meal.name && (
                            <div className="text-sm text-slate-600 leading-relaxed mt-0.5">
                              {meal.description}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400">{editable ? 'لم تُختر وجبة بعد' : '—'}</span>
                      )}
                    </td>
                    <td className="border border-emerald-900/70 py-3 px-2">
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
