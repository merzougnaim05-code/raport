import React, { useState } from 'react';
import { SijlRow, Worker } from '../types';
import { avgDailyShiftHours, computeSijlStats, fmt } from '../utils/sijlUtils';
import { ClipboardList, Printer, Save, User } from 'lucide-react';

interface SijlViewProps {
  workers: Worker[];
  rows: Record<string, SijlRow>;
  annualRows: Record<string, any>;
  onUpdateRow: (workerId: string, patch: Partial<SijlRow>) => void;
  onPrintIndividual: (workerId: string) => void;
  onPrintCollective: () => void;
  onSave: () => void;
  lastSavedText: string;
}

const numVal = (v: number | undefined): string => (v ? String(v) : '');

export const SijlView: React.FC<SijlViewProps> = ({
  workers,
  rows,
  annualRows,
  onUpdateRow,
  onPrintIndividual,
  onPrintCollective,
  onSave,
  lastSavedText,
}) => {
  const [selectedId, setSelectedId] = useState<string>(workers[0]?.id || '');

  const hoursOf = (wid: string) => avgDailyShiftHours(annualRows[wid]?.schedule);
  const statsOf = (wid: string) => computeSijlStats(rows[wid], hoursOf(wid));

  const selWorker = workers.find((w) => w.id === selectedId) || workers[0];
  const selStats = selWorker ? statsOf(selWorker.id) : null;

  const numInput = (
    wid: string,
    field: keyof SijlRow,
    step: string,
    title: string
  ) => (
    <input
      type="number"
      min="0"
      step={step}
      value={numVal(rows[wid]?.[field])}
      onChange={(e) => {
        const v = e.target.value === '' ? undefined : Number(e.target.value);
        onUpdateRow(wid, { [field]: v } as Partial<SijlRow>);
      }}
      title={title}
      className="w-full text-center py-1.5 px-1 bg-transparent hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 rounded border border-transparent focus:border-emerald-500 text-xs font-bold focus:outline-none dark:text-white"
    />
  );

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
            تُحسب ساعات الغياب تلقائيًا من توقيت البرنامج السنوي لكل عامل — أدخل الأيام والساعات فقط.
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

      {/* Entry table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            رصد الغيابات (بالأيام) والتأخرات (بالساعات)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 text-center">
                <th className="py-2.5 px-2 border-l border-slate-200 dark:border-slate-700 w-10">ر.ت</th>
                <th className="py-2.5 px-3 border-l border-slate-200 dark:border-slate-700 text-right min-w-[130px]">العامل</th>
                <th className="py-2.5 px-2 border-l border-slate-200 dark:border-slate-700 w-24">عطلة مرضية (يوم)</th>
                <th className="py-2.5 px-2 border-l border-slate-200 dark:border-slate-700 w-24">غياب غير شرعي (يوم)</th>
                <th className="py-2.5 px-2 border-l border-slate-200 dark:border-slate-700 w-24">التأخرات (ساعة)</th>
                <th className="py-2.5 px-2 border-l border-slate-200 dark:border-slate-700 w-24">الخروج قبل الوقت (ساعة)</th>
                <th className="py-2.5 px-2 border-l border-slate-200 dark:border-slate-700 w-24">طلب تعويض (يوم)</th>
                <th className="py-2.5 px-2 w-24">ساعات الغياب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {workers.map((w, idx) => {
                const st = statsOf(w.id);
                return (
                  <tr key={w.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                    <td className="py-2 px-2 text-center text-slate-500 dark:text-slate-400 font-semibold border-l border-slate-200 dark:border-slate-700">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 border-l border-slate-200 dark:border-slate-700">
                      <div className="font-bold text-slate-900 dark:text-white">{w.name || '—'}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{w.job || ''}</div>
                    </td>
                    <td className="p-1 border-l border-slate-200 dark:border-slate-700">{numInput(w.id, 'sick', '0.5', 'أيام العطلة المرضية')}</td>
                    <td className="p-1 border-l border-slate-200 dark:border-slate-700">{numInput(w.id, 'unjust', '0.5', 'أيام الغياب غير الشرعي')}</td>
                    <td className="p-1 border-l border-slate-200 dark:border-slate-700">{numInput(w.id, 'late', '0.5', 'ساعات التأخرات')}</td>
                    <td className="p-1 border-l border-slate-200 dark:border-slate-700">{numInput(w.id, 'early', '0.5', 'ساعات الخروج قبل الوقت')}</td>
                    <td className="p-1 border-l border-slate-200 dark:border-slate-700">{numInput(w.id, 'comp', '0.5', 'أيام طلب التعويض')}</td>
                    <td className="py-2 px-2 text-center font-black text-emerald-800 dark:text-emerald-400">
                      {st.absHours === null ? '—' : `${fmt(st.absHours)} سا`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual sheet preview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              الورقة الفردية للعامل
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

        {selWorker && selStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {[
              { label: 'عطلة مرضية', value: `${fmt(selStats.sick)} يوم` },
              { label: 'غياب غير شرعي', value: `${fmt(selStats.unjust)} يوم` },
              { label: 'التأخرات', value: `${fmt(selStats.late)} سا` },
              { label: 'الخروج قبل الوقت', value: `${fmt(selStats.early)} سا` },
              { label: 'طلب تعويض', value: `${fmt(selStats.comp)} يوم` },
              { label: 'ساعات الغياب', value: selStats.absHours === null ? '—' : `${fmt(selStats.absHours)} سا` },
              { label: 'إجمالي الغيابات', value: `${fmt(selStats.absDays)} يوم` },
              {
                label: selStats.netKind === 'abs' ? 'أيام الغياب المتبقية' : selStats.netKind === 'comp' ? 'أيام التعويض المستحقة' : 'الرصيد',
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
          <span>الصافي = إجمالي الغيابات (مرضية + غير شرعي) ناقص التعويضات: الفائض للغياب أيامُ غياب، والفائض للتعويض أيامُ تعويض.</span>
        </p>
      </div>

      {lastSavedText && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">{lastSavedText}</p>
      )}
    </div>
  );
};
