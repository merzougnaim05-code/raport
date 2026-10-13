import React from 'react';
import { InstitutionMeta } from '../types';
import { CoverFile } from '../data/coversConfig';

interface CoverFrontArtProps {
  meta: InstitutionMeta;
  cover: CoverFile;
}

// نجمة ثمانية (خاتم) زخرفية
const KhatamStar: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
    <g fill="none" stroke="currentColor" strokeWidth="6">
      <rect x="24" y="24" width="52" height="52" />
      <rect x="24" y="24" width="52" height="52" transform="rotate(45 50 50)" />
    </g>
    <circle cx="50" cy="50" r="9" fill="currentColor" />
  </svg>
);

const Divider: React.FC = () => (
  <div className="flex items-center gap-3 max-w-md mx-auto" aria-hidden="true">
    <div className="flex-1 h-px bg-emerald-800 print:bg-black" />
    <div className="w-2.5 h-2.5 rotate-45 bg-amber-500 print:bg-black shrink-0" />
    <div className="w-2 h-2 rotate-45 border-2 border-emerald-800 print:border-black shrink-0" />
    <div className="w-2.5 h-2.5 rotate-45 bg-amber-500 print:bg-black shrink-0" />
    <div className="flex-1 h-px bg-emerald-800 print:bg-black" />
  </div>
);

const CORNERS = ['top-2.5 right-2.5', 'top-2.5 left-2.5', 'bottom-2.5 right-2.5', 'bottom-2.5 left-2.5'];

// الواجهة الأمامية المزخرفة للملف الفردي — مطابقة لنموذج "أغلفة BOU / CLA أغلفة" الورقي:
// ترويسة رسمية + اسم المؤسسة + عنوان الملف كبيرا + رقم الملف
export const CoverFrontArt: React.FC<CoverFrontArtProps> = ({ meta, cover }) => {
  const isRegister = cover.category === 'السجلات';

  return (
    <div
      dir="rtl"
      style={{ fontFamily: "'Amiri','Cairo',serif" }}
      className="bg-white text-slate-900 leading-normal"
    >
      <div className="border-[6px] border-emerald-800 print:border-black p-1.5">
        <div className="border-2 border-amber-500 print:border-black px-5 py-8 sm:px-10 sm:py-12 text-center relative">
          {/* زخارف الزوايا */}
          {CORNERS.map((pos) => (
            <div
              key={pos}
              aria-hidden="true"
              className={`absolute ${pos} w-2.5 h-2.5 rotate-45 bg-emerald-800 print:bg-black`}
            />
          ))}

          {/* الترويسة الرسمية */}
          <div className="text-sm sm:text-base font-bold">
            {meta.republic || 'الجمهورية الجزائرية الديمقراطية الشعبية'}
          </div>
          <div className="text-sm sm:text-base font-black mt-0.5">
            {meta.ministry || 'وزارة التربية الوطنية'}
          </div>

          <div className="my-4">
            <Divider />
          </div>

          <div className="flex items-center justify-center gap-6 text-xs sm:text-sm font-semibold flex-wrap">
            <div>
              <span className="font-bold">مديرية التربية لولاية: </span>
              {meta.wilaya || '—'}
            </div>
            <div className="font-black text-emerald-900 print:text-black text-sm sm:text-base">
              {meta.institution || '—'}
            </div>
          </div>

          {/* الشعار الزخرفي */}
          <div className="flex justify-center my-5">
            <KhatamStar className="w-14 h-14 sm:w-16 sm:h-16 text-emerald-800 print:text-black" />
          </div>

          {/* شارة التصنيف */}
          <div className="text-xs font-bold text-amber-700 print:text-black">
            {isRegister ? 'مصلحة التسيير المالي والمادي' : 'مخطط إحصاء وتصنيف الوثائق — 2 المقتصدية'}
          </div>

          {/* عنوان الملف */}
          <h2 className="text-3xl sm:text-5xl font-black mt-2 tracking-normal">
            {cover.title}
          </h2>
          {cover.subtitleFr && (
            <div className="text-xs tracking-widest uppercase font-semibold text-slate-500 mt-1">
              {cover.subtitleFr}
            </div>
          )}

          {/* رقم الملف */}
          <div className="mt-4 inline-flex items-center gap-2 border-2 border-slate-900 print:border-black rounded-full px-6 py-1.5">
            <span className="text-xs font-bold">
              {isRegister ? 'رقم السجل:' : 'رقم الملف:'}
            </span>
            <span className="text-xl font-black">{cover.number}</span>
          </div>

          <div className="my-5">
            <Divider />
          </div>

          {/* السنة الدراسية */}
          <div className="text-sm sm:text-base font-bold">
            <span>السنة الدراسية: </span>
            <span>{meta.year || '…………'}</span>
          </div>

          {/* الإمضاءات */}
          <div className="mt-8 flex justify-between text-xs sm:text-sm px-2 sm:px-8">
            <div className="text-center">
              <div className="font-black">المقتصد</div>
              <div className="mt-10 text-slate-500">الإمضاء والختم</div>
            </div>
            <div className="text-center">
              <div className="font-black">مدير المؤسسة</div>
              <div className="mt-10 text-slate-500">الإمضاء والختم</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
