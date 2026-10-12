import React from 'react';
import { AppData } from '../types';
import { ALL_COVERS } from '../data/coversConfig';
import { Letterhead } from './Letterhead';

interface CoverPrintSheetProps {
  data: AppData;
  coverKey: string;
}

// غلاف خارجي A4 مطابق لنموذج "مخطط إحصاء وتصنيف الوثائق" الورقي
export const CoverPrintSheet: React.FC<CoverPrintSheetProps> = ({ data, coverKey }) => {
  const meta = data.meta;
  const cover = ALL_COVERS.find((c) => c.key === coverKey) || ALL_COVERS[0];

  return (
    <div className="text-slate-900 leading-normal" dir="rtl" style={{ fontFamily: "'Amiri','Cairo',serif" }}>
      <Letterhead meta={meta} title="مخطط إحصاء وتصنيف الوثائق" subtitle="2 - المقتصدية" />

      {/* عنوان الملف */}
      <div className="border-2 border-black rounded-lg overflow-hidden mb-4">
        <div className="flex">
          <div className="flex-1 border-l-2 border-black p-3 text-center">
            <div className="text-xs font-bold">عنوان الملف</div>
            <div className="text-xl font-black mt-1">{cover.title}</div>
            {cover.subtitleFr && (
              <div className="text-[11px] tracking-widest uppercase mt-0.5">{cover.subtitleFr}</div>
            )}
          </div>
          <div className="w-36 p-3 text-center bg-slate-100 print:bg-transparent">
            <div className="text-xs font-bold">رقم الملف</div>
            <div className="text-2xl font-black mt-1">{cover.number}</div>
          </div>
        </div>
        <div className="border-t-2 border-black px-3 py-1.5 text-[11px] text-center">
          {meta.institution || '—'} — {meta.municipality || ''} {meta.wilaya ? `— ولاية ${meta.wilaya}` : ''}
        </div>
      </div>

      {/* جدول الوثائق */}
      <table className="w-full border-2 border-black border-collapse text-[12px]">
        <thead>
          <tr className="bg-slate-100 print:bg-transparent">
            <th className="border border-black px-2 py-1.5 w-16">الرمز</th>
            <th className="border border-black px-2 py-1.5">الوثائق التي يتكون منها الملف</th>
            <th className="border border-black px-2 py-1.5 w-24">الحفظ في المصلحة</th>
            <th className="border border-black px-2 py-1.5 w-24">الحفظ في الأرشيف</th>
          </tr>
        </thead>
        <tbody>
          {cover.docs.map((d, i) => (
            <tr key={i}>
              <td className="border border-black px-2 py-1.5 text-center font-bold">{d.code}</td>
              <td className="border border-black px-2 py-1.5">{d.title}</td>
              {i === 0 && (
                <>
                  <td rowSpan={cover.docs.length} className="border border-black px-2 py-1.5 text-center font-bold align-middle">
                    {cover.keepOffice}
                  </td>
                  <td rowSpan={cover.docs.length} className="border border-black px-2 py-1.5 text-center font-bold align-middle">
                    {cover.keepArchive}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 text-[12px] flex gap-2">
        <span className="font-bold">القيمة الإدارية:</span>
        <span>{cover.adminValue}</span>
      </div>

      <div className="mt-4 flex justify-between text-[12px] font-bold">
        <div>تاريخ فتح الملف: .............................</div>
        <div>تاريخ غلق الملف: .............................</div>
      </div>

      <p className="mt-4 text-[11px] font-bold text-center border-t border-black pt-2">
        ملاحظة: حذف الوثائق ممنوع بقواعد القانون رقم 88-09 المؤرخ في 26 جانفي 1988 المتعلق بالأرشيف الوطني.
      </p>

      <div className="mt-6 flex justify-between text-[12px]">
        <div className="text-center">
          <div className="font-bold">المقتصد</div>
          <div className="mt-8">الإمضاء والختم</div>
        </div>
        <div className="text-center">
          <div className="font-bold">مدير المؤسسة</div>
          <div className="mt-8">الإمضاء والختم</div>
        </div>
      </div>
    </div>
  );
};
