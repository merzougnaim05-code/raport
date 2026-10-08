import React from 'react';
import { AppData, DayReportData } from '../types';
import { CATEGORIES, STATUS_OPTIONS, ECONOMIST_NOTE_OPTIONS } from '../data/initialData';
import { getWeekdayName as resolveWeekday, resolveReportYear, getCanonicalMonthName, getDaysInMonth } from '../utils/dateUtils';
import { 
  Printer, 
  Save, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Utensils, 
  Users, 
  Building, 
  Wrench, 
  MessageSquare, 
  ClipboardCheck, 
  Plus, 
  Trash2, 
  CheckCheck,
  PenTool,
  Calendar,
  CopyPlus
} from 'lucide-react';

interface DayReportViewProps {
  data: AppData;
  dayNum: number;
  onUpdateDay: (dayNum: number, updater: (prev: DayReportData) => DayReportData) => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  onPrintDay: (blank?: boolean) => void;
  onClearDay: () => void;
  onSave: () => void;
  lastSavedText: string;
}

export const DayReportView: React.FC<DayReportViewProps> = ({
  data,
  dayNum,
  onUpdateDay,
  onPrevDay,
  onNextDay,
  onPrintDay,
  onClearDay,
  onSave,
  lastSavedText,
}) => {
  const currentDay = data.days[dayNum] || {
    headcount: {},
    meals: {
      breakfast: { planned: '', served: '' },
      lunch: { planned: '', served: '' },
      dinner: { planned: '', served: '' },
    },
    workerStatus: {},
    attendance: [],
    facilitiesStatus: '',
    worksDone: '',
    worksUrgent: '',
    notesEconomist: '',
    notesDirector: '',
    signedAt: '',
  };

  // Helper to get weekday name (shared util: handles school-year + current month correctly)
  const weekday = resolveWeekday(dayNum, data.meta);
  // Unified calendar values: resolved year + canonical month + real days count
  const reportYear = resolveReportYear(data.meta);
  const displayMonth = getCanonicalMonthName(data.meta.monthNum) || data.meta.monthName;
  const daysInMonth = getDaysInMonth(data.meta);

  // Compute headcount totals
  const totals = {
    b_reg: 0,
    b_pres: 0,
    l_reg: 0,
    l_pres: 0,
    d_reg: 0,
    d_pres: 0,
  };

  CATEGORIES.forEach((cat) => {
    const c: any = currentDay.headcount?.[cat.key] || {};
    totals.b_reg += Number(c.b_reg) || 0;
    totals.b_pres += Number(c.b_pres) || 0;
    totals.l_reg += Number(c.l_reg) || 0;
    totals.l_pres += Number(c.l_pres) || 0;
    totals.d_reg += Number(c.d_reg) || 0;
    totals.d_pres += Number(c.d_pres) || 0;
  });

  // Attendance rate per meal (null when nothing registered)
  const attendancePct = (pres: number, reg: number): number | null =>
    reg > 0 ? Math.round((pres / reg) * 100) : null;

  const pctClass = (p: number | null) =>
    p === null
      ? 'text-slate-400 dark:text-slate-500'
      : p >= 80
        ? 'text-emerald-700 dark:text-emerald-400'
        : p >= 50
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-rose-600 dark:text-rose-400';

  const pctLabel = (p: number | null) => (p === null ? '—' : `${p}٪`);

  // Handlers for headcount
  const handleHeadcountChange = (catKey: string, field: string, value: string) => {
    onUpdateDay(dayNum, (prev) => {
      const hc = { ...(prev.headcount || {}) };
      hc[catKey] = {
        b_reg: 0,
        b_pres: 0,
        l_reg: 0,
        l_pres: 0,
        d_reg: 0,
        d_pres: 0,
        ...(hc[catKey] || {}),
        [field]: value,
      };
      return { ...prev, headcount: hc };
    });
  };

  // Handlers for meals
  const handleMealChange = (meal: 'breakfast' | 'lunch' | 'dinner', field: 'planned' | 'served', value: string) => {
    onUpdateDay(dayNum, (prev) => {
      const defaultMeals = {
        breakfast: { planned: '', served: '' },
        lunch: { planned: '', served: '' },
        dinner: { planned: '', served: '' },
      };
      const meals = { ...defaultMeals, ...(prev.meals || {}) };
      meals[meal] = { ...(meals[meal] || { planned: '', served: '' }), [field]: value };
      return { ...prev, meals };
    });
  };

  // Handlers for workers
  const PRESENT_STATUSES = ['حاضر', 'يوم كامل'];

  const handleWorkerStatus = (workerId: string, status: string) => {
    onUpdateDay(dayNum, (prev) => {
      const ws = { ...(prev.workerStatus || {}) };
      ws[workerId] = status;

      // Sync attendance table: auto rows are rebuilt on every status change
      const worker = data.workers.find((w) => w.id === workerId);
      const att = (prev.attendance || []).filter(
        (r) => !(r.auto && r.workerId === workerId)
      );
      if (worker && !PRESENT_STATUSES.includes(status)) {
        att.push({
          name: worker.name,
          duration: 'يوم كامل',
          reason: status,
          notes: '',
          auto: true,
          workerId,
        });
      }
      return { ...prev, workerStatus: ws, attendance: att };
    });
  };

  const handleMarkAllWorkersPresent = () => {
    onUpdateDay(dayNum, (prev) => {
      const ws = { ...(prev.workerStatus || {}) };
      data.workers.forEach((w) => {
        ws[w.id] = 'حاضر';
      });
      const att = (prev.attendance || []).filter((r) => !r.auto);
      return { ...prev, workerStatus: ws, attendance: att };
    });
  };

  // Handlers for attendance
  const handleAddAttendanceRow = () => {
    onUpdateDay(dayNum, (prev) => {
      const att = [...(prev.attendance || [])];
      att.push({ name: '', duration: 'يوم كامل', reason: '', notes: '' });
      return { ...prev, attendance: att };
    });
  };

  // ===== Economist notes: preset dropdown + free text, several fields =====
  // notesEconomist stays in sync so printing and older saved data keep working.
  const defaultEconNotes = () => [
    { preset: '', text: '' },
    { preset: '', text: '' },
    { preset: '', text: '' },
  ];

  const getEconNotes = (day: DayReportData) => {
    if (day.economistNotes && day.economistNotes.length > 0) return day.economistNotes;
    // Migrate legacy single-field notes into the first field
    const legacy = (day.notesEconomist || '').trim();
    if (!legacy) return defaultEconNotes();
    return [
      { preset: '', text: legacy },
      { preset: '', text: '' },
      { preset: '', text: '' },
    ];
  };

  const withSyncedEconNotes = (day: DayReportData): DayReportData => ({
    ...day,
    notesEconomist: (day.economistNotes || [])
      .map((n) => (n?.text || '').trim())
      .filter(Boolean)
      .join(' — '),
  });

  const handleEconNotePreset = (idx: number, preset: string) => {
    onUpdateDay(dayNum, (prev) => {
      const notes = [...getEconNotes(prev)].map((n) => ({ ...n }));
      if (idx >= notes.length) notes.push({ preset: '', text: '' });
      notes[idx] = { preset, text: preset || notes[idx]?.text || '' };
      return withSyncedEconNotes({ ...prev, economistNotes: notes });
    });
  };

  const handleEconNoteText = (idx: number, text: string) => {
    onUpdateDay(dayNum, (prev) => {
      const notes = [...getEconNotes(prev)].map((n) => ({ ...n }));
      if (idx >= notes.length) notes.push({ preset: '', text: '' });
      notes[idx] = { preset: notes[idx]?.preset || '', text };
      return withSyncedEconNotes({ ...prev, economistNotes: notes });
    });
  };

  const handleAddEconNote = () => {
    onUpdateDay(dayNum, (prev) => ({
      ...prev,
      economistNotes: [...getEconNotes(prev), { preset: '', text: '' }],
    }));
  };

  const handleRemoveEconNote = (idx: number) => {
    onUpdateDay(dayNum, (prev) => {
      const notes = [...getEconNotes(prev)];
      notes.splice(idx, 1);
      return withSyncedEconNotes({ ...prev, economistNotes: notes });
    });
  };

  // Copy headcount + meals from the previous day
  const handleCopyPrevDay = () => {
    const prevDay = data.days[dayNum - 1];
    if (!prevDay) return;

    const hasCurrentData =
      Object.values(currentDay.headcount || {}).some((cat: any) =>
        Object.values(cat || {}).some((v) => Number(v) > 0)
      ) ||
      Object.values(currentDay.meals || {}).some(
        (m: any) => Boolean(m?.planned) || Boolean(m?.served)
      );

    if (hasCurrentData && !window.confirm('سيتم استبدال التعداد وقائمة الوجبات المدخلة اليوم ببيانات اليوم السابق. هل ترغب في المتابعة؟')) {
      return;
    }

    onUpdateDay(dayNum, (prev) => ({
      ...prev,
      headcount: JSON.parse(JSON.stringify(prevDay.headcount || {})),
      meals: JSON.parse(JSON.stringify(prevDay.meals || {})),
    }));
  };

  const canCopyPrevDay = dayNum > 1 && Boolean(data.days[dayNum - 1]);

  // Meals library: insert a saved meal into the day's menu
  const libraryFor = (cat: string) =>
    (data.mealLibrary || []).filter((m) => m.category === cat || m.category === 'general');

  const handleInsertMeal = (meal: 'breakfast' | 'lunch' | 'dinner', id: string) => {
    const tpl = (data.mealLibrary || []).find((m) => m.id === id);
    if (!tpl) return;
    onUpdateDay(dayNum, (prev) => {
      const defaultMeals = {
        breakfast: { planned: '', served: '' },
        lunch: { planned: '', served: '' },
        dinner: { planned: '', served: '' },
      };
      const meals = { ...defaultMeals, ...(prev.meals || {}) };
      const cur = meals[meal] || { planned: '', served: '' };
      const planned = cur.planned ? `${cur.planned}\n${tpl.description}` : tpl.description;
      meals[meal] = { ...cur, planned };
      return { ...prev, meals };
    });
  };

  const mealPicker = (cat: 'breakfast' | 'lunch' | 'dinner') => {
    const opts = libraryFor(cat);
    if (opts.length === 0) return null;
    return (
      <select
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) {
            handleInsertMeal(cat, e.target.value);
            e.target.value = '';
          }
        }}
        title="إدراج وجبة محفوظة من المكتبة"
        className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 cursor-pointer focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none max-w-[150px]"
      >
        <option value="">إدراج من المكتبة…</option>
        {opts.map((o) => (
          <option key={o.id} value={o.id} className="dark:bg-slate-800">
            {o.name}
          </option>
        ))}
      </select>
    );
  };

  const handleUpdateAttendanceRow = (idx: number, field: string, value: string) => {
    onUpdateDay(dayNum, (prev) => {
      const att = [...(prev.attendance || [])];
      att[idx] = { ...att[idx], [field]: value };
      return { ...prev, attendance: att };
    });
  };

  const handleDeleteAttendanceRow = (idx: number) => {
    onUpdateDay(dayNum, (prev) => {
      const att = [...(prev.attendance || [])];
      att.splice(idx, 1);
      return { ...prev, attendance: att };
    });
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top action header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 font-black text-xs">
              يومية
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              التقرير اليومي — اليوم {dayNum}
            </h2>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            {weekday && <span className="font-bold text-emerald-800 dark:text-emerald-400">يوم {weekday}</span>}
            <span>•</span>
            <span>{dayNum} {displayMonth} {reportYear}</span>
            <span>•</span>
            <span className="text-slate-400 dark:text-slate-500">{data.meta.institution}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={onPrevDay}
              disabled={dayNum <= 1}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
            </button>
            <button
              onClick={onNextDay}
              disabled={dayNum >= daysInMonth}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>التالي</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onPrintDay(false)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>معاينة وطباعة</span>
          </button>

          <button
            onClick={handleCopyPrevDay}
            disabled={!canCopyPrevDay}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="نسخ التعداد وقائمة الوجبات من اليوم السابق"
          >
            <CopyPlus className="w-4 h-4" />
            <span>نسخ بيانات الأمس</span>
          </button>

          <button
            onClick={() => onPrintDay(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <span>نسخة فارغة</span>
          </button>

          <button
            onClick={onClearDay}
            className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
            title="تفريغ بيانات هذا اليوم بالكامل"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تفريغ</span>
          </button>
        </div>
      </div>

      {/* 1. التعداد (Headcount) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              التعداد اليومي للوجبات
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            المسجلون والحاضرون في الفطور، الغداء، والعشاء
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 text-center">
                <th rowSpan={2} className="py-2.5 px-3 border-l border-slate-200 dark:border-slate-700 min-w-[120px] text-right">الفئة</th>
                <th colSpan={2} className="py-1.5 px-2 border-l border-slate-200 dark:border-slate-700 bg-amber-50/60 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300">فطور الصباح</th>
                <th colSpan={2} className="py-1.5 px-2 border-l border-slate-200 dark:border-slate-700 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300">وجبة الغداء</th>
                <th colSpan={2} className="py-1.5 px-2 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-300">وجبة العشاء</th>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 text-center">
                <th className="py-1.5 px-2 border-l border-slate-200 dark:border-slate-700 w-20">المسجلون</th>
                <th className="py-1.5 px-2 border-l border-slate-200 dark:border-slate-700 w-20">الحاضرون</th>
                <th className="py-1.5 px-2 border-l border-slate-200 dark:border-slate-700 w-20">المسجلون</th>
                <th className="py-1.5 px-2 border-l border-slate-200 dark:border-slate-700 w-20">الحاضرون</th>
                <th className="py-1.5 px-2 border-l border-slate-200 dark:border-slate-700 w-20">المسجلون</th>
                <th className="py-1.5 px-2 w-20">الحاضرون</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {CATEGORIES.map((cat) => {
                const c: any = currentDay.headcount?.[cat.key] || {};
                return (
                  <tr key={cat.key} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                    <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200 border-l border-slate-200 dark:border-slate-700 text-right">
                      {cat.label}
                    </td>
                    <td className="p-1 border-l border-slate-200 dark:border-slate-700">
                      <input
                        type="number"
                        min="0"
                        value={c.b_reg || ''}
                        onChange={(e) => handleHeadcountChange(cat.key, 'b_reg', e.target.value)}
                        className="w-full text-center py-1.5 px-1 bg-transparent hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 rounded border border-transparent focus:border-emerald-500 text-xs font-semibold focus:outline-none dark:text-white"
                      />
                    </td>
                    <td className="p-1 border-l border-slate-200 dark:border-slate-700">
                      <input
                        type="number"
                        min="0"
                        value={c.b_pres || ''}
                        onChange={(e) => handleHeadcountChange(cat.key, 'b_pres', e.target.value)}
                        className="w-full text-center py-1.5 px-1 bg-transparent hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 rounded border border-transparent focus:border-emerald-500 text-xs font-semibold focus:outline-none text-emerald-800 dark:text-emerald-400 font-bold"
                      />
                    </td>
                    <td className="p-1 border-l border-slate-200 dark:border-slate-700">
                      <input
                        type="number"
                        min="0"
                        value={c.l_reg || ''}
                        onChange={(e) => handleHeadcountChange(cat.key, 'l_reg', e.target.value)}
                        className="w-full text-center py-1.5 px-1 bg-transparent hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 rounded border border-transparent focus:border-emerald-500 text-xs font-semibold focus:outline-none dark:text-white"
                      />
                    </td>
                    <td className="p-1 border-l border-slate-200 dark:border-slate-700">
                      <input
                        type="number"
                        min="0"
                        value={c.l_pres || ''}
                        onChange={(e) => handleHeadcountChange(cat.key, 'l_pres', e.target.value)}
                        className="w-full text-center py-1.5 px-1 bg-transparent hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 rounded border border-transparent focus:border-emerald-500 text-xs font-semibold focus:outline-none text-emerald-800 dark:text-emerald-400 font-bold"
                      />
                    </td>
                    <td className="p-1 border-l border-slate-200 dark:border-slate-700">
                      <input
                        type="number"
                        min="0"
                        value={c.d_reg || ''}
                        onChange={(e) => handleHeadcountChange(cat.key, 'd_reg', e.target.value)}
                        className="w-full text-center py-1.5 px-1 bg-transparent hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 rounded border border-transparent focus:border-emerald-500 text-xs font-semibold focus:outline-none dark:text-white"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        min="0"
                        value={c.d_pres || ''}
                        onChange={(e) => handleHeadcountChange(cat.key, 'd_pres', e.target.value)}
                        className="w-full text-center py-1.5 px-1 bg-transparent hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 rounded border border-transparent focus:border-emerald-500 text-xs font-semibold focus:outline-none text-emerald-800 dark:text-emerald-400 font-bold"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 dark:bg-slate-800/60 font-bold text-xs text-center border-t border-slate-200 dark:border-slate-700">
                <td className="py-1.5 px-3 border-l border-slate-200 dark:border-slate-700 text-right text-slate-600 dark:text-slate-300">نسبة الحضور</td>
                <td colSpan={2} className={`py-1.5 px-1 border-l border-slate-200 dark:border-slate-700 ${pctClass(attendancePct(totals.b_pres, totals.b_reg))}`}>
                  {pctLabel(attendancePct(totals.b_pres, totals.b_reg))}
                </td>
                <td colSpan={2} className={`py-1.5 px-1 border-l border-slate-200 dark:border-slate-700 ${pctClass(attendancePct(totals.l_pres, totals.l_reg))}`}>
                  {pctLabel(attendancePct(totals.l_pres, totals.l_reg))}
                </td>
                <td colSpan={2} className={`py-1.5 px-1 ${pctClass(attendancePct(totals.d_pres, totals.d_reg))}`}>
                  {pctLabel(attendancePct(totals.d_pres, totals.d_reg))}
                </td>
              </tr>
              <tr className="bg-slate-100 dark:bg-slate-800 font-black text-slate-900 dark:text-white text-center border-t-2 border-slate-300 dark:border-slate-700">
                <td className="py-2.5 px-3 border-l border-slate-300 dark:border-slate-700 text-right">المجموع الكلي</td>
                <td className="py-2 px-1 border-l border-slate-300 dark:border-slate-700">{totals.b_reg}</td>
                <td className="py-2 px-1 border-l border-slate-300 dark:border-slate-700 text-emerald-700 dark:text-emerald-400">{totals.b_pres}</td>
                <td className="py-2 px-1 border-l border-slate-300 dark:border-slate-700">{totals.l_reg}</td>
                <td className="py-2 px-1 border-l border-slate-300 dark:border-slate-700 text-emerald-700 dark:text-emerald-400">{totals.l_pres}</td>
                <td className="py-2 px-1 border-l border-slate-300 dark:border-slate-700">{totals.d_reg}</td>
                <td className="py-2 px-1 text-emerald-700 dark:text-emerald-400">{totals.d_pres}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 2. الوجبات (Meals: Planned vs Served) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 transition-colors">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <Utensils className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            قائمة الوجبات الغذائية اليومية
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Breakfast */}
          <div className="space-y-3 bg-amber-50/40 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200/60 dark:border-amber-800/40">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                ☕ فطور الصباح
              </span>
              {mealPicker('breakfast')}
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">الوجبة المقررة</label>
              <textarea
                value={currentDay.meals?.breakfast?.planned || ''}
                onChange={(e) => handleMealChange('breakfast', 'planned', e.target.value)}
                rows={2}
                placeholder="حليب، قهوة، خبز، مربى..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">الوجبة المقدمة فعليًا</label>
              <textarea
                value={currentDay.meals?.breakfast?.served || ''}
                onChange={(e) => handleMealChange('breakfast', 'served', e.target.value)}
                rows={2}
                placeholder="الوجبة المقدمة للتلاميذ..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Lunch */}
          <div className="space-y-3 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                🥗 وجبة الغداء
              </span>
              {mealPicker('lunch')}
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">الوجبة المقررة</label>
              <textarea
                value={currentDay.meals?.lunch?.planned || ''}
                onChange={(e) => handleMealChange('lunch', 'planned', e.target.value)}
                rows={2}
                placeholder="سلطة، طبق رئيسي، فاكهة..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">الوجبة المقدمة فعليًا</label>
              <textarea
                value={currentDay.meals?.lunch?.served || ''}
                onChange={(e) => handleMealChange('lunch', 'served', e.target.value)}
                rows={2}
                placeholder="الوجبة المقدمة للتلاميذ..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Dinner */}
          <div className="space-y-3 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-200/60 dark:border-indigo-800/40">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                🍲 وجبة العشاء (الداخلي)
              </span>
              {mealPicker('dinner')}
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">الوجبة المقررة</label>
              <textarea
                value={currentDay.meals?.dinner?.planned || ''}
                onChange={(e) => handleMealChange('dinner', 'planned', e.target.value)}
                rows={2}
                placeholder="حساء، طبق خفيف، ياغورت..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">الوجبة المقدمة فعليًا</label>
              <textarea
                value={currentDay.meals?.dinner?.served || ''}
                onChange={(e) => handleMealChange('dinner', 'served', e.target.value)}
                rows={2}
                placeholder="الوجبة المقدمة للتلاميذ..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. وضعية العمال وحضورهم اليومي */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              قائمة العمال وحالة حضورهم اليومي
            </h3>
          </div>
          <button
            onClick={handleMarkAllWorkersPresent}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>تعيين الكل: حاضر</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 text-center">
                <th className="py-2.5 px-3 border-l border-slate-200 dark:border-slate-700 w-12">ر.ت</th>
                <th className="py-2.5 px-3 border-l border-slate-200 dark:border-slate-700 text-right">الاسم واللقب</th>
                <th className="py-2.5 px-3 border-l border-slate-200 dark:border-slate-700 text-right">الوظيفة / الرتبة</th>
                <th className="py-2.5 px-3 min-w-[200px]">الحالة اليومية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.workers.map((w, idx) => {
                const status = currentDay.workerStatus?.[w.id] || 'حاضر';
                const isAbsent = status !== 'حاضر' && status !== 'يوم كامل';
                return (
                  <tr key={w.id} className={isAbsent ? 'bg-amber-50/40 dark:bg-amber-950/20' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/50'}>
                    <td className="py-2 px-3 text-center text-slate-500 dark:text-slate-400 font-semibold border-l border-slate-200 dark:border-slate-700">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-900 dark:text-white border-l border-slate-200 dark:border-slate-700">
                      {w.name || 'عامل بدون اسم'}
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-300 border-l border-slate-200 dark:border-slate-700">
                      {w.job}
                    </td>
                    <td className="p-1.5">
                      <select
                        value={status}
                        onChange={(e) => handleWorkerStatus(w.id, e.target.value)}
                        className={`w-full text-xs font-bold py-1.5 px-2.5 rounded-lg border focus:ring-2 focus:ring-emerald-500/20 focus:outline-none cursor-pointer ${
                          status === 'حاضر' || status === 'يوم كامل'
                            ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                            : 'bg-amber-100/80 dark:bg-amber-950/80 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                        }`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt} className="dark:bg-slate-800">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. المواظبة والتغيبات */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 transition-colors">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              المواظبة: التغيبات والتأخرات التفصيلية
            </h3>
          </div>
          <button
            onClick={handleAddAttendanceRow}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة حالة</span>
          </button>
        </div>

        {currentDay.attendance && currentDay.attendance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 text-center">
                  <th className="py-2 px-2 border-l border-slate-200 dark:border-slate-700 w-10">ر.ت</th>
                  <th className="py-2 px-3 border-l border-slate-200 dark:border-slate-700 text-right min-w-[150px]">اللقب والاسم</th>
                  <th className="py-2 px-3 border-l border-slate-200 dark:border-slate-700 w-28 text-center">المدة</th>
                  <th className="py-2 px-3 border-l border-slate-200 dark:border-slate-700 text-right min-w-[150px]">المبرر</th>
                  <th className="py-2 px-3 border-l border-slate-200 dark:border-slate-700 text-right">الملاحظات</th>
                  <th className="py-2 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {currentDay.attendance.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <td className="py-2 px-2 text-center text-slate-500 dark:text-slate-400 font-semibold border-l border-slate-200 dark:border-slate-700">
                      {idx + 1}
                    </td>
                    <td className="p-1 border-l border-slate-200 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => handleUpdateAttendanceRow(idx, 'name', e.target.value)}
                        placeholder="اسم ولقب المعني"
                        className="w-full text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-600 focus:outline-none"
                      />
                    </td>
                    <td className="p-1 border-l border-slate-200 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.duration}
                        onChange={(e) => handleUpdateAttendanceRow(idx, 'duration', e.target.value)}
                        placeholder="يوم كامل / ساعة"
                        className="w-full text-xs text-center p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-600 focus:outline-none"
                      />
                    </td>
                    <td className="p-1 border-l border-slate-200 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.reason}
                        onChange={(e) => handleUpdateAttendanceRow(idx, 'reason', e.target.value)}
                        placeholder="عطلة مرضية / شخصي..."
                        className="w-full text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-600 focus:outline-none"
                      />
                    </td>
                    <td className="p-1 border-l border-slate-200 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.notes}
                        onChange={(e) => handleUpdateAttendanceRow(idx, 'notes', e.target.value)}
                        placeholder="ملاحظات إضافية"
                        className="w-full text-xs p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-600 focus:outline-none"
                      />
                    </td>
                    <td className="p-1 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {row.auto && (
                          <span
                            className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded px-1 py-0.5"
                            title="أُضيف هذا السطر تلقائيًا من حالة العامل في جدول الحضور"
                          >
                            تلقائي
                          </span>
                        )}
                        <button
                          onClick={() => handleDeleteAttendanceRow(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                          title="حذف هذا السطر"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-400 dark:text-slate-500">
            لم تُسجل أي حالات غياب أو تأخر إضافية اليوم. اضغط "إضافة حالة" إذا دعت الحاجة.
          </div>
        )}
      </div>

      {/* 5. وضعية المحلات والمرافق والأشغال */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Facilities */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-2 transition-colors">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Building className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              وضعية المحلات والمرافق
            </h3>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            حالة قاعات الدراسة، المطعم، المراقد، الورشات، الإنارة، التدفئة...
          </p>
          <textarea
            value={currentDay.facilitiesStatus || ''}
            onChange={(e) =>
              onUpdateDay(dayNum, (prev) => ({ ...prev, facilitiesStatus: e.target.value }))
            }
            rows={3}
            placeholder="المحلات في حالة جيدة، نظافة تامة بالمطعم وقاعات الدراسة..."
            className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
          />
        </div>

        {/* Works */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-3 transition-colors">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Wrench className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">الأشغال والصيانة</h3>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              الأشغال المنجزة اليوم
            </label>
            <textarea
              value={currentDay.worksDone || ''}
              onChange={(e) =>
                onUpdateDay(dayNum, (prev) => ({ ...prev, worksDone: e.target.value }))
              }
              rows={2}
              placeholder="صيانة حنفيات دورات المياه، إصلاح أقفال..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 block mb-1">
              الأشغال المستعجلة والطارئة
            </label>
            <textarea
              value={currentDay.worksUrgent || ''}
              onChange={(e) =>
                onUpdateDay(dayNum, (prev) => ({ ...prev, worksUrgent: e.target.value }))
              }
              rows={2}
              placeholder="تسرب مياه، عطل كهربائي مستعجل..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 6. ملاحظات المقتصد والمدير وتأريخ التقرير */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4 transition-colors">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <MessageSquare className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            الملاحظات الإدارية وتأشيرة الإمضاء
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Economist notes: framed box with several preset-dropdown + free-text fields */}
          <div className="border-2 border-emerald-300 dark:border-emerald-800 rounded-xl p-3.5 bg-emerald-50/30 dark:bg-emerald-950/20">
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-emerald-200 dark:border-emerald-900">
              <label className="text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>ملاحظات المقتصد (مسؤول المصالح الاقتصادية)</span>
              </label>
              <button
                onClick={handleAddEconNote}
                className="flex items-center gap-0.5 px-2 py-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 rounded-md transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>حقل إضافي</span>
              </button>
            </div>
            <div className="space-y-2">
              {getEconNotes(currentDay).map((note, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <select
                    value={note.preset || ''}
                    onChange={(e) => handleEconNotePreset(idx, e.target.value)}
                    className="w-40 shrink-0 text-[11px] font-semibold py-1.5 px-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 text-emerald-900 dark:text-emerald-200 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none cursor-pointer"
                  >
                    <option value="">— اختر ملاحظة —</option>
                    {ECONOMIST_NOTE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="dark:bg-slate-800">{opt}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={note.text || ''}
                    onChange={(e) => handleEconNoteText(idx, e.target.value)}
                    placeholder="أو اكتب ملاحظة حرة..."
                    className="flex-1 min-w-0 text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-600 focus:outline-none"
                  />
                  {getEconNotes(currentDay).length > 3 && (
                    <button
                      onClick={() => handleRemoveEconNote(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer shrink-0"
                      title="حذف هذا الحقل"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Director notes: framed box */}
          <div className="border-2 border-indigo-200 dark:border-indigo-800/70 rounded-xl p-3.5 bg-indigo-50/30 dark:bg-indigo-950/20">
            <label className="text-xs font-black text-indigo-900 dark:text-indigo-300 block mb-2.5 pb-2 border-b border-indigo-200 dark:border-indigo-900">
              ملاحظات وتأشيرة السيد مدير المؤسسة
            </label>
            <textarea
              value={currentDay.notesDirector || ''}
              onChange={(e) =>
                onUpdateDay(dayNum, (prev) => ({ ...prev, notesDirector: e.target.value }))
              }
              rows={4}
              placeholder="اطلعت على التقرير اليومي، موافق على الإجراءات..."
              className="w-full text-xs p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1 flex items-center gap-1">
              <PenTool className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>حرر بـ... في التاريخ:</span>
            </label>
            <input
              type="text"
              value={currentDay.signedAt || ''}
              onChange={(e) =>
                onUpdateDay(dayNum, (prev) => ({ ...prev, signedAt: e.target.value }))
              }
              placeholder={`مثال: بـ ${data.meta.municipality || 'تالخمت'} في ${dayNum} ${displayMonth} ${reportYear}`}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-8 text-xs font-bold text-slate-700 dark:text-slate-300 px-4">
            <div className="text-center">
              <div>المقتصد</div>
              <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">{data.meta.economistName || '—'}</div>
            </div>
            <div className="text-center">
              <div>المدير</div>
              <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">{data.meta.directorName || '—'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Autosave Status */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-full shadow-lg shadow-slate-900/10 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 no-print">
        <span className="save-dot">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
          حفظ تلقائي نشط
        </span>
        {lastSavedText && (
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
            {lastSavedText}
          </span>
        )}
        <button
          onClick={onSave}
          title="حفظ يدوي وتأكيد"
          className="p-1.5 rounded-full text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
