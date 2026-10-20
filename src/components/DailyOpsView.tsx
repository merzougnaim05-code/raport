import React, { useMemo, useState } from 'react';
import { AppData } from '../types';
import { PrintSheetRenderer } from './PrintSheetRenderer';
import { getDaysInMonth, getCanonicalMonthName } from '../utils/dateUtils';
import {
  ClipboardCheck,
  Building,
  Printer,
  ChevronRight,
  ChevronLeft,
  FileText,
  Layers,
} from 'lucide-react';

interface DailyOpsViewProps {
  data: AppData;
  startDay: number;
  openPrint: (title: string, content: React.ReactNode, wide?: boolean) => void;
}

/** صفحة واحدة لكل يوم داخل مهمة الطباعة الشهرية. */
const MonthPages: React.FC<{
  kind: 'attendance' | 'internalSrv';
  data: AppData;
  days: number[];
  blank: boolean;
}> = ({ kind, data, days, blank }) => (
  <div>
    {days.map((d, idx) => (
      <div key={d} style={{ breakAfter: idx === days.length - 1 ? 'auto' : 'page' }}>
        <PrintSheetRenderer type={kind} data={data} dayNum={d} blank={blank} />
      </div>
    ))}
  </div>
);

type CardDef = {
  key: 'attendance' | 'internalSrv';
  title: string;
  desc: string;
  kind: 'attendance' | 'internalSrv';
  icon: React.ReactNode;
  accent: string;
};

export const DailyOpsView: React.FC<DailyOpsViewProps> = ({ data, startDay, openPrint }) => {
  const [day, setDay] = useState<number>(Math.max(1, Math.min(startDay, getDaysInMonth(data.meta))));
  const daysInMonth = getDaysInMonth(data.meta);
  const dayNums = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);
  const monthName = getCanonicalMonthName(data.meta.monthNum) || data.meta.monthName || '';

  const cards: CardDef[] = [
    {
      key: 'attendance',
      title: 'كشف الحضور اليومي للعمال المهنيين',
      desc: 'قائمة العمال بتوقيت الدخول والخروج والإمضاء + استلام المهام (صباحاً / مساءً / ليلاً) وملاحظات مسؤول الخدمات والمقتصد.',
      kind: 'attendance',
      icon: <ClipboardCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />,
      accent: 'emerald',
    },
    {
      key: 'internalSrv',
      title: 'التقرير اليومي لمسؤول الخدمة الداخلية',
      desc: 'حالة المحلات (الإنارة/التدفئة/النظافة/الإتلافات) + الحالة الأمنية + جدول التأخرات والغيابات + الأعمال المنجزة والمستعجلة + الإمضاءات.',
      kind: 'internalSrv',
      icon: <Building className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />,
      accent: 'indigo',
    },
  ];

  const printDayCard = (c: CardDef, blank: boolean) => {
    openPrint(
      `${c.title} — اليوم ${day}${blank ? ' (فراغ)' : ''}`,
      <PrintSheetRenderer type={c.kind} data={data} dayNum={day} blank={blank} />,
      c.kind === 'attendance'
    );
  };

  const printMonthCard = (c: CardDef, blank: boolean) => {
    openPrint(
      `${c.title} — ${monthName} كاملاً (${daysInMonth} ورقة، كل يوم بتاريخه)${blank ? ' — نسخة فراغ' : ''}`,
      <MonthPages kind={c.kind} data={data} days={dayNums} blank={blank} />,
      c.kind === 'attendance'
    );
  };

  const accentBtn = (c: CardDef, solid: boolean) =>
    [
      'flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap',
      solid
        ? c.accent === 'emerald'
          ? 'text-white bg-emerald-600 hover:bg-emerald-700'
          : 'text-white bg-indigo-600 hover:bg-indigo-700'
        : c.accent === 'emerald'
        ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800'
        : 'text-indigo-800 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800',
    ].join(' ');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 transition-colors">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <Layers className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            أوراق التسيير اليومي — الحضور والخدمة الداخلية
          </h2>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          ورقتان رسميتان يوميتان: بضغطة واحدة يمكن طباعة اليوم {day} بتاريخه، أو طباعة الشهر كاملاً
          <b> ({monthName}) </b>
          — كل يوم صفحة مستقلة بتاريخه. زر «فراغ» يطبع نسخاً رسمية فارغة للتعبئة اليدوية.
        </p>

        {/* Day selector */}
        <div className="flex items-center gap-2 mt-4">
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
            <button
              onClick={() => setDay(Math.max(1, day - 1))}
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              title="اليوم السابق"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded font-black text-sm text-emerald-700 dark:text-emerald-400 min-w-[64px] text-center">
              اليوم {day}
            </span>
            <button
              onClick={() => setDay(Math.min(daysInMonth, day + 1))}
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              title="اليوم الموالي"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
          <select
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 cursor-pointer focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
          >
            {dayNums.map((d) => (
              <option key={d} value={d} className="dark:bg-slate-800">
                يوم {d}
              </option>
            ))}
          </select>
          <button
            onClick={() => printMonthCard(cards[0], false)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 rounded-lg transition-colors cursor-pointer"
            title="طباعة الشهر كاملاً: كل يوم صفحة بتاريخه"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>الشهر كاملاً ({daysInMonth} ورقة)</span>
          </button>
        </div>
      </div>

      {/* Two sheets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((c) => (
          <div
            key={c.key}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-3 transition-colors"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              {c.icon}
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{c.title}</h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.desc}</p>
            <div className="pt-1 grid grid-cols-1 gap-2">
              <button onClick={() => printDayCard(c, false)} className={accentBtn(c, true)}>
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة اليوم {day} بتاريخه</span>
              </button>
              <button onClick={() => printDayCard(c, true)} className={accentBtn(c, false)}>
                <FileText className="w-3.5 h-3.5" />
                <span>طباعة اليوم فارغاً</span>
              </button>
              <button onClick={() => printMonthCard(c, false)} className={accentBtn(c, true)}>
                <Layers className="w-3.5 h-3.5" />
                <span>طباعة الشهر كاملاً (كل يوم صفحة)</span>
              </button>
              <button onClick={() => printMonthCard(c, true)} className={accentBtn(c, false)}>
                <FileText className="w-3.5 h-3.5" />
                <span>طباعة الشهر كاملاً فراغاً</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
