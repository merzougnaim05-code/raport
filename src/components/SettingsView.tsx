import React from 'react';
import { InstitutionMeta } from '../types';
import { ARABIC_MONTHS } from '../data/initialData';
import { resolveReportYear, getDaysInMonth, getCanonicalMonthName } from '../utils/dateUtils';
import { 
  Settings, 
  Save, 
  Building2, 
  Calendar, 
  UserCheck, 
  CheckCircle2, 
  Moon, 
  Sun,
  Eye,
  FileCheck
} from 'lucide-react';

interface SettingsViewProps {
  meta: InstitutionMeta;
  onUpdateMeta: (updater: (prev: InstitutionMeta) => InstitutionMeta) => void;
  onSave: () => void;
  lastSavedText: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  meta,
  onUpdateMeta,
  onSave,
  lastSavedText,
  darkMode,
  onToggleDarkMode,
}) => {
  const handleChange = (field: keyof InstitutionMeta, value: any) => {
    onUpdateMeta((prev) => {
      const upd = { ...prev, [field]: value };
      if (field === 'monthNum') {
        const num = Number(value);
        if (num >= 1 && num <= 12) {
          upd.monthName = ARABIC_MONTHS[num - 1];
        }
      }
      return upd;
    });
  };

  const resolvedYear = resolveReportYear(meta);
  const daysInMonth = getDaysInMonth(meta);
  const canonicalMonth = getCanonicalMonthName(meta.monthNum) || meta.monthName;
  const monthMismatch = meta.monthName !== canonicalMonth;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs">
            <Settings className="w-4 h-4" />
            <span>الإعدادات والبيانات الرسمية</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            معلومات المؤسسة والترويسة والمظهر
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            تخصيص مظهر الشاشة ومعلومات المؤسسة التي تظهر في ترويسة جميع التقارير اليومية والوثائق الرسمية.
          </p>
        </div>

        <button
          onClick={onSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>حفظ التعديلات</span>
        </button>
      </div>

      {/* 0. مفتاح تبديل الوضع الليلي (Dark Mode) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4 transition-colors">
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${darkMode ? 'bg-indigo-950 text-indigo-400' : 'bg-amber-50 text-amber-600'} transition-colors`}>
              {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                سمة الألوان ومظهر الشاشة (Dark Mode)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تفعيل الألوان الداكنة المريحة للعين لتقليل إجهاد النظر أثناء العمل المكتبي المطول
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold hidden sm:inline ${darkMode ? 'text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
              {darkMode ? 'الوضع الليلي نشط' : 'الوضع النهاري نشط'}
            </span>

            <button
              type="button"
              role="switch"
              aria-checked={darkMode}
              onClick={onToggleDarkMode}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                darkMode ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
            >
              <span className="sr-only">تبديل الوضع الليلي</span>
              <span
                className={`pointer-events-none inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  darkMode ? '-translate-x-7 text-slate-900' : 'translate-x-0 text-amber-500'
                }`}
              >
                {darkMode ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              </span>
            </button>
          </div>
        </div>

        {/* Feature explanations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-600 dark:text-slate-300">
              <strong className="block font-bold text-slate-800 dark:text-slate-100 mb-0.5">
                حماية العين وتوضيح الأرقام:
              </strong>
              تم اختيار تدرجات أردوازية هادئة تحافظ على تباين عالي لقراءة الجداول والمجاميع وسجلات الحضور دون تشويش.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
            <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div className="text-xs text-slate-600 dark:text-slate-300">
              <strong className="block font-bold text-slate-800 dark:text-slate-100 mb-0.5">
                الطباعة الورقية الرسمية:
              </strong>
              تبقى وثائق ومطبوعات الـ A4 باللون الأبيض والأسود الإداري القياسي لضمان طباعة نقية وغير مستهلكة للحبر.
            </div>
          </div>
        </div>
      </div>

      {/* 1. البيانات الرسمية */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4 transition-colors">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Building2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">الهيكل الإداري الرسمي</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">الجمهورية</label>
            <input
              type="text"
              value={meta.republic}
              onChange={(e) => handleChange('republic', e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">الوزارة</label>
            <input
              type="text"
              value={meta.ministry}
              onChange={(e) => handleChange('ministry', e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">مديرية التربية لولاية</label>
            <input
              type="text"
              value={meta.wilaya}
              onChange={(e) => {
                const val = e.target.value;
                onUpdateMeta((prev) => ({
                  ...prev,
                  wilaya: val,
                  directorate: `مديرية التربية لولاية ${val}`,
                }));
              }}
              placeholder="مثال: باتنة، قسنطينة، وهران..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">اسم المؤسسة التعليمية</label>
            <input
              type="text"
              value={meta.institution}
              onChange={(e) => handleChange('institution', e.target.value)}
              placeholder="متوسطة الإخوة الشهداء / ثانوية العربي بن مهيدي..."
              className="w-full text-xs font-bold text-slate-900 dark:text-white p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">البلدية</label>
            <input
              type="text"
              value={meta.municipality}
              onChange={(e) => handleChange('municipality', e.target.value)}
              placeholder="اسم البلدية..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. الفترة الزمنية */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4 transition-colors">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">الفترة الزمنية الحالية</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">السنة الدراسية / المالية</label>
            <input
              type="text"
              value={meta.year}
              onChange={(e) => handleChange('year', e.target.value)}
              placeholder="2025 / 2026"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">رقم الشهر (لحساب الأيام والتواريخ)</label>
            <select
              value={meta.monthNum}
              onChange={(e) => handleChange('monthNum', Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold cursor-pointer focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            >
              {ARABIC_MONTHS.map((name, idx) => (
                <option key={idx + 1} value={idx + 1} className="dark:bg-slate-800">
                  {idx + 1} — {name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">اسم الشهر المعتمد في التقارير (تلقائي حسب الرقم)</label>
            <input
              type="text"
              value={canonicalMonth}
              readOnly
              title="يُشتق تلقائيًا من رقم الشهر لمنع عدم توافق الأيام"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-center font-bold text-emerald-800 dark:text-emerald-400 focus:outline-none cursor-not-allowed"
            />
            {monthMismatch && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                تم تصحيح اسم الشهر تلقائيًا إلى «{canonicalMonth}» ليطابق رقم الشهر {meta.monthNum}.
              </p>
            )}
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              السنة المحسوبة للتقويم: <b>{resolvedYear}</b> • عدد أيام هذا الشهر: <b>{daysInMonth} يوم</b>
            </p>
          </div>
        </div>
      </div>

      {/* 3. أسماء المعتمدين والموقعين */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4 transition-colors">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <UserCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">المسؤولون والموقعون الرسميون</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">اسم ولقب المقتصد (مسؤول مصلحة الاقتصاد)</label>
            <input
              type="text"
              value={meta.economistName}
              onChange={(e) => handleChange('economistName', e.target.value)}
              placeholder="الاسم واللقب..."
              className="w-full text-xs font-bold text-slate-900 dark:text-white p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">اسم ولقب السيد مدير المؤسسة</label>
            <input
              type="text"
              value={meta.directorName}
              onChange={(e) => handleChange('directorName', e.target.value)}
              placeholder="الاسم واللقب..."
              className="w-full text-xs font-bold text-slate-900 dark:text-white p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>
        </div>
      </div>

      {/* Save prompt bar */}
      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2 text-xs text-emerald-900 dark:text-emerald-300 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>تُحفظ الإعدادات والمظهر تلقائيًا وتُطبق فورًا على كافة أجزاء المنظومة.</span>
        </div>
        {lastSavedText && (
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
            {lastSavedText}
          </span>
        )}
      </div>
    </div>
  );
};
