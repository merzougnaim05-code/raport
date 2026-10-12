import React, { useState } from 'react';
import { AppData, ModawamaGroup, ModawamaProgram, ShiftCellData } from '../types';
import { WEEK_SCHEDULE_DAYS } from '../data/initialData';
import { createEmptyModawamaGroup } from '../data/initialData';
import { CalendarDays, Plus, Trash2, Save, Printer, FileText, Users } from 'lucide-react';

interface ModawamaViewProps {
  data: AppData;
  programId: string;
  onSelectProgram: (id: string) => void;
  onAddProgram: (title: string) => void;
  onUpdateProgram: (id: string, updater: (prev: ModawamaProgram) => ModawamaProgram) => void;
  onDeleteProgram: (id: string) => void;
  onPrintProgram: (id: string, blank?: boolean) => void;
  onSave: () => void;
  lastSavedText: string;
}

let rowSeq = 0;
const newRowId = () => `mr_${Date.now()}_${(rowSeq++).toString(36)}${Math.random().toString(36).substring(2, 5)}`;

// Compact colored shift picker (same behavior as annual program cells)
const ModCell: React.FC<{
  cell: ShiftCellData | undefined;
  templates: AppData['shiftTemplates'];
  onChange: (upd: ShiftCellData) => void;
}> = ({ cell, templates, onChange }) => {
  const isRest = cell?.mode === 'راحة';
  const matchIdx = !isRest && (cell?.mode || cell?.from || cell?.to)
    ? templates.findIndex(
        (t) =>
          (cell?.from && cell?.to && cell.from === t.from && cell.to === t.to) ||
          (cell?.mode && cell.mode === t.name)
      )
    : -1;
  const hasData = Boolean(cell?.mode || cell?.from || cell?.to);
  const isCustom = !isRest && hasData && matchIdx === -1;
  const selectVal = isRest ? '__rest' : matchIdx >= 0 ? templates[matchIdx].id : isCustom ? '__custom' : '';
  // Each timing has its own color; names are never written in cells (times only)
  const matchedColor = matchIdx >= 0 ? templates[matchIdx].color || '#64748b' : '';
  const colors = isRest
    ? 'bg-slate-200 border-slate-400 text-slate-700'
    : isCustom
      ? 'bg-amber-100 border-amber-500 text-amber-900'
      : 'bg-white border-slate-300 text-slate-700';
  const selectStyle =
    matchIdx >= 0 && matchedColor
      ? { backgroundColor: matchedColor + '1A', borderColor: matchedColor }
      : undefined;

  return (
    <div className="flex flex-col gap-1 min-w-0">
      <select
        value={selectVal}
        title={matchIdx >= 0 ? templates[matchIdx].name : 'اختر الدوام'}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '') onChange({});
          else if (v === '__rest') onChange({ mode: 'راحة' });
          else if (v === '__custom')
            onChange({ mode: cell?.mode === 'راحة' ? '' : cell?.mode || '', from: cell?.from || '', to: cell?.to || '' });
          else {
            const t = templates.find((x) => x.id === v);
            if (t) onChange({ mode: t.name, from: t.from, to: t.to });
          }
        }}
        style={selectStyle}
        className={`w-full text-[11px] p-1 rounded-lg border-2 focus:outline-none font-semibold cursor-pointer ${colors}`}
      >
        <option value="">—</option>
        <option value="__rest">راحة</option>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.from} - {t.to}
          </option>
        ))}
        <option value="__custom">مخصص</option>
      </select>
      {matchIdx >= 0 && (
        <div
          className="text-[10px] font-bold text-center leading-tight"
          style={{ color: matchedColor || undefined }}
        >
          <div>من {templates[matchIdx].from}</div>
          <div>إلى {templates[matchIdx].to}</div>
        </div>
      )}
      {isCustom && (
        <div className="flex flex-col gap-1 mt-1">
          <input
            type="time"
            value={cell?.from || ''}
            onChange={(e) => onChange({ ...cell, from: e.target.value })}
            className="w-full text-[11px] p-1 rounded border border-slate-200"
            title="من الساعة"
          />
          <input
            type="time"
            value={cell?.to || ''}
            onChange={(e) => onChange({ ...cell, to: e.target.value })}
            className="w-full text-[11px] p-1 rounded border border-slate-200"
            title="إلى الساعة"
          />
        </div>
      )}
    </div>
  );
};

export const ModawamaView: React.FC<ModawamaViewProps> = ({
  data,
  programId,
  onSelectProgram,
  onAddProgram,
  onUpdateProgram,
  onDeleteProgram,
  onPrintProgram,
  onSave,
  lastSavedText,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [confirmState, setConfirmState] = useState<{ message: string; onOk: () => void } | null>(null);
  const programs = data.modawama || [];
  const prog = programs.find((p) => p.id === programId) || programs[0];

  const workerNameOf = (wid: string) => data.workers.find((x) => x.id === wid)?.name || 'عامل';

  // A scheduled cell counts as a period unless it is empty or rest (راحة لا تحتسب)
  const isActivePeriod = (cell?: ShiftCellData) => {
    if (!cell) return false;
    if (cell.mode) return cell.mode !== 'راحة';
    return Boolean(cell.from || cell.to);
  };

  const countPeriods = (p: ModawamaProgram, workerId: string) => {
    let n = 0;
    p.groups.forEach((g) =>
      g.rows.forEach((r) => {
        if (r.workerId !== workerId) return;
        Object.values(r.schedule || {}).forEach((c) => {
          if (isActivePeriod(c)) n++;
        });
      })
    );
    return n;
  };

  const patch = (updater: (p: ModawamaProgram) => ModawamaProgram) => {
    if (prog) onUpdateProgram(prog.id, updater);
  };
  const patchGroup = (gid: string, updater: (g: ModawamaGroup) => ModawamaGroup) =>
    patch((p) => ({ ...p, groups: p.groups.map((g) => (g.id === gid ? updater(g) : g)) }));

  const handleAddGroup = () => {
    if (!prog) return;
    const n = prog.groups.length + 1;
    const names = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];
    patch((p) => ({
      ...p,
      groups: [...p.groups, createEmptyModawamaGroup(`الفوج ${names[(n - 1) % names.length] || n}`)],
    }));
  };

  const handleAddRow = (gid: string) =>
    patchGroup(gid, (g) => ({
      ...g,
      rows: [...g.rows, { id: newRowId(), workerId: '', tasks: '', schedule: {} }],
    }));

  const handleAddNote = () =>
    patch((p) => ({ ...p, notes: [...(p.notes || []), ''] }));

  // Worker select with duplicate warning (OK continues, cancel reverts)
  const handleWorkerChange = (gid: string, rowId: string, wid: string) => {
    if (!prog) return;
    const apply = () =>
      patchGroup(gid, (gg) => ({
        ...gg,
        rows: gg.rows.map((x) => (x.id === rowId ? { ...x, workerId: wid } : x)),
      }));
    if (!wid) {
      apply();
      return;
    }
    const dup = prog.groups.some((g) => g.rows.some((r) => r.id !== rowId && r.workerId === wid));
    if (dup) {
      setConfirmState({
        message: `تنبيه: العامل «${workerNameOf(wid)}» مكرر في هذا البرنامج. هل تريد الاستمرار؟`,
        onOk: () => {
          apply();
          setConfirmState(null);
        },
      });
      return;
    }
    apply();
  };

  // Shift cell with over-5-periods warning (rest does not count)
  const handleCellChange = (gid: string, rowId: string, day: string, upd: ShiftCellData, workerId: string) => {
    if (!prog) return;
    const apply = () =>
      patchGroup(gid, (gg) => ({
        ...gg,
        rows: gg.rows.map((x) =>
          x.id === rowId ? { ...x, schedule: { ...(x.schedule || {}), [day]: upd } } : x
        ),
      }));
    if (!workerId || !isActivePeriod(upd)) {
      apply();
      return;
    }
    const simulated: ModawamaProgram = {
      ...prog,
      groups: prog.groups.map((g) =>
        g.id === gid
          ? {
              ...g,
              rows: g.rows.map((r) =>
                r.id === rowId ? { ...r, schedule: { ...(r.schedule || {}), [day]: upd } } : r
              ),
            }
          : g
      ),
    };
    const n = countPeriods(simulated, workerId);
    if (n > 5) {
      setConfirmState({
        message: `تنبيه: العامل «${workerNameOf(workerId)}» تجاوز 5 فترات (أصبح لديه ${n} فترات — الراحة غير محسوبة). هل تريد الاستمرار؟`,
        onOk: () => {
          apply();
          setConfirmState(null);
        },
      });
      return;
    }
    apply();
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-400 font-black text-xs">
              مداومة
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              برنامج مداومة العطل المدرسية
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            الخريف • الشتاء • الربيع • الصيف — مع إمكانية إضافة برامج وفترات وعمال.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {prog && (
            <>
              <button
                onClick={() => onPrintProgram(prog.id, false)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة البرنامج</span>
              </button>
              <button
                onClick={() => onPrintProgram(prog.id, true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <span>نسخة فارغة</span>
              </button>
            </>
          )}
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>حفظ</span>
          </button>
        </div>
      </div>

      {/* Program selector + add */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">البرنامج الحالي</label>
            <select
              value={prog?.id || ''}
              onChange={(e) => onSelectProgram(e.target.value)}
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer focus:outline-none"
            >
              {programs.map((p) => (
                <option key={p.id} value={p.id} className="dark:bg-slate-800">
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">إضافة برنامج جديد</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="مثال: برنامج عطلة استثنائية..."
                className="flex-1 min-w-0 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
              <button
                onClick={() => {
                  if (!newTitle.trim()) return;
                  onAddProgram(newTitle.trim());
                  setNewTitle('');
                }}
                disabled={!newTitle.trim()}
                className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة</span>
              </button>
            </div>
          </div>
        </div>

        {prog && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="sm:col-span-1 space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">عنوان البرنامج</label>
              <input
                type="text"
                value={prog.title}
                onChange={(e) => patch((p) => ({ ...p, title: e.target.value }))}
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">الفترة من</label>
              <input
                type="date"
                value={prog.periodFrom || ''}
                onChange={(e) => patch((p) => ({ ...p, periodFrom: e.target.value }))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">إلى غاية</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={prog.periodTo || ''}
                  onChange={(e) => patch((p) => ({ ...p, periodTo: e.target.value }))}
                  className="flex-1 min-w-0 text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
                <button
                  onClick={() => onDeleteProgram(prog.id)}
                  title="حذف هذا البرنامج"
                  className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Groups */}
      {prog?.groups.map((g, gi) => (
        <div key={g.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">الفوج / الفترة الفرعية {gi + 1}</label>
              <input
                type="text"
                value={g.name}
                onChange={(e) => patchGroup(g.id, (gg) => ({ ...gg, name: e.target.value }))}
                className="w-full text-xs font-black p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">من</label>
              <input
                type="date"
                value={g.from || ''}
                onChange={(e) => patchGroup(g.id, (gg) => ({ ...gg, from: e.target.value }))}
                className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">إلى</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={g.to || ''}
                  onChange={(e) => patchGroup(g.id, (gg) => ({ ...gg, to: e.target.value }))}
                  className="flex-1 min-w-0 text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
                <button
                  onClick={() => patch((p) => ({ ...p, groups: p.groups.filter((x) => x.id !== g.id) }))}
                  title="حذف هذا الفوج"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2 px-2 w-8 border-l border-slate-200 dark:border-slate-700">ر.ت</th>
                  <th className="py-2 px-2 border-l border-slate-200 dark:border-slate-700 text-right min-w-[140px]">العامل</th>
                  {WEEK_SCHEDULE_DAYS.map((d) => (
                    <th key={d.id} className="py-2 px-1 border-l border-slate-200 dark:border-slate-700 min-w-[92px]">
                      {d.label}
                    </th>
                  ))}
                  <th className="py-2 px-2 min-w-[130px]">الأعمال الموكلة</th>
                  <th className="py-2 px-1 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {g.rows.map((r, ri) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                    <td className="py-2 px-2 text-slate-500 dark:text-slate-400 font-semibold border-l border-slate-200 dark:border-slate-700">
                      {ri + 1}
                    </td>
                    <td className="p-1.5 border-l border-slate-200 dark:border-slate-700">
                      <select
                        value={r.workerId}
                        onChange={(e) => handleWorkerChange(g.id, r.id, e.target.value)}
                        className="w-full text-xs font-bold p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer focus:outline-none"
                      >
                        <option value="">— اختر العامل —</option>
                        {data.workers.map((w) => (
                          <option key={w.id} value={w.id} className="dark:bg-slate-800">
                            {w.name} — {w.job}
                          </option>
                        ))}
                      </select>
                    </td>
                    {WEEK_SCHEDULE_DAYS.map((d) => (
                      <td key={d.id} className="p-1 border-l border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/30">
                        <ModCell
                          cell={r.schedule?.[d.id]}
                          templates={data.shiftTemplates}
                          onChange={(upd) => handleCellChange(g.id, r.id, d.id, upd, r.workerId)}
                        />
                      </td>
                    ))}
                    <td className="p-1.5">
                      <textarea
                        value={r.tasks || ''}
                        onChange={(e) =>
                          patchGroup(g.id, (gg) => ({
                            ...gg,
                            rows: gg.rows.map((x) => (x.id === r.id ? { ...x, tasks: e.target.value } : x)),
                          }))
                        }
                        rows={2}
                        placeholder="المهام..."
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                      />
                    </td>
                    <td className="p-1 text-center">
                      <button
                        onClick={() =>
                          patchGroup(g.id, (gg) => ({ ...gg, rows: gg.rows.filter((x) => x.id !== r.id) }))
                        }
                        title="حذف هذا السطر"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => handleAddRow(g.id)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>إضافة عامل</span>
            </button>
          </div>
        </div>
      ))}

      {prog && (
        <button
          onClick={handleAddGroup}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <CalendarDays className="w-4 h-4" />
          <span>إضافة فترة / فوج جديد</span>
        </button>
      )}

      {/* Notes */}
      {prog && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-3 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>ملاحظات البرنامج</span>
            </h3>
            <button
              onClick={handleAddNote}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة ملاحظة</span>
            </button>
          </div>
          {(prog.notes || []).length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-2">لا توجد ملاحظات بعد.</p>
          ) : (
            (prog.notes || []).map((n, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-400 w-5 text-center shrink-0">{idx + 1}</span>
                <input
                  type="text"
                  value={n}
                  onChange={(e) => {
                    const v = e.target.value;
                    patch((p) => {
                      const arr = [...(p.notes || [])];
                      arr[idx] = v;
                      return { ...p, notes: arr };
                    });
                  }}
                  placeholder={`ملاحظة ${idx + 1}...`}
                  className="flex-1 min-w-0 text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none"
                />
                <button
                  onClick={() =>
                    patch((p) => {
                      const arr = [...(p.notes || [])];
                      arr.splice(idx, 1);
                      return { ...p, notes: arr };
                    })
                  }
                  title="حذف هذه الملاحظة"
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {lastSavedText && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">{lastSavedText}</p>
      )}

      {/* Warning confirm modal (duplicate worker / over 5 periods) */}
      {confirmState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-300 dark:border-amber-700 shadow-2xl p-6 max-w-sm w-full text-center space-y-4">
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
              {confirmState.message}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={confirmState.onOk}
                className="px-5 py-2 text-xs font-black text-white bg-emerald-700 hover:bg-emerald-600 rounded-xl transition-colors cursor-pointer"
              >
                موافق
              </button>
              <button
                onClick={() => setConfirmState(null)}
                className="px-5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
