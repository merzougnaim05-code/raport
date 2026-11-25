import React, { useState } from 'react';
import { InstitutionMeta, MealTemplate, WeeklyMenu } from '../types';
import { WeeklyMenuSheet } from './WeeklyMenuSheet';
import { getWeekDays, weeklyMenuKey, getCurrentWeekNum, resolveReportYear, formatWeekDay } from '../utils/dateUtils';
import { Printer, Utensils, Eraser, CalendarDays } from 'lucide-react';

interface WeeklyMenuViewProps {
  meta: InstitutionMeta;
  library: MealTemplate[];
  weeklyMenus: Record<string, WeeklyMenu>;
  onUpdateMenu: (key: string, patch: Partial<WeeklyMenu>) => void;
  onPrint: (weekNum: number) => void;
}

const WEEK_LABELS = ['الأول', 'الثاني', 'الثالث', 'الرابع'];

const todayISO = (): string => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

const emptyMenu = (): WeeklyMenu => ({
  mealIds: [],
  notes: ['', '', '', '', ''],
  issuedDate: todayISO(),
});

export const WeeklyMenuView: React.FC<WeeklyMenuViewProps> = ({
  meta,
  library,
  weeklyMenus,
  onUpdateMenu,
  onPrint,
}) => {
  const [weekNum, setWeekNum] = useState<number>(() => getCurrentWeekNum(meta));

  const days = getWeekDays(meta, weekNum);
  const key = weeklyMenuKey(meta, weekNum);
  const menu = weeklyMenus[key] || emptyMenu();
  const mealIds = menu.mealIds || [];
  const notes = menu.notes && menu.notes.length === 5 ? menu.notes : ['', '', '', '', ''];
  const issuedDate = menu.issuedDate || todayISO();

  // وجبات الغداء من المكتبة (الغداء + العام) — هي وجبات الجدول الأسبوعي
  const lunchMeals = (library || []).filter(
    (m) => m.category === 'lunch' || m.category === 'general'
  );
  const meals = days.map((_, i) => {
    const id = mealIds[i];
    return id ? (library || []).find((m) => m.id === id) || null : null;
  });

  const toggleMeal = (id: string) => {
    const at = mealIds.indexOf(id);
    let next: string[];
    if (at >= 0) {
      next = mealIds.filter((x) => x !== id);
    } else {
      if (mealIds.length >= 5) return;
      next = [...mealIds, id];
    }
    onUpdateMenu(key, { mealIds: next });
  };

  const setNote = (i: number, v: string) => {
    const next = [...notes];
    next[i] = v;
    onUpdateMenu(key, { notes: next });
  };

  const clearWeek = () => {
    onUpdateMenu(key, { mealIds: [], notes: ['', '', '', '', ''] });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="card-soft p-5">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs">
          <CalendarDays className="w-4 h-4" />
          <span>جدول الوجبات الغذائية الأسبوعي</span>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
          وجبات الغداء — شهر {meta.monthName} {resolveReportYear(meta)}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          الأيام تُختار آلياً من الشهر: الأحد–الخميس. اختر الأسبوع، ثم اضغط على مربعات وجبات الغداء من المكتبة بالترتيب الذي تريده — الأولى للأحد، والثانية للإثنين، وهكذا.
        </p>

        {/* اختيار الأسبوع */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">الأسبوع:</span>
          {WEEK_LABELS.map((label, i) => (
            <button
              key={i}
              onClick={() => setWeekNum(i + 1)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                weekNum === i + 1
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/50'
              }`}
            >
              {label}
            </button>
          ))}
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mr-2">
            {days.length === 5 && (
              <>من {formatWeekDay(days[0])} إلى {formatWeekDay(days[4])}</>
            )}
          </span>
        </div>
      </div>

      {/* اختيار الوجبات من المكتبة بمربعات الضغط */}
      <div className="card-soft p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            وجبات الغداء من المكتبة ({lunchMeals.length})
          </h3>
          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
            {mealIds.length} / 5 مختارة
          </span>
        </div>

        {lunchMeals.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
            لا توجد وجبات غداء في المكتبة بعد — أضفها من تبويب «مكتبة الوجبات» (صنف الغداء أو العام)، ثم عد هنا لاختيارها.
          </p>
        ) : (
          <>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              اضغط على المربع بجانب كل وجبة بالترتيب الذي تريده؛ الرقم الظاهر هو ترتيبها في الجدول (1 = الأحد).
            </p>
            <div className="space-y-1.5">
              {lunchMeals.map((m) => {
                const pos = mealIds.indexOf(m.id);
                const checked = pos >= 0;
                const disabled = !checked && mealIds.length >= 5;
                return (
                  <label
                    key={m.id}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                      checked
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleMeal(m.id)}
                      className="w-5 h-5 shrink-0 accent-emerald-600 cursor-pointer"
                    />
                    <span className="flex-1 min-w-0">
                      <span className="block text-xs font-black text-slate-900 dark:text-white truncate">
                        {m.name}
                      </span>
                      {m.description && m.description !== m.name && (
                        <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {m.description}
                        </span>
                      )}
                    </span>
                    {checked && (
                      <span className="shrink-0 flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center justify-center">
                          {pos + 1}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          {days[pos]?.weekday}
                        </span>
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* الجدول — نفس الورقة التي ستُطبع، قابلة للتعديل */}
      <WeeklyMenuSheet
        meta={meta}
        days={days}
        meals={meals}
        notes={notes}
        issuedDate={issuedDate}
        editable
        onNoteChange={setNote}
        onIssuedDateChange={(v) => onUpdateMenu(key, { issuedDate: v })}
      />

      {/* أزرار الإجراءات */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => onPrint(weekNum)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          معاينة وطباعة الجدول
        </button>
        <button
          onClick={clearWeek}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Eraser className="w-4 h-4" />
          مسح اختيارات هذا الأسبوع
        </button>
      </div>
    </div>
  );
};
