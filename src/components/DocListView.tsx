import React, { useState } from 'react';
import { DOC_LIST } from '../data/documentsConfig';
import { DocMetaInfo } from '../types';
import { 
  FolderArchive, 
  Search, 
  Printer, 
  ArrowLeft, 
  FileText, 
  Layers, 
  Warehouse, 
  UserCheck, 
  Key, 
  FileSpreadsheet
} from 'lucide-react';

interface DocListViewProps {
  onSelectDoc: (key: string) => void;
  onPrintDocBlank: (key: string) => void;
  docRegistryCount: Record<string, number>;
}

export const DocListView: React.FC<DocListViewProps> = ({
  onSelectDoc,
  onPrintDocBlank,
  docRegistryCount,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeGroup, setActiveGroup] = useState<string>('الكل');

  const groups = ['الكل', 'وثائق المخازن', 'طلبات ووثائق العمال', 'السكنات والمفاتيح', 'متابعة العمال', 'التقارير'];

  const filteredDocs = DOC_LIST.filter((doc) => {
    const matchesGroup = activeGroup === 'الكل' || doc.group === activeGroup;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.subtitleFr && doc.subtitleFr.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesGroup && matchesSearch;
  });

  const getGroupIcon = (group: string) => {
    switch (group) {
      case 'وثائق المخازن':
        return Warehouse;
      case 'طلبات ووثائق العمال':
        return UserCheck;
      case 'السكنات والمفاتيح':
        return Key;
      case 'متابعة العمال':
        return Layers;
      case 'التقارير':
        return FileSpreadsheet;
      default:
        return FileText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs">
            <FolderArchive className="w-4 h-4" />
            <span>الدليل الإداري الرسمي</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            الوثائق الإدارية والمحاضر المعتمدة (19 وثيقة)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            جميع النماذج والمحاضر والتراخيص الرسمية الخاصة بمصلحة التسيير المالي والمادي للمقتصد.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث باسم الوثيقة أو المحضر..."
            className="w-full text-xs pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {groups.map((grp) => {
          const isActive = activeGroup === grp;
          return (
            <button
              key={grp}
              onClick={() => setActiveGroup(grp)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-750 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {grp}
            </button>
          );
        })}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          const GroupIcon = getGroupIcon(doc.group);
          const registryCount = docRegistryCount[doc.key] || 0;

          return (
            <div
              key={doc.key}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60 transition-colors">
                    <GroupIcon className="w-5 h-5" />
                  </span>
                  <div className="flex items-center gap-1.5">
                    {registryCount > 0 && (
                      <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                        {registryCount} مسجلة
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {doc.group}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors">
                  {doc.title}
                </h3>
                {doc.subtitleFr && (
                  <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5">
                    {doc.subtitleFr}
                  </div>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {doc.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onSelectDoc(doc.key)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-emerald-800 dark:text-emerald-300 hover:text-white dark:hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>تحرير الوثيقة</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onPrintDocBlank(doc.key)}
                  title="طباعة نموذج فارغ"
                  className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDocs.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center text-slate-400">
          <FolderArchive className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <div className="font-bold text-sm text-slate-700 dark:text-slate-300">لم يتم العثور على أي وثيقة</div>
          <div className="text-xs mt-1">تأكد من كتابة اسم الوثيقة بشكل صحيح أو إزالة التصفية</div>
        </div>
      )}
    </div>
  );
};
