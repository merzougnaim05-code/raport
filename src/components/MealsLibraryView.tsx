import React, { useState } from 'react';
import { MealTemplate, MealCategory } from '../types';
import { MEAL_CATEGORIES } from '../data/initialData';
import {
  Utensils,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
} from 'lucide-react';

interface MealsLibraryViewProps {
  library: MealTemplate[];
  onAddMeal: (meal: Omit<MealTemplate, 'id'>) => void;
  onUpdateMeal: (id: string, patch: Partial<MealTemplate>) => void;
  onDeleteMeal: (id: string) => void;
}

const catLabel = (c: MealCategory) => MEAL_CATEGORIES.find((x) => x.id === c)?.label || c;

export const MealsLibraryView: React.FC<MealsLibraryViewProps> = ({
  library,
  onAddMeal,
  onUpdateMeal,
  onDeleteMeal,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MealCategory>('lunch');
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setName('');
    setCategory('lunch');
    setDescription('');
    setEditingId(null);
    setShowForm(false);
  };

  const openAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (m: MealTemplate) => {
    setName(m.name);
    setCategory(m.category);
    setDescription(m.description);
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!name.trim() || !description.trim()) return;
    if (editingId) {
      onUpdateMeal(editingId, { name: name.trim(), category, description: description.trim() });
    } else {
      onAddMeal({ name: name.trim(), category, description: description.trim() });
    }
    resetForm();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="card-soft p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-xs">
            <Utensils className="w-4 h-4" />
            <span>مكتبة الوجبات الجاهزة</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            الوجبات المعتمدة ({library.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            اكتب الوجبات هنا مرة واحدة، ثم أدرجها بضغطة في أي تقرير يومي.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة وجبة</span>
        </button>
      </div>

      {/* Add / edit form */}
      {showForm && (
        <div className="card-soft p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {editingId ? 'تعديل الوجبة' : 'وجبة جديدة'}
            </h3>
            <button
              onClick={resetForm}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">اسم الوجبة</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: غداء عادي، فطور محسن..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">الصنف</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MealCategory)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold cursor-pointer focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
              >
                {MEAL_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id} className="dark:bg-slate-800">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">مكونات الوجبة</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="اكتب مكونات الوجبة كما ستظهر في التقرير اليومي..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!name.trim() || !description.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editingId ? 'حفظ التعديل' : 'إضافة الوجبة'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Meals list */}
      {library.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {library.map((m) => (
            <div key={m.id} className="card-soft p-5 flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">{m.name}</h3>
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {catLabel(m.category)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">
                  {m.description}
                </p>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => openEdit(m)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>تعديل</span>
                </button>
                <button
                  onClick={() => onDeleteMeal(m.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card-soft p-12 text-center text-slate-400">
          <Utensils className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <div className="font-bold text-sm text-slate-700 dark:text-slate-300">لا توجد وجبات بعد</div>
          <div className="text-xs mt-1">اضغط «إضافة وجبة» لكتابة أول وجبة معتمدة</div>
        </div>
      )}
    </div>
  );
};
