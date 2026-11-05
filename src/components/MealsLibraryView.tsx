import React, { useState } from 'react';
import { MealTemplate, MealCategory } from '../types';
import { MEAL_CATEGORIES } from '../data/initialData';
import {
  Utensils,
  Plus,
  Pencil,
  Trash2,
  Check,
  ListPlus,
} from 'lucide-react';

interface MealsLibraryViewProps {
  library: MealTemplate[];
  onAddMeal: (meal: Omit<MealTemplate, 'id'>) => void;
  onUpdateMeal: (id: string, patch: Partial<MealTemplate>) => void;
  onDeleteMeal: (id: string) => void;
}

const catLabel = (c: MealCategory) => MEAL_CATEGORIES.find((x) => x.id === c)?.label || c;

interface DraftRow {
  name: string;
  desc: string;
}

const emptyDraft = (): DraftRow => ({ name: '', desc: '' });

export const MealsLibraryView: React.FC<MealsLibraryViewProps> = ({
  library,
  onAddMeal,
  onUpdateMeal,
  onDeleteMeal,
}) => {
  // حقول مرقمة متراصة: كل سطر وجبة يُكتب مباشرة ثم زر الإضافة أمامه
  const [drafts, setDrafts] = useState<DraftRow[]>([emptyDraft()]);
  const [category, setCategory] = useState<MealCategory>('lunch');
  const [editingId, setEditingId] = useState<string | null>(null);

  const setDraft = (i: number, field: keyof DraftRow, value: string) => {
    setDrafts((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      // حقل فارغ تمامًا (غير الأول): يُحذف تلقائيًا عند الكتابة في حقل آخر
      return next.filter((d, j) => j === 0 || d.name.trim() || d.desc.trim());
    });
  };

  const addRow = () => setDrafts((prev) => [...prev, emptyDraft()]);

  const submitRow = (i: number) => {
    const d = drafts[i];
    const name = d.name.trim();
    if (!name) return;
    const desc = d.desc.trim() || name;
    if (editingId) {
      onUpdateMeal(editingId, { name, category, description: desc });
      setEditingId(null);
    } else {
      onAddMeal({ name, category, description: desc });
    }
    setDrafts((prev) => {
      const next = [...prev];
      next[i] = emptyDraft();
      return next.filter((r, j) => j === 0 || r.name.trim() || r.desc.trim());
    });
  };

  const startEdit = (m: MealTemplate) => {
    setEditingId(m.id);
    setCategory(m.category);
    setDrafts((prev) => {
      const next = [...prev];
      next[0] = { name: m.name, desc: m.description };
      // تكديس الحقول المتبقية أسفل سطر التعديل
      const rest = prev.slice(1).filter((d) => d.name.trim() || d.desc.trim());
      return [next[0], ...rest];
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDrafts((prev) => {
      const next = [...prev];
      next[0] = emptyDraft();
      return next.filter((d, j) => j === 0 || d.name.trim() || d.desc.trim());
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="card-soft p-5">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs">
          <Utensils className="w-4 h-4" />
          <span>مكتبة الوجبات الجاهزة</span>
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
          الوجبات المعتمدة ({library.length})
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          اكتب كل وجبة في سطر مرقّم ثم اضغط زر الإضافة — تظهر فورًا في الجدول أسفل الحقول.
        </p>
      </div>

      {/* حقول الإدخال المرقمة + زر الإضافة */}
      <div className="card-soft p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {editingId ? 'تعديل وجبة (السطر رقم 1)' : 'وجبات جديدة'}
          </h3>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">الصنف:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MealCategory)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold cursor-pointer focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            >
              {MEAL_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id} className="dark:bg-slate-800">
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          {drafts.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              {/* رقم السطر */}
              <span className="w-7 h-7 shrink-0 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-black flex items-center justify-center">
                {i + 1}
              </span>
              {/* اسم الوجبة */}
              <input
                type="text"
                value={d.name}
                onChange={(e) => setDraft(i, 'name', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitRow(i); }}
                placeholder="اسم الوجبة..."
                className="flex-[2] min-w-0 text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
              />
              {/* المكونات */}
              <input
                type="text"
                value={d.desc}
                onChange={(e) => setDraft(i, 'desc', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') submitRow(i); }}
                placeholder="المكونات (اختياري)..."
                className="flex-[3] min-w-0 text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
              />
              {/* زر الإضافة */}
              <button
                onClick={() => submitRow(i)}
                disabled={!d.name.trim()}
                title={editingId ? 'حفظ التعديل' : 'إضافة الوجبة'}
                className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-[11px] shadow-sm transition-colors cursor-pointer"
              >
                {editingId ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>حفظ</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={addRow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
          >
            <ListPlus className="w-3.5 h-3.5" />
            <span>حقل جديد مرقّم</span>
          </button>
          {editingId && (
            <button
              onClick={cancelEdit}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
            >
              إلغاء التعديل
            </button>
          )}
        </div>
      </div>

      {/* جدول الوجبات المضافة */}
      <div className="card-soft p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">جدول الوجبات المضافة</h3>
          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
            {library.length} وجبة
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 text-center">
                <th className="py-2 px-2 border-l border-slate-200 dark:border-slate-700 w-10">ر.ت</th>
                <th className="py-2 px-2 border-l border-slate-200 dark:border-slate-700 w-24">الصنف</th>
                <th className="py-2 px-2 border-l border-slate-200 dark:border-slate-700 text-right min-w-[120px]">اسم الوجبة</th>
                <th className="py-2 px-2 border-l border-slate-200 dark:border-slate-700 text-right">المكونات</th>
                <th className="py-2 px-2 w-28">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {library.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                    لا توجد وجبات مضافة بعد — اكتب في الحقول المرقمة أعلاه واضغط «إضافة»
                  </td>
                </tr>
              ) : (
                library.map((m, i) => (
                  <tr key={m.id} className={editingId === m.id
                    ? 'bg-amber-50/60 dark:bg-amber-950/20'
                    : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/50'}>
                    <td className="py-2 px-2 text-center text-slate-400 font-bold border-l border-slate-100 dark:border-slate-800">
                      {i + 1}
                    </td>
                    <td className="py-2 px-2 text-center border-l border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {catLabel(m.category)}
                      </span>
                    </td>
                    <td className="py-2 px-2 font-black text-slate-900 dark:text-white border-l border-slate-100 dark:border-slate-800">
                      {m.name}
                    </td>
                    <td className="py-2 px-2 text-slate-600 dark:text-slate-300 leading-relaxed border-l border-slate-100 dark:border-slate-800">
                      {m.description}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => startEdit(m)}
                          title="تعديل"
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteMeal(m.id)}
                          title="حذف"
                          className="p-1.5 rounded-lg text-rose-500 dark:text-rose-400/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
