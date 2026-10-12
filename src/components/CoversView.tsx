import React, { useState } from 'react';
import { ALL_COVERS, COVER_CATEGORIES, CoverFile } from '../data/coversConfig';
import {
  Archive,
  Search,
  Printer,
  ArrowLeft,
  ArrowRight,
  FileText,
  BookMarked,
  Layers,
  Wallet,
  Clock,
  FolderOpen,
} from 'lucide-react';

interface CoversViewProps {
  onPrintCover: (key: string) => void;
}

export const CoversView: React.FC<CoversViewProps> = ({ onPrintCover }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeGroup, setActiveGroup] = useState<string>('الكل');
  const [openedKey, setOpenedKey] = useState<string | null>(null);

  const filtered = ALL_COVERS.filter((c) => {
    const okGroup = activeGroup === 'الكل' || c.category === activeGroup;
    const q = searchTerm.trim();
    const okSearch =
      !q ||
      c.title.includes(q) ||
      c.number.includes(q) ||
      c.docs.some((d) => d.title.includes(q));
    return okGroup && okSearch;
  });

  const counts: Record<string, number> = {};
  ALL_COVERS.forEach((c) => {
    counts[c.category] = (counts[c.category] || 0) + 1;
  });

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'ملفات المقتصدية':
        return Archive;
      case 'السجلات':
        return BookMarked;
      case 'البطاقات':
        return Layers;
      case 'الكرونو':
        return Clock;
      case 'الخزينة والحوالات':
        return Wallet;
      default:
        return FileText;
    }
  };

  const opened: CoverFile | null = openedKey
    ? ALL_COVERS.find((c) => c.key === openedKey) || null
    : null;

  // ── تفصيل ملف واحد (صفحة الغلاف الداخلي) ──
  if (opened) {
    const Icon = getIcon(opened.category);
    return (
      <div className="space-y-5">
        <button
          onClick={() => setOpenedKey(null)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة إلى قائمة الأغلفة</span>
        </button>

        {/* بطاقة الغلاف */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="bg-gradient-to-l from-emerald-800 to-emerald-600 text-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-xl bg-white/15">
                  <Icon className="w-6 h-6" />
                </span>
                <div>
                  <div className="text-[11px] font-semibold text-emerald-100">
                    {opened.category} — رقم الملف: {opened.number}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black mt-0.5">{opened.title}</h2>
                  {opened.subtitleFr && (
                    <div className="text-[11px] tracking-wider uppercase text-emerald-100/80 mt-0.5">
                      {opened.subtitleFr}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => onPrintCover(opened.key)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-emerald-800 text-xs font-black hover:bg-emerald-50 transition-colors shrink-0 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الغلاف</span>
              </button>
            </div>
            {opened.description && (
              <p className="text-xs text-emerald-50/90 mt-3 leading-relaxed">{opened.description}</p>
            )}
          </div>

          {/* جدول الوثائق */}
          <div className="p-5 sm:p-6">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">
              الوثائق التي يتكون منها الملف ({opened.docs.length})
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <th className="px-3 py-2.5 text-right font-bold w-20">الرمز</th>
                    <th className="px-3 py-2.5 text-right font-bold">الوثيقة</th>
                  </tr>
                </thead>
                <tbody>
                  {opened.docs.map((d, i) => (
                    <tr
                      key={i}
                      className="border-t border-slate-100 dark:border-slate-800 hover:bg-emerald-50/50 dark:hover:bg-slate-800/60"
                    >
                      <td className="px-3 py-2.5 font-black text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {d.code}
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 dark:text-slate-200">{d.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* الحفظ والقيمة */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3.5 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">مدة الحفظ في المصلحة</div>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{opened.keepOffice}</div>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3.5 border border-slate-200 dark:border-slate-700">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">مدة الحفظ في الأرشيف</div>
                <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{opened.keepArchive}</div>
              </div>
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3.5 border border-amber-200 dark:border-amber-800/60">
                <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400">القيمة الإدارية</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5 leading-relaxed">
                  {opened.adminValue}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-3">
                <span className="font-bold text-slate-500 dark:text-slate-400">تاريخ فتح الملف:</span>
                <span className="font-mono tracking-widest text-slate-400">.... / .... / ........</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-3">
                <span className="font-bold text-slate-500 dark:text-slate-400">تاريخ غلق الملف:</span>
                <span className="font-mono tracking-widest text-slate-400">.... / .... / ........</span>
              </div>
            </div>
            <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-3">
              ملاحظة: حذف الوثائق ممنوع بقواعد القانون رقم 88-09 المؤرخ في 26 جانفي 1988 المتعلق بالأرشيف الوطني.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── قائمة الأغلفة ──
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs">
            <FolderOpen className="w-4 h-4" />
            <span>مخطط إحصاء وتصنيف الوثائق — 2 المقتصدية</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            أغلفة الملفات والسجلات والكرونو ({ALL_COVERS.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            تصنيف المصالح الاقتصادية إلى ملفات، وداخل كل ملف صفحات الغلاف الخارجي وقائمة الوثائق — جاهزة للطباعة A4.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث برقم الملف أو الوثيقة..."
            className="w-full text-xs pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {COVER_CATEGORIES.map((grp) => {
          const isActive = activeGroup === grp;
          const n = grp === 'الكل' ? ALL_COVERS.length : counts[grp] || 0;
          return (
            <button
              key={grp}
              onClick={() => setActiveGroup(grp)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {grp} ({n})
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          const Icon = getIcon(c.category);
          return (
            <div
              key={c.key}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-100 transition-colors">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                      {c.number}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {c.category}
                    </span>
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-800 transition-colors">
                  {c.title}
                </h3>
                {c.subtitleFr && (
                  <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
                    {c.subtitleFr}
                  </div>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {c.description} — {c.docs.length} وثائق.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setOpenedKey(c.key)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-600 text-emerald-800 dark:text-emerald-300 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>فتح صفحات الملف</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onPrintCover(c.key)}
                  title="طباعة الغلاف الخارجي"
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
          <Archive className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <div className="font-bold text-sm text-slate-700 dark:text-slate-300">لم يتم العثور على أي غلاف</div>
          <div className="text-xs mt-1">جرّب رقم ملف آخر (مثال: 3.2 أو كرونو)</div>
        </div>
      )}
    </div>
  );
};
