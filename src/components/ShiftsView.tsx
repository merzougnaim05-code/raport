import React, { useState } from 'react';
import { ShiftTemplate } from '../types';
import { Clock, Plus, Trash2, Save } from 'lucide-react';

interface ShiftsViewProps {
  templates: ShiftTemplate[];
  onAddShift: (tpl: Omit<ShiftTemplate, 'id'>) => void;
  onUpdateShift: (id: string, patch: Partial<ShiftTemplate>) => void;
  onDeleteShift: (id: string) => void;
  onSave: () => void;
  lastSavedText: string;
}

export const ShiftsView: React.FC<ShiftsViewProps> = ({
  templates,
  onAddShift,
  onUpdateShift,
  onDeleteShift,
  onSave,
  lastSavedText,
}) => {
  const [name, setName] = useState('');
  const [from, setFrom] = useState('08:00');
  const [to, setTo] = useState('12:00');

  const handleAdd = () => {
    const n = name.trim();
    if (!n || !from || !to) return;
    onAddShift({ name: n, from, to });
    setName('');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs">
            <Clock className="w-4 h-4" />
            <span>أوقات العمل الرسمية</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            تعريف توقيت الدوامات
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            اكتب أوقات العمل هنا مرة واحدة، وستظهر كخيارات جاهزة في جداول البرنامج الفردي والسنوي — اختر التوقيت بدل كتابته كل مرة.
          </p>
        </div>

        <button
          onClick={onSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>حفظ</span>
        </button>
      </div>

      {/* Add form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 transition-colors">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          إضافة توقيت جديد
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">اسم الدوام</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: صباحي، مسائي، ليلي..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">من الساعة</label>
            <input
              type="time"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">إلى الساعة</label>
            <input
              type="time"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={!name.trim() || !from || !to}
          className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة التوقيت</span>
        </button>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            التوقيتات المعتمدة ({templates.length})
          </h3>
        </div>
        {templates.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
            لا توجد توقيتات بعد — أضف أول توقيت من الأعلى.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 text-center">
                  <th className="py-2.5 px-3 border-l border-slate-200 dark:border-slate-700 w-12">ر.ت</th>
                  <th className="py-2.5 px-3 border-l border-slate-200 dark:border-slate-700 text-right">اسم الدوام</th>
                  <th className="py-2.5 px-3 border-l border-slate-200 dark:border-slate-700 w-32">من الساعة</th>
                  <th className="py-2.5 px-3 border-l border-slate-200 dark:border-slate-700 w-32">إلى الساعة</th>
                  <th className="py-2.5 px-2 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {templates.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                    <td className="py-2 px-3 text-center text-slate-500 dark:text-slate-400 font-semibold border-l border-slate-200 dark:border-slate-700">
                      {idx + 1}
                    </td>
                    <td className="p-1.5 border-l border-slate-200 dark:border-slate-700">
                      <input
                        type="text"
                        value={t.name}
                        onChange={(e) => onUpdateShift(t.id, { name: e.target.value })}
                        className="w-full text-xs font-bold p-1.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-500 bg-transparent focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </td>
                    <td className="p-1.5 border-l border-slate-200 dark:border-slate-700">
                      <input
                        type="time"
                        value={t.from}
                        onChange={(e) => onUpdateShift(t.id, { from: e.target.value })}
                        className="w-full text-xs text-center p-1.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-500 bg-transparent focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </td>
                    <td className="p-1.5 border-l border-slate-200 dark:border-slate-700">
                      <input
                        type="time"
                        value={t.to}
                        onChange={(e) => onUpdateShift(t.id, { to: e.target.value })}
                        className="w-full text-xs text-center p-1.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-500 bg-transparent focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </td>
                    <td className="p-1.5 text-center">
                      <button
                        onClick={() => onDeleteShift(t.id)}
                        title="حذف هذا التوقيت"
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {lastSavedText && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">{lastSavedText}</p>
      )}
    </div>
  );
};
