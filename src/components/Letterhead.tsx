import React from 'react';
import { InstitutionMeta } from '../types';

interface LetterheadProps {
  meta: InstitutionMeta;
  title: string;
  subtitle?: string;
  subtitleFr?: string;
  refline?: string;
}

export const Letterhead: React.FC<LetterheadProps> = ({
  meta,
  title,
  subtitle,
  subtitleFr,
  refline,
}) => {
  return (
    <div className="text-center pb-5 mb-6 border-b-2 border-emerald-700/80 print:border-black print:pb-3 print:mb-4">
      <div className="text-sm font-semibold tracking-wide text-slate-700 print:text-black">
        {meta.republic || 'الجمهورية الجزائرية الديمقراطية الشعبية'}
      </div>
      <div className="text-sm font-bold text-slate-800 print:text-black mt-0.5">
        {meta.ministry || 'وزارة التربية الوطنية'}
      </div>

      <div className="flex justify-between items-center text-xs text-slate-600 print:text-black font-medium mt-3 px-1 border-t border-slate-200 print:border-black pt-2">
        <div>
          <span className="font-bold text-slate-800 print:text-black">مديرية التربية لولاية:</span>{' '}
          {meta.wilaya || '—'}
        </div>
        <div className="font-bold text-emerald-800 print:text-black text-sm">
          {meta.institution || '—'}
        </div>
        <div>
          <span className="font-bold text-slate-800 print:text-black">السنة الدراسية:</span>{' '}
          {meta.year || '—'}
        </div>
      </div>

      {refline && (
        <div className="text-xs text-slate-500 print:text-black mt-1.5 italic">
          {refline}
        </div>
      )}

      <div className="mt-4">
        <h2 className="text-xl md:text-2xl font-black text-emerald-950 print:text-black tracking-normal">
          {title}
        </h2>
        {subtitleFr && (
          <div className="text-xs tracking-wider uppercase font-semibold text-slate-500 print:text-black mt-0.5">
            {subtitleFr}
          </div>
        )}
        {subtitle && (
          <div className="text-xs font-semibold text-emerald-700 print:text-black mt-1">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
