import React from 'react';
import { InstitutionMeta } from '../types';
import { ArrowLeft, Shield, Building2, Calendar, FileText } from 'lucide-react';

interface SplashModalProps {
  meta: InstitutionMeta;
  onEnter: () => void;
}

export const SplashModal: React.FC<SplashModalProps> = ({ meta, onEnter }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white overflow-y-auto no-print">
      {/* Decorative ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(16,185,129,0.15),transparent_70%)] pointer-events-none" />

      <div className="relative w-full max-w-2xl bg-slate-900/90 border border-emerald-500/20 rounded-2xl shadow-2xl p-6 sm:p-10 text-center backdrop-blur-md">
        {/* Algerian Emblem badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center shadow-lg shadow-emerald-900/40 border border-emerald-400/30 mb-5 text-2xl">
          🇩🇿
        </div>

        <div className="text-sm text-emerald-300 font-semibold tracking-wide">
          {meta.republic || 'الجمهورية الجزائرية الديمقراطية الشعبية'}
        </div>
        <div className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
          {meta.ministry || 'وزارة التربية الوطنية'}
        </div>

        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent mx-auto my-4" />

        {/* Institution & Year chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs text-slate-300 mb-4">
          <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>مديرية التربية لولاية: <b>{meta.wilaya || '—'}</b></span>
          </span>
          <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/60">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>السنة الدراسية: <b>{meta.year || '—'}</b></span>
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-emerald-200 mt-1">
          {meta.institution || 'المؤسسة التعليمية'}
        </h2>
        <div className="text-xs text-slate-400 mt-1">
          {[meta.municipality, meta.wilaya].filter(Boolean).join(' — ') || 'مصلحة التسيير المادي والمالي'}
        </div>

        <div className="mt-6 pt-5 border-t border-slate-800">
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            التقرير اليومي للمصالح الاقتصادية
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
            منظومة رقمية متكاملة لتسيير التقارير اليومية، سجلات الحضور، متابعة الوجبات، وإصدار وطباعة جميع الوثائق الإدارية للمقتصد.
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onEnter}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/50 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.99]"
          >
            <span>الدخول إلى المنظومة</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-8 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-500/70" />
          <span>جميع البيانات تُحفظ محليًا بأمان داخل متصفحك دون الحاجة لاتصال خارجي</span>
        </div>
      </div>
    </div>
  );
};
