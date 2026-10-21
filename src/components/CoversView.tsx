import React, { useState } from 'react';
import { ALL_COVERS, COVER_CATEGORIES, CoverFile } from '../data/coversConfig';
import { InstitutionMeta } from '../types';
import { CoverFrontArt } from './CoverFrontArt';
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
  meta: InstitutionMeta;
  onPrintCover: (key: string, page: 'front' | 'list') => void;
}

export const CoversView: React.FC<CoversViewProps> = ({ meta, onPrintCover }) => {
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
      c.docs.some((d) => d.title.includes(q) || d.code.includes(q));
    return okGroup && okSearch;
  });

  const counts: Record<string, number> = {};
  ALL_COVERS.forEach((c) => {
    counts[c.category] = (counts[c.category] || 0) + 1;
  });

  // تجميع الأغلفة في أقسام: عنوان الملف (الواجهة) + أزرار وثائقه تحته — كما في ملف وورد "الوثائق التي يتكون منها ملف الميزانية"
  const parentCovers = ALL_COVERS.filter((c) => !c.parentKey);
  const childrenOf = (key: string) => ALL_COVERS.filter((c) => c.parentKey === key);
  type CoverSection = { parent: CoverFile; kids: CoverFile[]; showSelf: boolean };
  const sections: CoverSection[] = [];
  for (const p of parentCovers) {
    const kidsAll = childrenOf(p.key);
    const selfVisible = filtered.some((c) => c.key === p.key);
    const kidVisible = kidsAll.filter((k) => filtered.some((f) => f.key === k.key));
    if (!selfVisible && kidVisible.length === 0) continue;
    sections.push({ parent: p, kids: selfVisible ? kidsAll : kidVisible, showSelf: selfVisible });
  }

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

  // ── تفصيل ملف واحد ──
  // • ملفات المقتصدية: صفحتان (الواجهة الأمامية المزخرفة + قائمة الوثائق)
  // • السجلات: الواجهة المزخرفة فقط (ليست ملفا للفتح والغلق)
  // • الباقي: قائمة الوثائق
  if (opened) {
    const Icon = getIcon(opened.category);
    const isDossier = opened.category === 'ملفات المقتصدية';
    const isRegister = opened.category === 'السجلات';
    const isChild = Boolean(opened.parentKey);
    const children = ALL_COVERS.filter((c) => c.parentKey === opened.key);
    const numberLabel = isRegister ? 'رقم السجل' : 'رقم الملف';
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
                    {opened.category} — {numberLabel}: {opened.number}
                    {opened.parentTitle ? ` — ضمن ${opened.parentTitle}` : ''}
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
                onClick={() => onPrintCover(opened.key, isRegister || isDossier ? 'front' : 'list')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-emerald-800 text-xs font-black hover:bg-emerald-50 transition-colors shrink-0 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{isRegister || isDossier ? 'طباعة الواجهة' : 'طباعة الغلاف'}</span>
              </button>
            </div>
            {opened.description && (
              <p className="text-xs text-emerald-50/90 mt-3 leading-relaxed">{opened.description}</p>
            )}
          </div>

          {/* الواجهة الأمامية المزخرفة (الملفات الفردية والسجلات) */}
          {(isDossier || isRegister) && (
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  الواجهة الأمامية {isDossier ? 'للملف' : 'للسجل'} — مطابقة للنموذج الورقي
                </h3>
                <button
                  onClick={() => onPrintCover(opened.key, 'front')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-600 text-emerald-800 dark:text-emerald-300 hover:text-white font-bold text-xs transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة الواجهة A4</span>
                </button>
              </div>
              <div className="max-w-2xl mx-auto shadow-md">
                <CoverFrontArt meta={meta} cover={opened} />
              </div>
            </div>
          )}

          {/* الأغلفة الفرعية — غلاف مستقل لكل وثيقة برقمها */}
          {children.length > 0 && (
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white mb-3">
                الأغلفة الفرعية — غلاف مستقل لكل وثيقة ({children.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {children.map((ch) => (
                  <div
                    key={ch.key}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 p-3.5"
                  >
                    <div className="min-w-0">
                      <span className="inline-block text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                        {ch.number}
                      </span>
                      <div className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 truncate">
                        {ch.title}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setOpenedKey(ch.key)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-600 text-emerald-800 dark:text-emerald-300 hover:text-white font-bold text-xs transition-all cursor-pointer"
                      >
                        عرض الواجهة
                      </button>
                      <button
                        onClick={() => onPrintCover(ch.key, 'front')}
                        title="طباعة واجهة الغلاف الفرعي"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* جدول الوثائق (الملفات فقط — السجلات والأغلفة الفرعية ليست ملفا للفتح والغلق) */}
          {!isRegister && !isChild && (
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                الوثائق التي يتكون منها الملف ({opened.docs.length})
              </h3>
              {isDossier && (
                <button
                  onClick={() => onPrintCover(opened.key, 'list')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة القائمة A4</span>
                </button>
              )}
            </div>
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
          )}
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
            تصنيف المصالح الاقتصادية إلى ملفات — لكل ملف واجهته الأمامية المزخرفة وقائمة وثائقه، وللسجلات واجهات مزخرفة — جاهزة للطباعة A4.
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

      {sections.map(({ parent, kids, showSelf }) => {
        const Icon = getIcon(parent.category);
        const isEconomy = parent.category === 'ملفات المقتصدية';
        return (
          <section key={parent.key} dir="rtl" className="rounded-2xl border-2 border-emerald-800/70 dark:border-emerald-700/60 overflow-hidden">
            {/* ===== عنوان الملف — بطاقة مزخرفة بأسلوب ملف الوورد ===== */}
            <div className="bg-gradient-to-b from-[#123524] via-[#0e2a1c] to-[#0a2117] dark:from-[#0d2818] dark:via-[#0a1f13] dark:to-[#07170e] px-4 sm:px-6 py-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
                <span className="p-2.5 rounded-xl bg-[#fcbb00] text-[#1c2e24] shrink-0 shadow-sm">
                  <Icon className="w-6 h-6" />
                </span>
                <div className="flex-1 text-center sm:text-right">
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-[11px] font-black text-[#1c2e24] bg-[#fcbb00] px-2.5 py-0.5 rounded-full">
                      {parent.number}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-200/80">{parent.category}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-[#fcbb00] mt-1 leading-snug" style={{ fontFamily: "'Amiri','Cairo',serif" }}>
                    {parent.title}
                  </h3>
                  <p className="text-[11px] text-emerald-100/70 mt-0.5 leading-relaxed">{parent.description}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onPrintCover(parent.key, isEconomy ? 'list' : 'front')}
                    title={isEconomy ? 'طباعة الغلاف الخارجي + قائمة الوثائق' : 'طباعة الواجهة المزخرفة'}
                    className="px-3 py-2 rounded-xl bg-[#fcbb00] hover:bg-amber-300 text-[#1c2e24] font-black text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{isEconomy ? 'غلاف الملف' : 'الواجهة'}</span>
                  </button>
                  <button
                    onClick={() => setOpenedKey(parent.key)}
                    title="عرض تفاصيل الملف ومحتوياته"
                    className="px-3 py-2 rounded-xl border border-[#fcbb00]/40 hover:bg-white/10 text-[#fcbb00] font-black text-[11px] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">تفاصيل</span>
                  </button>
                </div>
              </div>
            </div>

            {/* أزرار وثائق الملف + شريط معلومات الحفظ */}
            <div className="bg-white dark:bg-slate-900 p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 border-b border-emerald-800/10 dark:border-emerald-700/20 pb-2">
                <span>🧾 مدة الحفظ بالمكتب: {parent.keepOffice}</span>
                <span>🏛️ الأرشيف: {parent.keepArchive}</span>
                {kids.length > 0 && <span>✦ أزرار الواجهات: {kids.length} جاهزة للطباعة</span>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {kids.map((k) => (
                  <button
                    key={k.key}
                    onClick={() => onPrintCover(k.key, 'front')}
                    title={`طباعة واجهة ${k.title} برقم ${k.number}`}
                    className="group/kid flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-right transition-all cursor-pointer"
                  >
                    <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5 rounded shrink-0 min-w-[52px] text-center">
                      {k.number}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 leading-snug flex-1">{k.title}</span>
                    <Printer className="w-3.5 h-3.5 text-slate-300 group-hover/kid:text-emerald-700 transition-colors shrink-0" />
                  </button>
                ))}
                {kids.length === 0 && showSelf && (
                  <div className="col-span-full text-[11px] text-slate-500 dark:text-slate-400 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-xl py-3">
                    {isEconomy
                      ? `ملف مفتوح — اضغط «غلاف الملف» لطباعة الغلاف الخارجي وقائمة الوثائق (${parent.docs.length} وثيقة)`
                      : 'اضغط «الواجهة» لطباعة الواجهة المزخرفة A4'}
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}

      {sections.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-400">
          <Archive className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <div className="font-bold text-sm text-slate-700 dark:text-slate-300">لم يتم العثور على أي غلاف</div>
          <div className="text-xs mt-1">جرّب رقم ملف آخر (مثال: 3.2 أو كرونو)</div>
        </div>
      )}
    </div>
  );
};
