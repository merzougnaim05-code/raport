import React, { useState } from 'react';
import { TASNIF_ROOT_FILES, TASNIF_SECTIONS, tasnifUrl } from '../data/tasnifData';
import { Archive, Download, Search, FileText } from 'lucide-react';

const FileRow: React.FC<{ dir: string; file: string }> = ({ dir, file }) => (
  <a
    href={tasnifUrl(dir, file)}
    download={file}
    className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors group"
  >
    <span className="flex items-center gap-2 min-w-0 text-xs font-semibold text-slate-700 dark:text-slate-200">
      <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
      <span className="truncate">{file}</span>
    </span>
    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
      <Download className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">تحميل</span>
    </span>
  </a>
);

export const TasnifView: React.FC = () => {
  const [q, setQ] = useState('');
  const query = q.trim();

  const match = (name: string) => !query || name.includes(query);
  const visibleSections = TASNIF_SECTIONS.map((s) => ({
    ...s,
    files: s.files.filter(match),
  })).filter((s) => match(s.title) || s.files.length > 0);
  const visibleRoot = TASNIF_ROOT_FILES.filter(match);
  const total = visibleRoot.length + visibleSections.reduce((n, s) => n + s.files.length, 0);

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs">
          <Archive className="w-4 h-4" />
          <span>تصنيف مصلحة الاقتصاد — أغلفة 2025</span>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
          تصنيف مصلحة الاقتصاد
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          نسخة طبق الأصل من مجلد «أغلفة 2025» دون أي تغيير — اضغط على أي غلاف لتحميله.
        </p>
        <div className="relative mt-4">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="بحث في الأغلفة..."
            className="w-full text-xs pr-10 pl-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
          />
        </div>
      </div>

      {total === 0 && (
        <div className="text-center text-xs text-slate-400 py-8">لا نتائج مطابقة لـ «{query}»</div>
      )}

      {visibleRoot.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">ملفات عامة ({visibleRoot.length})</h3>
          </div>
          <div className="p-2 space-y-0.5">
            {visibleRoot.map((f) => (
              <FileRow key={f} dir="" file={f} />
            ))}
          </div>
        </div>
      )}

      {visibleSections.map((s) => (
        <div key={s.dir} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {s.title} ({s.files.length})
            </h3>
          </div>
          <div className="p-2 space-y-0.5">
            {s.files.map((f) => (
              <FileRow key={f} dir={s.dir} file={f} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
