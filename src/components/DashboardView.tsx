import React from 'react';
import { AppData, NavView } from '../types';
import { DOC_LIST } from '../data/documentsConfig';
import { resolveReportYear, getWeekdayName, getDaysInMonth, getCanonicalMonthName } from '../utils/dateUtils';
import { 
  CalendarDays, 
  FolderArchive, 
  Users, 
  Settings, 
  Download, 
  Upload, 
  Printer, 
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Building2,
  ChevronLeft,
  Utensils,
  Clock,
  ClipboardList
} from 'lucide-react';

interface DashboardViewProps {
  data: AppData;
  currentDay: number;
  onNavigate: (view: NavView, arg?: any) => void;
  onExport: () => void;
  onImportClick: () => void;
  onPrintCurrentDay: () => void;
  isDayFilled: (day: number) => boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  currentDay,
  onNavigate,
  onExport,
  onImportClick,
  onPrintCurrentDay,
  isDayFilled,
}) => {
  // Real month calendar values first (needed by metrics loop below)
  const calYear = resolveReportYear(data.meta);
  const calMonth = data.meta.monthNum || new Date().getMonth() + 1;
  const daysInMonth = getDaysInMonth(data.meta);
  const displayMonth = getCanonicalMonthName(calMonth) || data.meta.monthName;
  // Compute metrics
  let filledDaysCount = 0;
  let totalPresentCount = 0;
  let presentDaysCount = 0;
  let totalAbsenceOrDelay = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    if (isDayFilled(d)) filledDaysCount++;
    const day = data.days[d];
    if (day) {
      let daySum = 0;
      let hasHc = false;
      Object.values(day.headcount || {}).forEach((c: any) => {
        ['b_pres', 'l_pres', 'd_pres'].forEach((k) => {
          if (c[k]) {
            daySum += Number(c[k]) || 0;
            hasHc = true;
          }
        });
      });
      if (hasHc) {
        totalPresentCount += daySum;
        presentDaysCount++;
      }

      Object.values(day.workerStatus || {}).forEach((status: any) => {
        if (status && status !== 'حاضر' && status !== 'يوم كامل') {
          totalAbsenceOrDelay++;
        }
      });
      totalAbsenceOrDelay += (day.attendance || []).length;
    }
  }

  const avgPresent = presentDaysCount ? Math.round(totalPresentCount / presentDaysCount) : 0;

  // Real month calendar (starts Saturday, like the Algerian work week)
  const firstDow = new Date(calYear, calMonth - 1, 1).getDay(); // 0=Sun..6=Sat
  const leadBlanks = (firstDow + 1) % 7; // offset when week starts Saturday
  const weekHeads = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  const nowD = new Date();
  const isCurrentMonth = calMonth === nowD.getMonth() + 1 && calYear === nowD.getFullYear();
  const todayNum = nowD.getDate();
  const dayStatus = (d: number): 'full' | 'draft' | 'empty' => {
    if (isDayFilled(d)) return 'full';
    if (data.days[d]) return 'draft';
    return 'empty';
  };

  // Group documents for quick jump
  const docGroups: Record<string, typeof DOC_LIST> = {};
  DOC_LIST.forEach((doc) => {
    if (!docGroups[doc.group]) docGroups[doc.group] = [];
    docGroups[doc.group].push(doc);
  });

  return (
    <div className="rounded-[2rem] border-[3px] border-double border-[#215a3e]/50 bg-[#215a3e] p-2 sm:p-3 shadow-2xl">
      <div className="rounded-[1.6rem] border border-dashed border-[#fcbb00]/30 p-3 sm:p-5 space-y-6">
      <div className="space-y-6">
      {/* Header Banner — invantaire dark-gold style */}
      <div className="bg-gradient-to-bl from-[#0f172b] to-[#020618] rounded-2xl p-6 sm:p-8 text-white shadow-xl border-2 border-[#fcbb00]/70 relative overflow-hidden">
        <div className="absolute top-2 left-4 text-[#fcbb00]/50 text-xs tracking-widest select-none">❖ ❖ ❖</div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fcbb00] text-[#1c2e24] text-xs font-black mb-3">
            <Building2 className="w-3.5 h-3.5" />
            <span>{data.meta.institution || 'المؤسسة التعليمية'} — مصلحة الاقتصاد</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            لوحة قيادة التسيير المالي والمادي
          </h2>
          <p className="text-emerald-100/80 text-xs sm:text-sm mt-2 leading-relaxed">
            متابعة إحصائيات الإطعام، وجبات التلاميذ والأساتذة، وضعية العمال، واستخراج التقارير الرسمية والـ 19 محضرًا معتمدًا لشهر {displayMonth} {calYear}.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('day', currentDay)}
              className="px-5 py-2.5 rounded-xl bg-[#fcbb00] hover:bg-[#f99c00] text-[#1c2e24] font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تحرير تقرير اليوم ({currentDay} {displayMonth})</span>
            </button>
            <button
              onClick={() => onNavigate('doclist')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/25 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <FolderArchive className="w-4 h-4" />
              <span>دليل الوثائق (19)</span>
            </button>
          </div>
        </div>

        {/* Decorative badge background */}
        <div className="absolute left-6 -bottom-10 opacity-10 pointer-events-none text-[180px] font-serif font-black select-none hidden md:block">
          🇩🇿
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filled Days */}
        <div className="card-soft p-5 flex flex-col justify-between text-center items-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">التقارير المنجزة</span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CalendarDays className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{filledDaysCount}</span>
              <span className="text-xs font-semibold text-slate-400">/ {daysInMonth} يوم</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-emerald-600 dark:bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${daysInMonth ? Math.round((filledDaysCount / daysInMonth) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Total Workers */}
        <div className="card-soft p-5 flex flex-col justify-between text-center items-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي العمال</span>
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{data.workers.length}</span>
              <span className="text-xs font-semibold text-slate-400">عامل وموظف</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">مسجلون في المنظومة</p>
          </div>
        </div>

        {/* Average Attendance */}
        <div className="card-soft p-5 flex flex-col justify-between text-center items-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">متوسط الحضور</span>
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{avgPresent}</span>
              <span className="text-xs font-semibold text-slate-400">وجبة / يوم</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">لكل الوجبات الموزعة</p>
          </div>
        </div>

        {/* Absences and Delays */}
        <div className="card-soft p-5 flex flex-col justify-between text-center items-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الغيابات والتأخرات</span>
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{totalAbsenceOrDelay}</span>
              <span className="text-xs font-semibold text-slate-400">حالة مسجلة</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">خلال الشهر الحالي</p>
          </div>
        </div>
      </div>

      {/* Modern Control Panel Grid */}
      <div className="card-soft p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">لوحة العمليات السريعة</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">الوصول الفوري لمهام التسيير والإدارة</p>
          </div>

          {/* Direct Doc Jump */}
          <div className="w-full sm:w-72">
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  onNavigate('doc', e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer outline-none"
            >
              <option value="">— انتقال سريع لوثيقة إدارية —</option>
              {Object.entries(docGroups).map(([group, docs]) => (
                <optgroup key={group} label={group} className="dark:bg-slate-800">
                  {docs.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.title}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          <button
            onClick={() => onNavigate('day', currentDay)}
            className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-slate-800 text-center items-center transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">التقرير اليومي</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">تحرير اليوم {currentDay}</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('doclist')}
            className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-slate-800 text-center items-center transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">الوثائق الإدارية</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">19 نموذج ومحضر معتمد</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('workers')}
            className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-slate-800 text-center items-center transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">قائمة العمال</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">سجل الأسماء والوظائف</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('meals')}
            className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-slate-800 text-center items-center transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">مكتبة الوجبات</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">كتابة وإدراج وجبات التقرير</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('shifts')}
            className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-slate-800 text-center items-center transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">أوقات العمل</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">تعريف الدوامات للبرامج</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('sijl')}
            className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-slate-800 text-center items-center transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">سجل الغيابات</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">التأخرات والأرصدة</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-slate-800 text-center items-center transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">معلومات المؤسسة</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">البيانات والمظهر والإعدادات</div>
            </div>
          </button>

          <button
            onClick={onPrintCurrentDay}
            className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-slate-800 text-center items-center transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">طباعة تقرير اليوم</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">معاينة ورقية رسمية</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('day', 1)}
            className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-slate-800 text-center items-center transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">بداية الشهر</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">الانتقال إلى اليوم 1</div>
            </div>
          </button>

          <button
            onClick={onExport}
            className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-slate-800 text-center items-center transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">تصدير نسخة احتياطية</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">حفظ ملف JSON كامل</div>
            </div>
          </button>

          <button
            onClick={onImportClick}
            className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-slate-800 text-center items-center transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">استيراد نسخة</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">استرجاع بيانات سابقة</div>
            </div>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Quick Days Mini Launcher & Official Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly calendar */}
        <div className="lg:col-span-2 card-soft p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">تقويم الشهر — {displayMonth} {calYear}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">اختر أي يوم لمراجعة أو تدوين تقريره</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> مكتمل
              </span>
              <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> مسودة
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" /> فارغ
              </span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mt-5 text-center">
            {weekHeads.map((w) => (
              <div key={w} className="text-[11px] font-black text-slate-400 dark:text-slate-500 pb-1">
                {w}
              </div>
            ))}
            {Array.from({ length: leadBlanks }).map((_, i) => (
              <div key={`b${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
              const st = dayStatus(d);
              const isCurrent = d === currentDay;
              const isToday = isCurrentMonth && d === todayNum;
              return (
                <button
                  key={d}
                  onClick={() => onNavigate('day', d)}
                  title={`اليوم ${d} — يوم ${getWeekdayName(d, data.meta)}`}
                  className={`relative p-2 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 min-h-[52px] ${
                    isCurrent
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-600/25 font-black scale-[1.03]'
                      : st === 'full'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                      : st === 'draft'
                      ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                  } ${isToday && !isCurrent ? 'ring-2 ring-sky-500/70' : ''}`}
                >
                  <span className="text-sm font-black leading-none">{d}</span>
                  <span className="text-[9px] font-semibold opacity-80 leading-none">
                    {getWeekdayName(d, data.meta)}
                  </span>
                  {isToday && (
                    <span className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-sky-500" title="اليوم" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Institution Info Card */}
        <div className="card-soft p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">بيانات المؤسسة</h3>
              <button
                onClick={() => onNavigate('settings')}
                className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
              >
                تعديل
              </button>
            </div>

            <div className="space-y-3.5 mt-4 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block mb-0.5">المؤسسة:</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{data.meta.institution || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block mb-0.5">مديرية التربية لولاية:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{data.meta.wilaya || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block mb-0.5">البلدية:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{data.meta.municipality || '—'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block mb-0.5">المقتصد:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{data.meta.economistName || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 block mb-0.5">المدير:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{data.meta.directorName || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onNavigate('settings')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>إدارة المعلومات والمظهر</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      </div>
      </div>
    </div>
  );
};
