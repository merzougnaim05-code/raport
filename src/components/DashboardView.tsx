import React from 'react';
import { AppData, NavView } from '../types';
import { DOC_LIST } from '../data/documentsConfig';
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
  ChevronLeft
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
  // Compute metrics
  let filledDaysCount = 0;
  let totalPresentCount = 0;
  let presentDaysCount = 0;
  let totalAbsenceOrDelay = 0;

  for (let d = 1; d <= 31; d++) {
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

  // Group documents for quick jump
  const docGroups: Record<string, typeof DOC_LIST> = {};
  DOC_LIST.forEach((doc) => {
    if (!docGroups[doc.group]) docGroups[doc.group] = [];
    docGroups[doc.group].push(doc);
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg border border-emerald-800/60 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold mb-3 border border-emerald-700/50">
            <Building2 className="w-3.5 h-3.5" />
            <span>{data.meta.institution || 'المؤسسة التعليمية'} — مصلحة الاقتصاد</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            لوحة قيادة التسيير المالي والمادي
          </h2>
          <p className="text-emerald-100/80 text-xs sm:text-sm mt-2 leading-relaxed">
            متابعة إحصائيات الإطعام، وجبات التلاميذ والأساتذة، وضعية العمال، واستخراج التقارير الرسمية والـ 19 محضرًا معتمدًا لشهر {data.meta.monthName} {data.meta.year}.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => onNavigate('day', currentDay)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تحرير تقرير اليوم ({currentDay} {data.meta.monthName})</span>
            </button>
            <button
              onClick={() => onNavigate('doclist')}
              className="px-4 py-2.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm border border-emerald-700/60 transition-colors flex items-center gap-2 cursor-pointer"
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">التقارير المنجزة</span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CalendarDays className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{filledDaysCount}</span>
              <span className="text-xs font-semibold text-slate-400">/ 31 يوم</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="bg-emerald-600 dark:bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.round((filledDaysCount / 31) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Total Workers */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي العمال</span>
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{data.workers.length}</span>
              <span className="text-xs font-semibold text-slate-400">عامل وموظف</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">مسجلون في المنظومة</p>
          </div>
        </div>

        {/* Average Attendance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">متوسط الحضور</span>
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{avgPresent}</span>
              <span className="text-xs font-semibold text-slate-400">وجبة / يوم</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">لكل الوجبات الموزعة</p>
          </div>
        </div>

        {/* Absences and Delays */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">الغيابات والتأخرات</span>
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{totalAbsenceOrDelay}</span>
              <span className="text-xs font-semibold text-slate-400">حالة مسجلة</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">خلال الشهر الحالي</p>
          </div>
        </div>
      </div>

      {/* Modern Control Panel Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 transition-colors">
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
            className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-slate-800 text-right transition-all cursor-pointer flex flex-col justify-between"
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
            className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-slate-800 text-right transition-all cursor-pointer flex flex-col justify-between"
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
            className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-slate-800 text-right transition-all cursor-pointer flex flex-col justify-between"
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
            onClick={() => onNavigate('settings')}
            className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-slate-800 text-right transition-all cursor-pointer flex flex-col justify-between"
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
            className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-slate-800 text-right transition-all cursor-pointer flex flex-col justify-between"
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
            className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-slate-800 text-right transition-all cursor-pointer flex flex-col justify-between"
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
            className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-slate-800 text-right transition-all cursor-pointer flex flex-col justify-between"
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
            className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:bg-slate-800 text-right transition-all cursor-pointer flex flex-col justify-between"
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
        {/* Quick Days Launcher */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">الوصول المباشر لأيام الشهر</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">اختر أي يوم لمراجعة أو تدوين تقريره</p>
            </div>
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/80">
              شهر {data.meta.monthName}
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2 mt-5">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
              const filled = isDayFilled(d);
              const isCurrent = d === currentDay;
              return (
                <button
                  key={d}
                  onClick={() => onNavigate('day', d)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    isCurrent
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm font-bold scale-105'
                      : filled
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xs font-bold">اليوم {d}</span>
                  {filled ? (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      مكتمل
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">فارغ</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Institution Info Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 flex flex-col justify-between transition-colors">
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
              className="w-full py-2.5 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>إدارة المعلومات والمظهر</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
