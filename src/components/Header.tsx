import React from 'react';
import { NavView, InstitutionMeta } from '../types';
import { 
  Menu, 
  Calendar, 
  Download, 
  Upload, 
  Printer, 
  Sparkles,
  Moon,
  Sun
} from 'lucide-react';

interface HeaderProps {
  meta: InstitutionMeta;
  currentView: NavView;
  currentDay: number;
  onSelectDay: (day: number) => void;
  onToggleSidebar: () => void;
  onExport: () => void;
  onImportClick: () => void;
  onQuickPrint: () => void;
  onOpenSplash: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  lastSavedText?: string;
}

export const Header: React.FC<HeaderProps> = ({
  meta,
  currentView,
  currentDay,
  onSelectDay,
  onToggleSidebar,
  onExport,
  onImportClick,
  onQuickPrint,
  onOpenSplash,
  darkMode,
  onToggleDarkMode,
  lastSavedText,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs px-4 sm:px-6 py-3 no-print transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Institution identifier */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="القائمة الجانبية"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white flex items-center justify-center font-black text-sm shadow-md shadow-emerald-600/25 ring-1 ring-emerald-500/40 shrink-0">
              م
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {meta.institution || 'التقرير اليومي للمصالح الاقتصادية'}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
                <span>{meta.wilaya ? `ولاية ${meta.wilaya}` : 'مصلحة التسيير المادي'}</span>
                <span>•</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{meta.monthName} {meta.year}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right: Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Autosave status */}
          <div
            title={lastSavedText || 'الحفظ التلقائي نشط — تُحفظ كل التعديلات فورًا'}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/60"
          >
            <span className="save-dot">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
              {lastSavedText || 'حفظ تلقائي'}
            </span>
          </div>
          {/* Quick Day Switcher */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 p-1 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 mr-1.5" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">اليوم:</span>
            <select
              value={currentDay}
              onChange={(e) => onSelectDay(Number(e.target.value))}
              className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-transparent border-0 rounded-lg px-2 py-1 cursor-pointer focus:ring-0 focus:outline-none"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d} className="dark:bg-slate-850">
                  اليوم {d} ({meta.monthName})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'التحويل إلى الوضع النهاري' : 'التحويل إلى الوضع الليلي'}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="تبديل الوضع الليلي"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Quick Print Button */}
          <button
            onClick={onQuickPrint}
            title="طباعة / معاينة"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/80 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">طباعة</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={onExport}
            title="تصدير نسخة احتياطية"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Import JSON */}
          <button
            onClick={onImportClick}
            title="استيراد نسخة احتياطية"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Splash Reopen */}
          <button
            onClick={onOpenSplash}
            title="شاشة الترحيب الرسمية"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden lg:inline">الواجهة</span>
          </button>
        </div>
      </div>
    </header>
  );
};
