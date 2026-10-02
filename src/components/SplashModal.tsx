import React from 'react';
import { AppData } from '../types';
import { ArrowLeft, Shield, Building2, Calendar, Landmark, MapPin, BadgeCheck, School } from 'lucide-react';

interface SplashModalProps {
  data: AppData;
  onEnter: () => void;
}

export const SplashModal: React.FC<SplashModalProps> = ({ data, onEnter }) => {
  const { meta, workers, days } = data;

  // Live stats for the dark stats card (same style as invantair's entrance)
  let filledDays = 0;
  for (let d = 1; d <= 31; d++) {
    const day = days[d];
    if (!day) continue;
    const hasHc = Object.values(day.headcount || {}).some((c: any) =>
      ['b_pres', 'l_pres', 'd_pres'].some((k) => Number(c?.[k]) > 0)
    );
    if (hasHc) filledDays++;
  }
  const docCount = 19;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto no-print bg-[#f7f4ed] text-[#1c2e24]">
      {/* Government top bar */}
      <div className="sticky top-0 z-10 bg-[#215a3e] text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#fcbb00] shrink-0" />
            <span className="text-xs sm:text-sm font-bold truncate">
              التقرير اليومي للمصالح الاقتصادية — منظومة التسيير المالي والمادي
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-emerald-100/90 font-medium shrink-0">
            <span>{meta.institution}</span>
            <span>•</span>
            <span>{meta.ministry}</span>
          </div>
        </div>
      </div>

      {/* Entrance card */}
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_-20px_rgba(28,46,36,0.25)] border border-[#e7e0d2] px-5 sm:px-10 py-8 sm:py-10 text-center">
          {/* Circular emblem with double gold ring */}
          <div className="mx-auto w-24 h-24 rounded-full bg-[#215a3e] border-4 border-[#fcbb00] ring-4 ring-[#215a3e]/30 flex items-center justify-center shadow-lg relative">
            <Landmark className="w-10 h-10 text-white" />
          </div>
          <button
            onClick={onEnter}
            className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#fcbb00] text-[#1c2e24] text-[11px] font-black hover:bg-[#f99c00] transition-colors cursor-pointer"
          >
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>مؤسسة رسمية</span>
          </button>

          <div className="mt-4 text-sm sm:text-base font-bold text-[#1c2e24]">
            {meta.institution || 'المؤسسة التعليمية'}
          </div>
          <div className="text-xs sm:text-sm text-[#5c6f64] mt-0.5">{meta.ministry || 'وزارة التربية الوطنية'}</div>

          {/* Metadata pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#215a3e]/40 text-[#215a3e]">
              <School className="w-3.5 h-3.5" />
              <span>المؤسسة: <b>{meta.institution || '—'}</b></span>
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#215a3e]/40 text-[#215a3e]">
              <MapPin className="w-3.5 h-3.5" />
              <span>مديرية التربية لولاية: <b>{meta.wilaya || '—'}</b></span>
            </span>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-[#215a3e]/40 text-[#215a3e]">
              <Calendar className="w-3.5 h-3.5" />
              <span>السنة الدراسية: <b>{meta.year || '—'}</b></span>
            </span>
          </div>

          <h1 className="mt-6 text-2xl sm:text-4xl font-black text-[#1c2e24] leading-tight">
            التقرير اليومي للمصالح الاقتصادية
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#5c6f64] max-w-xl mx-auto leading-relaxed">
            منظومة رقمية متكاملة لتسيير التقارير اليومية، سجلات الحضور، متابعة الوجبات،
            وإصدار وطباعة جميع الوثائق الإدارية للمقتصد.
          </p>

          <div className="h-px bg-[#e7e0d2] max-w-md mx-auto mt-7" />

          {/* Dark stats card with gold accents */}
          <div className="relative mt-7 rounded-2xl bg-gradient-to-bl from-[#0f172b] to-[#020618] border-2 border-[#fcbb00]/70 p-5 sm:p-6 text-right overflow-hidden">
            <div className="absolute top-2 left-3 text-[#fcbb00]/50 text-xs tracking-widest select-none">✦ ✦ ✦</div>
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div className="flex items-center gap-3 order-2 sm:order-1">
                {[
                  { label: 'تقارير منجزة', value: `${filledDays} / 31` },
                  { label: 'العمال', value: workers.length },
                  { label: 'وثائق إدارية', value: docCount },
                ].map((s) => (
                  <div key={s.label} className="flex-1 min-w-[90px] bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-center">
                    <div className="text-[10px] text-emerald-200/80 font-semibold flex items-center justify-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {s.label}
                    </div>
                    <div className="text-xl font-black text-white mt-0.5 tabular-nums">{s.value}</div>
                  </div>
                ))}
              </div>
              <div className="order-1 sm:order-2 text-center sm:text-right">
                <span className="inline-block px-2.5 py-1 rounded-full bg-[#fcbb00] text-[#1c2e24] text-[11px] font-black">
                  منظومة التسيير
                </span>
                <div className="text-3xl sm:text-4xl font-black text-[#fcbb00] leading-tight mt-1">
                  {meta.monthName}
                </div>
                <div className="text-xs text-emerald-100/80 font-semibold">
                  {meta.year} — شهر كامل قابل للطباعة الرسمية
                </div>
              </div>
            </div>
          </div>

          {/* Enter button */}
          <button
            onClick={onEnter}
            className="mt-8 w-full sm:w-auto px-10 py-3.5 rounded-xl bg-[#215a3e] hover:bg-[#1a4731] text-white font-black text-sm shadow-lg shadow-[#215a3e]/30 flex items-center justify-center gap-2 mx-auto cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.99]"
          >
            <span>الدخول إلى المنظومة</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="mt-6 text-[11px] text-[#5c6f64] flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#215a3e]/70" />
            <span>جميع البيانات تُحفظ محليًا بأمان داخل متصفحك دون الحاجة لاتصال خارجي</span>
          </div>
        </div>
      </div>
    </div>
  );
};
