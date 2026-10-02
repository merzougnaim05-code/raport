import React from 'react';
import { NavView, InstitutionMeta } from '../types';
import {
  Menu,
  Calendar,
  Download,
  Upload,
  Printer,
  Landmark,
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
    <header className="sticky top-0 z-30 bg-[#215a3e] dark:bg-[#123c28] border-b-[3px] border-[#fcbb00] shadow-md px-3 sm:px-5 py-2.5 no-print transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Right: emblem + institution identity */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="القائمة الجانبية"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="w-9 h-9 rounded-full bg-[#f7f4ed] border-2 border-[#fcbb00] flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-base leading-none">🇩🇿</span>
          </div>

          <div className="min-w-0">
            <h1 className="text-sm font-bold text-white truncate leading-tight">
              التقرير اليومي للمصالح الاقتصادية
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-emerald-100/85 truncate">
              <span className="truncate">{meta.institution}</span>
              <span>—</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#fcbb00] text-[#1c2e24] font-black tabular-nums">
                {meta.monthName}
              </span>
            </div>
          </div>
        </div>

        {/* Left: quick actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Autosave status */}
          <div
            title={lastSavedText || 'الحفظ التلقائي نشط — تُحفظ كل التعديلات فورًا'}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/10 border border-white/20"
          >
            <span className="save-dot">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fcbb00] opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#fcbb00]" />
            </span>
            <span className="text-[11px] font-bold text-emerald-50">
              {lastSavedText || 'حفظ تلقائي'}
            </span>
          </div>

          {/* Quick Day Switcher: dark inset field like the registry search */}
          <div className="hidden sm:flex items-center gap-1 bg-[#174a32] dark:bg-[#0e2f1f] border border-white/15 p-1 rounded-xl shadow-inner transition-colors">
            <Calendar className="w-3.5 h-3.5 text-[#fcbb00] mr-1" />
            <select
              value={currentDay}
              onChange={(e) => onSelectDay(Number(e.target.value))}
              className="text-xs font-bold text-emerald-50 bg-transparent border-0 rounded-lg px-2 py-1 cursor-pointer focus:ring-0 focus:outline-none"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d} className="text-[#1c2e24]">
                  اليوم {d} ({meta.monthName})
                </option>
              ))}
            </select>
          </div>

          {/* Portal (بوابة) button */}
          <button
            onClick={onOpenSplash}
            title="العودة إلى البوابة الرسمية"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-[#1c2e24] bg-[#fcbb00] hover:bg-[#f99c00] rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Landmark className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">البوابة</span>
          </button>

          {/* Quick Print Button */}
          <button
            onClick={onQuickPrint}
            title="طباعة / معاينة"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white border border-white/25 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">طباعة</span>
          </button>

          {/* Export / Import */}
          <button
            onClick={onExport}
            title="تصدير نسخة احتياطية"
            className="p-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onImportClick}
            title="استيراد نسخة احتياطية"
            className="hidden sm:block p-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'التحويل إلى الوضع النهاري' : 'التحويل إلى الوضع الليلي'}
            className="p-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="تبديل الوضع الليلي"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-[#fcbb00]" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
