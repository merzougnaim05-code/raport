import React, { useState } from 'react';
import { Worker } from '../types';
import { Users, Plus, Trash2, Printer, Search, Phone, Briefcase, User } from 'lucide-react';

interface WorkersViewProps {
  workers: Worker[];
  onAddWorker: () => void;
  onUpdateWorker: (index: number, field: keyof Worker, value: string) => void;
  onDeleteWorker: (index: number) => void;
  onPrintWorkers: () => void;
}

export const WorkersView: React.FC<WorkersViewProps> = ({
  workers,
  onAddWorker,
  onUpdateWorker,
  onDeleteWorker,
  onPrintWorkers,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredWorkers = workers
    .map((w, idx) => ({ ...w, originalIdx: idx }))
    .filter(
      (w) =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.job.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.phone.includes(searchTerm)
    );

  // Collect distinct job titles for suggestions
  const distinctJobs = Array.from(new Set(workers.map((w) => w.job).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Autocomplete Datalist for jobs */}
      <datalist id="jobsDatalist">
        {distinctJobs.map((j) => (
          <option key={j} value={j} />
        ))}
      </datalist>

      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs">
            <Users className="w-4 h-4" />
            <span>الموارد البشرية</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            سجل قائمة العمال والموظفين ({workers.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            تُستعمل هذه القائمة تلقائيًا في التقرير اليومي، كشوف الحضور، تسخير العمال، والبرامج الأسبوعية والسنوية.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddWorker}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-500 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عامل جديد</span>
          </button>
          <button
            onClick={onPrintWorkers}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة القائمة</span>
          </button>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4 transition-colors">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالاسم أو الوظيفة أو الهاتف..."
              className="w-full text-xs pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-750 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
            العدد الإجمالي: {workers.length}
          </span>
        </div>

        {filteredWorkers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 text-center">
                  <th className="py-2.5 px-3 w-12 border-l border-slate-200 dark:border-slate-700">الرقم</th>
                  <th className="py-2.5 px-3 border-l border-slate-200 dark:border-slate-700 text-right min-w-[200px]">الاسم واللقب</th>
                  <th className="py-2.5 px-3 border-l border-slate-200 dark:border-slate-700 text-right min-w-[180px]">الوظيفة / الرتبة</th>
                  <th className="py-2.5 px-3 border-l border-slate-200 dark:border-slate-700 text-center min-w-[150px]">رقم الهاتف</th>
                  <th className="py-2.5 px-2 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredWorkers.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <td className="py-2.5 px-3 text-center text-slate-500 dark:text-slate-400 font-bold border-l border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-850/40">
                      {w.originalIdx + 1}
                    </td>
                    <td className="p-1 border-l border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
                        <input
                          type="text"
                          value={w.name}
                          onChange={(e) => onUpdateWorker(w.originalIdx, 'name', e.target.value)}
                          placeholder="الاسم واللقب..."
                          className="w-full text-xs font-bold text-slate-900 dark:text-white p-2 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                        />
                      </div>
                    </td>
                    <td className="p-1 border-l border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
                        <input
                          type="text"
                          value={w.job}
                          list="jobsDatalist"
                          onChange={(e) => onUpdateWorker(w.originalIdx, 'job', e.target.value)}
                          placeholder="الوظيفة..."
                          className="w-full text-xs text-slate-700 dark:text-slate-200 p-2 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                        />
                      </div>
                    </td>
                    <td className="p-1 border-l border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 justify-center">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
                        <input
                          type="tel"
                          value={w.phone}
                          onChange={(e) => onUpdateWorker(w.originalIdx, 'phone', e.target.value)}
                          placeholder="06.XX.XX.XX.XX"
                          className="w-full text-xs text-center font-mono text-slate-800 dark:text-slate-200 p-2 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-800 focus:outline-none"
                        />
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => onDeleteWorker(w.originalIdx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        title="حذف هذا العامل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <div className="font-bold text-sm text-slate-700 dark:text-slate-300">لا يوجد عمال مسجلون</div>
            <div className="text-xs mt-1">اضغط "إضافة عامل جديد" لإدراج العمال في المنظومة</div>
          </div>
        )}
      </div>
    </div>
  );
};
