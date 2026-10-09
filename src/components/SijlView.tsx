import React, { useState } from 'react';
import { SIJL_FIELDS, SijlField, SijlRow, Worker } from '../types';
import { avgDailyShiftHours, computeSijlStats, fmt } from '../utils/sijlUtils';
import { ClipboardList, Printer, Save, User } from 'lucide-react';

interface SijlViewProps {
  workers: Worker[];
  rows: Record<string, SijlRow>;
  annualRows: Record<string, any>;
  daysInMonth: number;
  onUpdateRow: (workerId: string, patch: Partial<SijlRow>) => void;
  onPrintIndividual: (workerId: string) => void;
  onPrintCollective: () => void;
  onSave: () => void;
  lastSavedText: string;
}

export const SijlView: React.FC<SijlViewProps> = ({
  workers,
  rows,
  annualRows,
  daysInMonth,
  onUpdateRow,
  onPrintIndividual,
  onPrintCollective,
  onSave,
  lastSavedText,
}) => {
  const [selectedId, setSelectedId] = useState<string>(workers[0]?.id || '');
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const hoursOf = (wid: string) => avgDailyShiftHours(annualRows[wid]?.schedule);
  const marksOf = (wid: string, f: SijlField): number[] =>
    Array.isArray(rows[wid]?.[f]) ? (rows[wid]?.[f] as number[]).filter((d) => d >= 1 && d <= daysInMonth) : [];

  const toggleDay = (wid: string, f: SijlField, day: number) => {
    const cur = marksOf(wid, f);
    const next = cur.includes(day) ? cur.filter((d) => d !== day) : [...cur, day].sort((a, b) => a - b);
    onUpdateRow(wid, { [f]: next } as Partial<SijlRow>);
  };

  const hasAny = (wid: string, day: number) =>
    SIJL_FIELDS.some((f) => marksOf(wid, f.id).includes(day));

  const selWorker = workers.find((w) => w.id === selectedId) || workers[0];
  const selStats = selWorker
    ? computeSijlStats(rows[selWorker.id], hoursOf(selWorker.id), daysInMonth)
    : null;
  const selHours = selWorker ? hoursOf(selWorker.id) : null;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 font-black text-xs">
              سجل
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              سجل الغيابات والتأخرات
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ضع علامة 1 في خانة اليوم لكل غياب أو تأخر — تُحسب المجاميع والساعات تلقائيًا من توقيت البرنامج السنوي.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onPrintCollective}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الورقة الجماعية</span>
          </button>
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ</span>
          </button>
        </div>
      </div>

      {/* Individual marking sheet */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              الورقة الفردية — ضع 1 في أيام الغياب والتأخر
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selWorker?.id || ''}
              onChange={(e) => setSelectedId(e.target.value)}
              className="text-xs font-bold p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer focus:outline-none"
            >
              {workers.map((w) => (
                <option key={w.id} value={w.id} className="dark:bg-slate-800">
                  {w.name} — {w.job}
                </option>
              ))}
            </select>
            <button
              onClick={() => selWorker && onPrintIndividual(selWorker.id)}
              disabled={!selWorker}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة ورقته</span>
            </button>
          </div>
        </div>

        {selWorker && (
          <div className="p-4 sm:p-5 space-y-4">
            <div className="text-xs">
              <span className="font-black text-slate-900 dark:text-white text-sm">{selWorker.name}</span>
              <span className="text-slate-500 dark:text-slate-400"> — {selWorker.job}</span>
              <span className="text-slate-500 dark:text-slate-400">
                {' '}• معدل يوم العمل: <b>{selHours === null ? '— (لا توقيت في السنوي)' : `${fmt(selHours)} سا`}</b>
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2 px-2 border-l border-slate-200 dark:border-slate-700 text-right min-w-[130px]">الخانة</th>
                    {days.map((d) => (
                      <th key={d} className="py-1.5 px-0 border-l border-slate-200 dark:border-slate-700 w-8 text-[10px]">
                        {String(d).padStart(2, '0')}
                      </th>
                    ))}
                    <th className="py-2 px-2 w-14">المجموع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {SIJL_FIELDS.map((f) => {
                    const marks = marksOf(selWorker.id, f.id);
                    return (
                      <tr key={f.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                        <td className="py-1.5 px-2 font-bold text-slate-800 dark:text-slate-200 border-l border-slate-200 dark:border-slate-700 text-right">
                          {f.label}
                        </td>
                        {days.map((d) => {
                          const on = marks.includes(d);
                          return (
                            <td key={d} className="p-0.5 border-l border-slate-200 dark:border-slate-700">
                              <button
                                onClick={() => toggleDay(selWorker.id, f.id, d)}
                                title={`${f.label} — اليوم ${d}`}
                                className={`w-7 h-7 rounded-md text-xs font-black transition-all cursor-pointer ${
                                  on
                                    ? 'bg-emerald-600 text-white shadow-sm scale-105'
                                    : 'bg-slate-100 dark:bg-slate-800 text-transparent hover:bg-emerald-100 dark:hover:bg-emerald-950 hover:text-emerald-300'
                                }`}
                              >
                                1
                              </button>
                            </td>
                          );
                        })}
                        <td className="py-1.5 px-2 font-black text-emerald-800 dark:text-emerald-400">
                          {marks.length}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {selStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {[
                  { label: 'ساعات الغياب', value: selStats.absHours === null ? '—' : `${fmt(selStats.absHours)} سا` },
                  { label: 'إجمالي الغيابات', value: `${fmt(selStats.absDays)} يوم` },
                  { label: 'إجمالي التعويضات', value: `${fmt(selStats.compDays)} يوم` },
                  {
                    label: selStats.netKind === 'abs' ? 'أيام الغياب' : selStats.netKind === 'comp' ? 'أيام التعويض' : 'الرصيد',
                    value: selStats.netKind === 'zero' ? 'متعادل' : `${fmt(selStats.netDays)} يوم`,
                  },
                ].map((c) => (
                  <div key={c.label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{c.label}</div>
                    <div className="text-sm font-black text-slate-900 dark:text-white mt-1">{c.value}</div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 shrink-0" />
              <span>كل علامة تأخر أو خروج قبل الوقت = ساعة واحدة. الصافي = الغيابات (مرضية + غير شرعي) ناقص التعويضات.</span>
            </p>
          </div>
        )}
      </div>

      {/* Collective register */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            السجل الجماعي الشهري — 1 في أيام الغياب والتأخر
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                <th className="py-2 px-2 border-l border-slate-200 dark:border-slate-700 w-10">ر.ت</th>
                <th className="py-2 px-3 border-l border-slate-200 dark:border-slate-700 text-right min-w-[130px]">العامل</th>
                {days.map((d) => (
                  <th key={d} className="py-1.5 px-0 border-l border-slate-200 dark:border-slate-700 w-7 text-[10px]">
                    {String(d).padStart(2, '0')}
                  </th>
                ))}
                <th className="py-2 px-2 w-16">الغيابات</th>
                <th className="py-2 px-2 w-16">التعويضات</th>
                <th className="py-2 px-2 min-w-[90px]">النتيجة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {workers.map((w, idx) => {
                const st = computeSijlStats(rows[w.id], hoursOf(w.id), daysInMonth);
                return (
                  <tr key={w.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                    <td className="py-1.5 px-2 text-slate-500 dark:text-slate-400 font-semibold border-l border-slate-200 dark:border-slate-700">
                      {idx + 1}
                    </td>
                    <td className="py-1.5 px-3 font-bold text-slate-900 dark:text-white border-l border-slate-200 dark:border-slate-700 text-right">
                      {w.name}
                    </td>
                    {days.map((d) => (
                      <td key={d} className="p-0.5 border-l border-slate-200 dark:border-slate-700 font-black text-emerald-700 dark:text-emerald-400">
                        {hasAny(w.id, d) ? '1' : ''}
                      </td>
                    ))}
                    <td className="py-1.5 px-2 font-bold border-l border-slate-200 dark:border-slate-700">{fmt(st.absDays)}</td>
                    <td className="py-1.5 px-2 font-bold border-l border-slate-200 dark:border-slate-700">{fmt(st.compDays)}</td>
                    <td className="py-1.5 px-2 font-black text-emerald-800 dark:text-emerald-400">
                      {st.netKind === 'zero' ? '—' : st.netKind === 'abs' ? `غ ${fmt(st.netDays)}` : `ت ${fmt(st.netDays)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {lastSavedText && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">{lastSavedText}</p>
      )}
    </div>
  );
};
