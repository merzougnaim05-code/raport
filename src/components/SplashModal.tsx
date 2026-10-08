import React from 'react';
import { AppData } from '../types';
import { getDaysInMonth } from '../utils/dateUtils';
import {
  ArrowLeft,
  Shield,
  Building2,
  Calendar,
  Landmark,
  MapPin,
  School,
  Monitor,
  FileText,
  ClipboardList,
  Utensils,
  BadgeCheck,
  Scale,
  Users
} from 'lucide-react';

interface SplashModalProps {
  data: AppData;
  onEnter: () => void;
}

export const SplashModal: React.FC<SplashModalProps> = ({ data, onEnter }) => {
  const { meta, workers, days } = data;

  // Live monthly stats (computed once per portal open)
  let filledDays = 0;
  let lastDayMeals = 0;
  const daysInMonth = getDaysInMonth(meta);
  for (let d = 1; d <= daysInMonth; d++) {
    const day = days[d];
    if (!day) continue;
    const hasHc = Object.values(day.headcount || {}).some((c: any) =>
      ['b_pres', 'l_pres', 'd_pres'].some((k) => Number(c?.[k]) > 0)
    );
    if (hasHc) {
      filledDays++;
      const dl = days[d];
      lastDayMeals =
        (Number(dl.headcount?.boarding?.l_pres) || 0) +
        (Number(dl.headcount?.halfboard?.l_pres) || 0);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto no-print bg-[#f7f4ed] text-[#1c2e24]">
      {/* Government top bar — exactly like the invantaire portal */}
      <div className="sticky top-0 z-10 bg-[#215a3e] text-white shadow-md border-b-[3px] border-[#fcbb00]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#fcbb00] shrink-0" />
            <span className="text-xs sm:text-sm font-bold truncate">
              التقرير اليومي للمصالح الاقتصادية والتسيير المالي
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[11px] text-emerald-100/90 font-medium shrink-0">
            <span className="truncate">{meta.republic}</span>
            <span>•</span>
            <span className="truncate">{meta.ministry}</span>
          </div>
          <button
            onClick={onEnter}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/25 text-[11px] font-bold text-emerald-50 hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>الدخول للمنظومة</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-10">
        {/* ===== Card 1: الدمغة الرسمية ===== */}
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_-20px_rgba(28,46,36,0.25)] border border-[#e7e0d2] px-5 sm:px-10 py-9 sm:py-11 text-center relative overflow-hidden">
          <div className="absolute top-3 right-4 text-[#215a3e]/25 text-xs tracking-[0.3em] select-none">❖ ❖ ❖</div>
          <div className="absolute bottom-3 left-4 text-[#215a3e]/25 text-xs tracking-[0.3em] select-none">❖ ❖ ❖</div>

          <div className="text-[11px] font-bold text-[#5c6f64] tracking-widest mb-4">الدمغة الرسمية</div>

          {/* Circular emblem with double gold ring */}
          <div className="mx-auto w-24 h-24 rounded-full bg-[#215a3e] border-4 border-[#fcbb00] ring-4 ring-[#215a3e]/30 flex items-center justify-center shadow-lg">
            <Landmark className="w-10 h-10 text-white" />
          </div>
          <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#fcbb00] text-[#1c2e24] text-[11px] font-black">
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>مؤسسة رسمية</span>
          </div>

          <h2 className="mt-4 text-base sm:text-lg font-bold text-[#1c2e24]">
            {meta.republic || 'الجمهورية الجزائرية الديمقراطية الشعبية'}
          </h2>
          <h3 className="mt-0.5 text-sm sm:text-base font-bold text-[#3c5748]">
            {meta.ministry || 'وزارة التربية الوطنية'}
          </h3>

          {/* Metadata pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 bg-[#faf8f2] px-3 py-1.5 rounded-full border border-[#215a3e]/35 text-[#215a3e]">
              <MapPin className="w-3.5 h-3.5" />
              <span>مديرية التربية لولاية: <b>{meta.wilaya || '—'}</b></span>
            </span>
            <span className="flex items-center gap-1.5 bg-[#faf8f2] px-3 py-1.5 rounded-full border border-[#215a3e]/35 text-[#215a3e]">
              <School className="w-3.5 h-3.5" />
              <span>المؤسسة: <b>{meta.institution || '—'}</b></span>
            </span>
          </div>

          <h1 className="mt-7 text-3xl sm:text-5xl font-black text-[#1c2e24] leading-tight tracking-tight">
            التقرير اليومي
            <br className="sm:hidden" />
            <span className="sm:inline"> للمصالح الاقتصادية</span>
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-[#5c6f64] max-w-xl mx-auto leading-relaxed">
            المنظومة الرقمية المعتمدة للتقارير اليومية، تعداد الإطعام، متابعة حضور العمال،
            وإصدار وطباعة الوثائق الإدارية الرسمية للمقتصد
          </p>

          <div className="h-px bg-[#e7e0d2] max-w-lg mx-auto mt-8" />

          {/* ===== Dark stats card: إحصاء الشهر ===== */}
          <div className="relative mt-8 rounded-2xl bg-gradient-to-bl from-[#0f172b] to-[#020618] border-2 border-[#fcbb00]/70 p-5 sm:p-6 text-right overflow-hidden">
            <div className="absolute top-2 left-3 text-[#fcbb00]/50 text-xs tracking-widest select-none">❖ ❖ ❖</div>
            <div className="absolute bottom-2 right-3 text-[#fcbb00]/40 text-xs tracking-widest select-none">❖ ❖ ❖</div>

            <div className="flex flex-wrap items-start justify-between gap-5">
              {/* Right: headline figure */}
              <div className="flex items-center gap-4 order-1">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#fcbb00] to-[#f99c00] flex items-center justify-center shadow-lg shadow-[#fcbb00]/25 shrink-0">
                  <Utensils className="w-7 h-7 text-[#1c2e24]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#fcbb00] text-[#1c2e24] text-[11px] font-black">
                      إحصاء التقرير الشهري
                    </span>
                    <span className="text-[11px] text-emerald-200/80 font-semibold">
                      محدث تلقائيًا
                    </span>
                  </div>
                  <div className="text-4xl sm:text-5xl font-black text-[#fcbb00] leading-tight mt-1 tabular-nums">
                    {filledDays}
                    <span className="text-xl sm:text-2xl text-white mr-2">/ {daysInMonth} يوم</span>
                  </div>
                  <div className="text-xs text-emerald-100/85 font-semibold">
                    تقارير يومية منجزة — آخر يوم مسجل: {lastDayMeals > 0 ? `${lastDayMeals} وجبة غداء موزعة` : 'لا يوجد بعد'}
                  </div>
                </div>
              </div>

              {/* Left: 3 stat boxes */}
              <div className="flex items-stretch gap-2.5 order-2 sm:order-2 flex-1 min-w-[260px] justify-end">
                {[
                  { label: 'العمال والموظفون', value: workers.length, sub: 'مسجلون في المنظومة', icon: Users },
                  { label: 'الوثائق الإدارية', value: 19, sub: 'نموذج ومحضر معتمد', icon: FileText },
                  { label: 'وجبات اليوم', value: lastDayMeals, sub: 'حسب آخر تقرير', icon: ClipboardList },
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-center">
                      <div className="text-[10px] text-emerald-200/80 font-semibold flex items-center justify-center gap-1">
                        <Icon className="w-3 h-3" />
                        {s.label}
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-white mt-1 tabular-nums">{s.value}</div>
                      <div className="text-[9px] text-emerald-100/60 mt-0.5">{s.sub}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] text-emerald-100/70 font-semibold">
              <span className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-[#fcbb00]" />
                وثائق رسمية مطابقة للنماذج الوزارية المعتمدة لمصلحة الاقتصاد
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#fcbb00]" />
                السنة الدراسية: {meta.year}
              </span>
            </div>
          </div>
        </div>

        {/* ===== Entry buttons (like invantaire's big entry cards) ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <button
            onClick={onEnter}
            className="group bg-white rounded-2xl border-2 border-[#215a3e]/25 hover:border-[#215a3e] shadow-sm hover:shadow-lg px-5 py-4 text-right transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-black text-[#1c2e24]">التقرير اليومي والوثائق</div>
                <div className="text-[11px] text-[#5c6f64] font-semibold mt-0.5 truncate">
                  {daysInMonth} يوم • تعداد الإطعام وحضور العمال و19 وثيقة رسمية
                </div>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#215a3e] text-white text-xs font-black group-hover:bg-[#174a32] transition-colors">
                الدخول
                <ArrowLeft className="w-3.5 h-3.5" />
              </span>
            </div>
          </button>

          <button
            onClick={onEnter}
            className="group bg-white rounded-2xl border-2 border-[#fcbb00]/60 hover:border-[#fcbb00] shadow-sm hover:shadow-lg px-5 py-4 text-right transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-black text-[#1c2e24]">مكتبة الوجبات والإحصائيات</div>
                <div className="text-[11px] text-[#5c6f64] font-semibold mt-0.5 truncate">
                  قوائم الوجبات الجاهزة • لوحة القيادة الشهرية
                </div>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#fcbb00] text-[#1c2e24] text-xs font-black group-hover:bg-[#f99c00] transition-colors">
                فتح
                <ArrowLeft className="w-3.5 h-3.5" />
              </span>
            </div>
          </button>
        </div>

        {/* ===== Footer ===== */}
        <div className="mt-8 pb-6 text-center">
          <div className="inline-flex items-center gap-2 text-[11px] text-[#5c6f64] font-semibold">
            <Shield className="w-3.5 h-3.5 text-[#215a3e]" />
            <span>
              منظومة التقرير اليومي {meta.year} — تطبيق ويب مستقل يعمل محليًا داخل المتصفح مع حفظ تلقائي للبيانات
            </span>
          </div>
          <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-[#8a9a8f]">
            <Building2 className="w-3 h-3" />
            <span>{meta.directorate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
