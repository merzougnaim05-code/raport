import React, { useState } from 'react';
import { AppData, DocMetaInfo, ShiftCellData } from '../types';
import { DOC_LIST, SIMPLE_DOCS_SPEC } from '../data/documentsConfig';
import { WEEK_SCHEDULE_DAYS, WEEKDAY_AR } from '../data/initialData';
import { 
  ArrowRight, 
  Printer, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Archive, 
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface DocDetailViewProps {
  data: AppData;
  docKey: string;
  onBack: () => void;
  onUpdateDocData: (key: string, docData: any) => void;
  onUpdateRegistry: (key: string, registry: any[]) => void;
  onPrintDoc: (key: string, blank?: boolean) => void;
  onSave: () => void;
  lastSavedText: string;
}

export const DocDetailView: React.FC<DocDetailViewProps> = ({
  data,
  docKey,
  onBack,
  onUpdateDocData,
  onUpdateRegistry,
  onPrintDoc,
  onSave,
  lastSavedText,
}) => {
  const docInfo: DocMetaInfo = DOC_LIST.find((d) => d.key === docKey) || {
    key: docKey,
    title: 'وثيقة إدارية',
    group: 'التقارير',
    subtitleFr: '',
  };

  const currentDocData = data.docs[docKey] || {};
  const currentRegistry = data.docRegistry[docKey] || [];

  // Local state for registry form
  const [newRegName, setNewRegName] = useState('');
  const [newRegDate, setNewRegDate] = useState(new Date().toISOString().slice(0, 10));

  // Helper updater
  const updateDoc = (updater: (prev: any) => any) => {
    const updated = updater(currentDocData);
    onUpdateDocData(docKey, updated);
  };

  // Registry actions
  const handleAddRegistryEntry = () => {
    if (!newRegName.trim()) return;
    const updated = [...currentRegistry, { name: newRegName.trim(), date: newRegDate }];
    onUpdateRegistry(docKey, updated);
    setNewRegName('');
  };

  const handleDeleteRegistryEntry = (idx: number) => {
    const updated = [...currentRegistry];
    updated.splice(idx, 1);
    onUpdateRegistry(docKey, updated);
  };

  // Helper for input rendering
  const renderSmartInput = (
    field: any,
    val: any,
    onChange: (v: string) => void
  ) => {
    if (field.type === 'weekday') {
      return (
        <select
          value={val || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
        >
          <option value="" className="dark:bg-slate-800">— اختر اليوم —</option>
          {WEEKDAY_AR.map((d) => (
            <option key={d} value={d} className="dark:bg-slate-800">
              {d}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === 'job') {
      return (
        <input
          type="text"
          value={val || ''}
          list="jobsDatalist"
          onChange={(e) => onChange(e.target.value)}
          placeholder="اختر أو اكتب الوظيفة..."
          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
        />
      );
    }

    if (field.type === 'number') {
      return (
        <input
          type="number"
          min="0"
          value={val || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none font-semibold text-center"
        />
      );
    }

    const inputType = field.type === 'date' || field.type === 'time' ? field.type : 'text';
    return (
      <input
        type={inputType}
        value={val || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
      />
    );
  };

  // Helper for Shift Cell in schedules
  const renderShiftCell = (
    cell: ShiftCellData | undefined,
    onCellChange: (updated: ShiftCellData) => void
  ) => {
    const mode = cell?.mode || '';
    const showTimes = mode && mode !== 'راحة';

    return (
      <div className="flex flex-col gap-1 min-w-[120px]">
        <select
          value={mode}
          onChange={(e) => onCellChange({ ...cell, mode: e.target.value })}
          className="text-xs p-1.5 rounded-lg border border-slate-200 bg-white focus:outline-none font-semibold"
        >
          <option value="">— اختر الدوام —</option>
          <option value="راحة">راحة</option>
          <option value="نهاري">نهاري</option>
          <option value="ليلي">ليلي</option>
        </select>
        {showTimes && (
          <div className="flex items-center gap-1 mt-1">
            <input
              type="time"
              value={cell?.from || ''}
              onChange={(e) => onCellChange({ ...cell, from: e.target.value })}
              className="text-[11px] p-1 rounded border border-slate-200 w-1/2"
              title="من الساعة"
            />
            <span className="text-[10px] text-slate-400">-</span>
            <input
              type="time"
              value={cell?.to || ''}
              onChange={(e) => onCellChange({ ...cell, to: e.target.value })}
              className="text-[11px] p-1 rounded border border-slate-200 w-1/2"
              title="إلى الساعة"
            />
          </div>
        )}
      </div>
    );
  };

  // =========================================================================
  // Document Specific Renderers
  // =========================================================================

  // Simple Docs Renderer (matches 8 documents)
  const renderSimpleDocContent = () => {
    const spec = SIMPLE_DOCS_SPEC[docKey];
    if (!spec) return null;

    const fields = currentDocData.fields || {};
    const textareas = currentDocData.textareas || {};
    const table = currentDocData.table || Array.from({ length: spec.table?.rows || 6 }, () => ({}));

    return (
      <div className="space-y-6">
        {/* Intro / Refline */}
        {spec.intro && (
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs font-semibold text-emerald-950">
            {spec.intro}
          </div>
        )}
        {spec.refline && (
          <div className="p-3 rounded-xl bg-slate-100 text-xs text-slate-600 italic">
            {spec.refline}
          </div>
        )}

        {/* Form Fields */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <h3 className="text-sm font-bold text-slate-900 pb-3 mb-4 border-b border-slate-100">
            بيانات الوثيقة الرسمية
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {spec.fields.map((f: any) => (
              <div key={f.id} className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">
                  {f.label}
                </label>
                {renderSmartInput(f, fields[f.id], (val) => {
                  updateDoc((prev) => ({
                    ...prev,
                    fields: { ...(prev.fields || {}), [f.id]: val },
                  }));
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Textareas */}
        {spec.textareas && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              التفاصيل والملاحظات
            </h3>
            {spec.textareas.map((t: any) => (
              <div key={t.id} className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  {t.label}
                </label>
                <textarea
                  value={textareas[t.id] || ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateDoc((prev) => ({
                      ...prev,
                      textareas: { ...(prev.textareas || {}), [t.id]: v },
                    }));
                  }}
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}

        {/* Dynamic Table */}
        {spec.table && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {spec.table.label}
              </h3>
              <button
                onClick={() => {
                  updateDoc((prev) => {
                    const rows = [...(prev.table || [])];
                    rows.push({});
                    return { ...prev, table: rows };
                  });
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة سطر</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 text-center">
                    {spec.table.numbered && (
                      <th className="py-2.5 px-3 border-l border-slate-200 w-12">الرقم</th>
                    )}
                    {spec.table.columns.map((c: any) => (
                      <th key={c.id} className="py-2.5 px-3 border-l border-slate-200">
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {table.map((row: any, rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-slate-50">
                      {spec.table.numbered && (
                        <td className="py-2 px-3 text-center text-slate-500 font-semibold border-l border-slate-200">
                          {rIdx + 1}
                        </td>
                      )}
                      {spec.table.columns.map((c: any) => (
                        <td key={c.id} className="p-1 border-l border-slate-200">
                          {renderSmartInput(c, row[c.id], (val) => {
                            updateDoc((prev) => {
                              const rows = [...(prev.table || table)];
                              rows[rIdx] = { ...(rows[rIdx] || {}), [c.id]: val };
                              return { ...prev, table: rows };
                            });
                          })}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notes & Static Directives */}
        {spec.note && (
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 text-xs text-amber-900 leading-relaxed">
            {spec.note}
          </div>
        )}
        {spec.staticNotes && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-2">
            <h4 className="text-xs font-bold text-slate-800">تعليمات وضوابط ملزمة:</h4>
            <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-600 leading-relaxed pr-2">
              {spec.staticNotes.map((n: string, i: number) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Signatures */}
        {spec.signatures && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <h4 className="text-xs font-bold text-slate-500 mb-4 pb-2 border-b border-slate-100">
              أصحاب التوقيع والاعتماد
            </h4>
            <div className="flex flex-wrap items-center justify-around gap-6 pt-2">
              {spec.signatures.map((sig: string, idx: number) => (
                <div key={idx} className="text-center min-w-[160px]">
                  <div className="text-xs font-bold text-slate-900">{sig}</div>
                  <div className="mt-8 border-t border-slate-300 pt-1.5 text-[11px] text-slate-400">
                    الختم والتوقيع
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Specialized: Checklist Docs (pv_magasin, pv_sakanat)
  const renderChecklistDocContent = () => {
    const isMagasin = docKey === 'pv_magasin';
    const fields = currentDocData.fields || {};
    const items = currentDocData.items || {};
    const committee = currentDocData.committee || {};

    const magasinItems = [
      { id: 'clean', label: '1) نظافة المخزن وتنظيم المواد', options: ['جيدة', 'متوسطة', 'ناقصة', 'منعدمة'] },
      { id: 'cards', label: '2) بطاقات المخزون', options: ['موجودة ومتطابقة مع المخزن', 'موجودة وغير متطابقة مع المخزن', 'غير مستعملة'] },
      { id: 'cardsVisa', label: '3) تأشيرات بطاقات المخزون وترقيمها', options: ['مؤشرة ومرقمة', 'مؤشرة وغير مرقمة', 'غير مؤشرة ومرقمة', 'غير مؤشرة وغير مرقمة'] },
      { id: 'bons', label: '4) وصولات الخروج', options: ['مستعملة وممضاة', 'مستعملة وغير ممضاة', 'غير مستعملة'] },
      { id: 'magasinierVisa', label: '5) تأشير المخزني في وصولات الاستلام', options: ['موجودة', 'غير موجودة'] },
      { id: 'expiry', label: '6) تواريخ انتهاء الصلاحية', options: ['ظاهرة وملصقة أمام كل مادة', 'غير ظاهرة وغير ملصقة'] },
    ];

    const sakanatRooms = [
      'الغرفة 01 (نظافة وصيانة)',
      'الغرفة 02 (نظافة وصيانة)',
      'الغرفة 03 (نظافة وصيانة)',
      'غرفة الضيوف (نظافة وصيانة)',
      'المطبخ (نظافة وصيانة)',
      'لواحق السكن (الردهة والشرفة)',
    ];

    const sakanatCats = [
      { id: 'clean', label: 'النظافة', options: ['جيدة', 'متوسطة', 'ناقصة', 'منعدمة'] },
      { id: 'paint', label: 'الطلاء', options: ['جيدة', 'متوسطة', 'ناقصة', 'مهترئة'] },
      { id: 'maint', label: 'الصيانة', options: ['جيدة', 'متوسطة', 'ناقصة', 'غير صالحة'] },
    ];

    const committeeMembers = isMagasin
      ? ['المقتصد (ة)', 'المدير (ة)', 'المخزني (ة)']
      : ['المقتصد (ة)', 'المخزني (ة)', 'المعني (ة)'];

    return (
      <div className="space-y-6">
        {/* Inspection Details */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <h3 className="text-sm font-bold text-slate-900 pb-3 mb-4 border-b border-slate-100">
            بيانات محضر المعاينة
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">في يوم</label>
              {renderSmartInput({ type: 'weekday' }, fields.day, (v) => {
                updateDoc((prev) => ({ ...prev, fields: { ...(prev.fields || {}), day: v } }));
              })}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">بتاريخ</label>
              <input
                type="date"
                value={fields.date || ''}
                onChange={(e) => updateDoc((prev) => ({ ...prev, fields: { ...(prev.fields || {}), date: e.target.value } }))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">وعلى الساعة</label>
              <input
                type="time"
                value={fields.time || ''}
                onChange={(e) => updateDoc((prev) => ({ ...prev, fields: { ...(prev.fields || {}), time: e.target.value } }))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">قام السيد (ة)</label>
              <input
                type="text"
                value={fields.person1 || ''}
                onChange={(e) => updateDoc((prev) => ({ ...prev, fields: { ...(prev.fields || {}), person1: e.target.value } }))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">رفقة السيد (ة)</label>
              <input
                type="text"
                value={fields.person2 || ''}
                onChange={(e) => updateDoc((prev) => ({ ...prev, fields: { ...(prev.fields || {}), person2: e.target.value } }))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                {isMagasin ? 'بمعاينة المخزن رقم' : 'بمعاينة السكن رقم'}
              </label>
              <input
                type="text"
                value={isMagasin ? fields.storeNum || '' : fields.housingNum || ''}
                onChange={(e) => {
                  const k = isMagasin ? 'storeNum' : 'housingNum';
                  updateDoc((prev) => ({ ...prev, fields: { ...(prev.fields || {}), [k]: e.target.value } }));
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                {isMagasin ? 'الممسوك من طرف السيد (ة)' : 'المشغول من طرف السيد (ة)'}
              </label>
              <input
                type="text"
                value={isMagasin ? fields.keeper || '' : fields.occupant || ''}
                onChange={(e) => {
                  const k = isMagasin ? 'keeper' : 'occupant';
                  updateDoc((prev) => ({ ...prev, fields: { ...(prev.fields || {}), [k]: e.target.value } }));
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Magasin Check items */}
        {isMagasin && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              الملاحظات والنتائج المسجلة بالمخزن
            </h3>
            <div className="space-y-4">
              {magasinItems.map((item) => {
                const currentVal = items[item.id] || '';
                return (
                  <div key={item.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40">
                    <div className="text-xs font-bold text-slate-800 mb-2.5">{item.label}</div>
                    <div className="flex flex-wrap gap-4">
                      {item.options.map((opt) => (
                        <label key={opt} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name={`magasin_${item.id}`}
                            value={opt}
                            checked={currentVal === opt}
                            onChange={() => {
                              updateDoc((prev) => ({
                                ...prev,
                                items: { ...(prev.items || {}), [item.id]: opt },
                              }));
                            }}
                            className="text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sakanat Check items */}
        {!isMagasin && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              حالة غرف ومرافق السكن الوظيفي
            </h3>
            <div className="space-y-4">
              {sakanatRooms.map((room, rIdx) => (
                <div key={rIdx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 space-y-3">
                  <div className="text-xs font-bold text-emerald-950">
                    {rIdx + 1}) {room}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {sakanatCats.map((cat) => {
                      const itemKey = `r${rIdx}_${cat.id}`;
                      const currentVal = items[itemKey] || '';
                      return (
                        <div key={cat.id} className="space-y-1">
                          <span className="text-[11px] font-bold text-slate-500">{cat.label}:</span>
                          <select
                            value={currentVal}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateDoc((prev) => ({
                                ...prev,
                                items: { ...(prev.items || {}), [itemKey]: val },
                              }));
                            }}
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white"
                          >
                            <option value="">— الحالة —</option>
                            {cat.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* General notes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-2">
          <h4 className="text-xs font-bold text-slate-800">ملاحظات عامة وتوصيات المعاينة</h4>
          <textarea
            value={currentDocData.notes || ''}
            onChange={(e) => updateDoc((prev) => ({ ...prev, notes: e.target.value }))}
            rows={3}
            placeholder="تدوين أي توصيات أو ملاحظات فنية ملزمة..."
            className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
          />
        </div>

        {/* Committee */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 pb-2 border-b border-slate-100">
            أعضاء اللجنة المكلفة بالمعاينة
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {committeeMembers.map((role) => (
              <div key={role} className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 block">{role}</label>
                <input
                  type="text"
                  value={committee[role] || ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateDoc((prev) => ({
                      ...prev,
                      committee: { ...(prev.committee || {}), [role]: v },
                    }));
                  }}
                  placeholder="الاسم واللقب..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Specialized: Taskhir (تسخير العمال)
  const renderTaskhirContent = () => {
    const fields = currentDocData.fields || {};
    const selected = currentDocData.selected || {};
    const tasks = currentDocData.tasks || [''];

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            بيانات أمر التسخير
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">اليوم</label>
              <input
                type="date"
                value={fields.day || ''}
                onChange={(e) => updateDoc((prev) => ({ ...prev, fields: { ...(prev.fields || {}), day: e.target.value } }))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">على الساعة</label>
              <input
                type="time"
                value={fields.time || ''}
                onChange={(e) => updateDoc((prev) => ({ ...prev, fields: { ...(prev.fields || {}), time: e.target.value } }))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">السبب والغرض</label>
              <input
                type="text"
                value={fields.reason || 'أعمال استثنائية مستعجلة'}
                onChange={(e) => updateDoc((prev) => ({ ...prev, fields: { ...(prev.fields || {}), reason: e.target.value } }))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Workers Selection */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            تحديد العمال المسخرين
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2 px-3 w-12 text-center">تحديد</th>
                  <th className="py-2 px-3">الاسم واللقب</th>
                  <th className="py-2 px-3">الوظيفة / الرتبة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.workers.map((w) => {
                  const isChecked = !!selected[w.id];
                  return (
                    <tr key={w.id} className={isChecked ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const c = e.target.checked;
                            updateDoc((prev) => ({
                              ...prev,
                              selected: { ...(prev.selected || {}), [w.id]: c },
                            }));
                          }}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900">{w.name}</td>
                      <td className="py-2 px-3 text-slate-600">{w.job}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">الأعمال الاستثنائية الموكلة</h3>
            <button
              onClick={() => {
                updateDoc((prev) => {
                  const t = [...(prev.tasks || [])];
                  t.push('');
                  return { ...prev, tasks: t };
                });
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة عمل</span>
            </button>
          </div>
          <div className="space-y-2">
            {tasks.map((task: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}/</span>
                <input
                  type="text"
                  value={task}
                  onChange={(e) => {
                    const v = e.target.value;
                    updateDoc((prev) => {
                      const t = [...(prev.tasks || tasks)];
                      t[idx] = v;
                      return { ...prev, tasks: t };
                    });
                  }}
                  placeholder="وصف العمل المستعجل..."
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                />
                <button
                  onClick={() => {
                    updateDoc((prev) => {
                      const t = [...(prev.tasks || tasks)];
                      t.splice(idx, 1);
                      return { ...prev, tasks: t };
                    });
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Specialized: Arqam Hawatif (أرقام هواتف العمال)
  const renderArqamHawatifContent = () => {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
          دليل الاتصال بأرقام هواتف العمال
        </h3>
        <p className="text-xs text-slate-500">
          يتم مزامنة أرقام الهواتف مباشرة مع السجل المركزي للعمال.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3 w-12 text-center">الرقم</th>
                <th className="py-2.5 px-3">الاسم واللقب</th>
                <th className="py-2.5 px-3">الوظيفة / الرتبة</th>
                <th className="py-2.5 px-3 min-w-[180px]">رقم الهاتف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.workers.map((w, idx) => (
                <tr key={w.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 text-center text-slate-500 font-semibold">{idx + 1}</td>
                  <td className="py-2 px-3 font-bold text-slate-900">{w.name}</td>
                  <td className="py-2 px-3 text-slate-600">{w.job}</td>
                  <td className="p-1">
                    <input
                      type="tel"
                      value={w.phone || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const updatedWorkers = data.workers.map((x) =>
                          x.id === w.id ? { ...x, phone: val } : x
                        );
                        data.workers = updatedWorkers;
                        updateDoc((prev) => ({ ...prev }));
                      }}
                      placeholder="06.XX.XX.XX.XX"
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 font-mono text-center"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Specialized: Barnamij Fardi (البرنامج الفردي للعمال)
  const renderBarnamijFardiContent = () => {
    const selectedWorker = currentDocData.selectedWorker || (data.workers[0] ? data.workers[0].id : '');
    const rows = currentDocData.rows || {};
    const currentRec = rows[selectedWorker] || { tasks: '', schedule: {} };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <h3 className="text-sm font-bold text-slate-900 pb-3 mb-4 border-b border-slate-100">
            اختيار العامل والمهام المسندة
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">العامل المعني</label>
              <select
                value={selectedWorker}
                onChange={(e) => {
                  const wid = e.target.value;
                  updateDoc((prev) => ({ ...prev, selectedWorker: wid }));
                }}
                className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                {data.workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} — {w.job}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">المهام المسندة</label>
              <textarea
                value={currentRec.tasks || ''}
                onChange={(e) => {
                  const v = e.target.value;
                  updateDoc((prev) => {
                    const r = { ...(prev.rows || {}) };
                    r[selectedWorker] = { ...(r[selectedWorker] || {}), tasks: v };
                    return { ...prev, rows: r };
                  });
                }}
                rows={2}
                placeholder="تنظيف الجناح التربوي، تفقد القاعات..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            التوقيت الأسبوعي والمداومة
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  {WEEK_SCHEDULE_DAYS.map((d) => (
                    <th key={d.id} className="py-2.5 px-3 border-l border-slate-200 min-w-[130px]">
                      {d.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {WEEK_SCHEDULE_DAYS.map((d) => {
                    const cell = currentRec.schedule?.[d.id];
                    return (
                      <td key={d.id} className="p-2 border-l border-slate-200 bg-slate-50/50">
                        {renderShiftCell(cell, (upd) => {
                          updateDoc((prev) => {
                            const r = { ...(prev.rows || {}) };
                            const sched = { ...(r[selectedWorker]?.schedule || {}) };
                            sched[d.id] = upd;
                            r[selectedWorker] = { ...(r[selectedWorker] || {}), schedule: sched };
                            return { ...prev, rows: r };
                          });
                        })}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Specialized: Barnamij Sanawi (البرنامج السنوي للعمال)
  const renderBarnamijSanawiContent = () => {
    const periodFrom = currentDocData.periodFrom || '';
    const periodTo = currentDocData.periodTo || '';
    const rows = currentDocData.rows || {};

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <h3 className="text-sm font-bold text-slate-900 pb-3 mb-4 border-b border-slate-100">
            الفترة الزمنية للبرنامج
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">للفترة الممتدة من</label>
              <input
                type="date"
                value={periodFrom}
                onChange={(e) => updateDoc((prev) => ({ ...prev, periodFrom: e.target.value }))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">إلى غاية</label>
              <input
                type="date"
                value={periodTo}
                onChange={(e) => updateDoc((prev) => ({ ...prev, periodTo: e.target.value }))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Global Workers Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            جدول توزيع المهام السنوي الجماعي
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 w-10 border-l border-slate-200">ر.ت</th>
                  <th className="py-2.5 px-3 border-l border-slate-200 text-right min-w-[130px]">الاسم واللقب</th>
                  <th className="py-2.5 px-3 border-l border-slate-200 text-right min-w-[120px]">الوظيفة</th>
                  {WEEK_SCHEDULE_DAYS.map((d) => (
                    <th key={d.id} className="py-2.5 px-2 border-l border-slate-200 min-w-[120px]">
                      {d.label}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 min-w-[160px]">الأعمال الموكلة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.workers.map((w, idx) => {
                  const rec = rows[w.id] || { tasks: '', schedule: {} };
                  return (
                    <tr key={w.id} className="hover:bg-slate-50">
                      <td className="py-2 px-2 text-center text-slate-500 font-semibold border-l border-slate-200">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900 border-l border-slate-200 text-right">
                        {w.name}
                      </td>
                      <td className="py-2 px-3 text-slate-600 border-l border-slate-200 text-right">
                        {w.job}
                      </td>
                      {WEEK_SCHEDULE_DAYS.map((d) => {
                        const cell = rec.schedule?.[d.id];
                        return (
                          <td key={d.id} className="p-1 border-l border-slate-200 bg-slate-50/40">
                            {renderShiftCell(cell, (upd) => {
                              updateDoc((prev) => {
                                const r = { ...(prev.rows || {}) };
                                const sched = { ...(r[w.id]?.schedule || {}) };
                                sched[d.id] = upd;
                                r[w.id] = { ...(r[w.id] || {}), schedule: sched };
                                return { ...prev, rows: r };
                              });
                            })}
                          </td>
                        );
                      })}
                      <td className="p-1.5">
                        <textarea
                          value={rec.tasks || ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            updateDoc((prev) => {
                              const r = { ...(prev.rows || {}) };
                              r[w.id] = { ...(r[w.id] || {}), tasks: v };
                              return { ...prev, rows: r };
                            });
                          }}
                          rows={2}
                          placeholder="المهام..."
                          className="w-full text-xs p-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Specialized: Jadwal Ghiyabat (جدول الغيابات)
  const renderJadwalGhiyabatContent = () => {
    const cells = currentDocData.cells || {};
    const daysCount = 31;

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              جدول متابعة الغيابات الشهري ({data.meta.monthName} {data.meta.year})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ط غ = طلب غياب &nbsp;|&nbsp; غ غ م = غياب غير مبرر &nbsp;|&nbsp; ط ت = طلب تعويض
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                <th rowSpan={2} className="py-2 px-3 border-l border-slate-200 w-16">
                  اليوم
                </th>
                {data.workers.map((w) => (
                  <th key={w.id} colSpan={3} className="py-1.5 px-2 border-l border-slate-200 min-w-[120px]">
                    {w.name}
                  </th>
                ))}
              </tr>
              <tr className="bg-slate-50 text-[10px] font-semibold border-b border-slate-200">
                {data.workers.map((w) => (
                  <React.Fragment key={w.id}>
                    <th className="py-1 border-l border-slate-200">ط.غ</th>
                    <th className="py-1 border-l border-slate-200 text-rose-700">غ.م</th>
                    <th className="py-1 border-l border-slate-200 text-teal-700">ط.ت</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Array.from({ length: daysCount }, (_, i) => i + 1).map((d) => (
                <tr key={d} className="hover:bg-slate-50">
                  <td className="py-1.5 px-2 font-bold text-slate-700 border-l border-slate-200 bg-slate-50/60">
                    {d}
                  </td>
                  {data.workers.map((w) => {
                    const k = `${d}_${w.id}`;
                    const c = cells[k] || { tg: false, ggm: false, tt: false };
                    return (
                      <React.Fragment key={w.id}>
                        <td className="p-1 border-l border-slate-200">
                          <input
                            type="checkbox"
                            checked={!!c.tg}
                            onChange={(e) => {
                              const v = e.target.checked;
                              updateDoc((prev) => {
                                const cs = { ...(prev.cells || {}) };
                                cs[k] = { ...(cs[k] || {}), tg: v };
                                return { ...prev, cells: cs };
                              });
                            }}
                            className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="p-1 border-l border-slate-200 bg-rose-50/20">
                          <input
                            type="checkbox"
                            checked={!!c.ggm}
                            onChange={(e) => {
                              const v = e.target.checked;
                              updateDoc((prev) => {
                                const cs = { ...(prev.cells || {}) };
                                cs[k] = { ...(cs[k] || {}), ggm: v };
                                return { ...prev, cells: cs };
                              });
                            }}
                            className="rounded text-rose-600 focus:ring-0 cursor-pointer"
                          />
                        </td>
                        <td className="p-1 border-l border-slate-200 bg-teal-50/20">
                          <input
                            type="checkbox"
                            checked={!!c.tt}
                            onChange={(e) => {
                              const v = e.target.checked;
                              updateDoc((prev) => {
                                const cs = { ...(prev.cells || {}) };
                                cs[k] = { ...(cs[k] || {}), tt: v };
                                return { ...prev, cells: cs };
                              });
                            }}
                            className="rounded text-teal-600 focus:ring-0 cursor-pointer"
                          />
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Specialized: Kashf Hudur (كشف الحضور اليومي للعمال)
  const renderKashfHudurContent = () => {
    const date = currentDocData.date || '';
    const rows = currentDocData.rows || {};

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <h3 className="text-sm font-bold text-slate-900 pb-3 mb-4 border-b border-slate-100">
            تاريخ كشف الحضور
          </h3>
          <div className="max-w-xs">
            <label className="text-xs font-semibold text-slate-600 block mb-1">ليوم</label>
            <input
              type="date"
              value={date}
              onChange={(e) => updateDoc((prev) => ({ ...prev, date: e.target.value }))}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            كشف الحضور اليومي للعمال المهنيين
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-center">
                  <th className="py-2.5 px-3 w-10 border-l border-slate-200">الرقم</th>
                  <th className="py-2.5 px-3 border-l border-slate-200 text-right">اللقب والاسم</th>
                  <th className="py-2.5 px-3 border-l border-slate-200 text-right">الوظيفة</th>
                  <th className="py-2.5 px-2 border-l border-slate-200 w-28">توقيت الدخول</th>
                  <th className="py-2.5 px-2 border-l border-slate-200 w-28">خروج (من)</th>
                  <th className="py-2.5 px-2 border-l border-slate-200 w-28">رجوع (إلى)</th>
                  <th className="py-2.5 px-2 border-l border-slate-200 w-28">توقيت الخروج</th>
                  <th className="py-2.5 px-3 w-28 text-center">الإمضاء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.workers.map((w, idx) => {
                  const rec = rows[w.id] || { inT: '', outFrom: '', outTo: '', outT: '' };
                  return (
                    <tr key={w.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-center text-slate-500 font-semibold border-l border-slate-200">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900 border-l border-slate-200">
                        {w.name}
                      </td>
                      <td className="py-2 px-3 text-slate-600 border-l border-slate-200">
                        {w.job}
                      </td>
                      <td className="p-1 border-l border-slate-200">
                        <input
                          type="time"
                          value={rec.inT || ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            updateDoc((prev) => {
                              const r = { ...(prev.rows || {}) };
                              r[w.id] = { ...(r[w.id] || {}), inT: v };
                              return { ...prev, rows: r };
                            });
                          }}
                          className="w-full text-xs text-center p-1.5 rounded border border-slate-200"
                        />
                      </td>
                      <td className="p-1 border-l border-slate-200">
                        <input
                          type="time"
                          value={rec.outFrom || ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            updateDoc((prev) => {
                              const r = { ...(prev.rows || {}) };
                              r[w.id] = { ...(r[w.id] || {}), outFrom: v };
                              return { ...prev, rows: r };
                            });
                          }}
                          className="w-full text-xs text-center p-1.5 rounded border border-slate-200"
                        />
                      </td>
                      <td className="p-1 border-l border-slate-200">
                        <input
                          type="time"
                          value={rec.outTo || ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            updateDoc((prev) => {
                              const r = { ...(prev.rows || {}) };
                              r[w.id] = { ...(r[w.id] || {}), outTo: v };
                              return { ...prev, rows: r };
                            });
                          }}
                          className="w-full text-xs text-center p-1.5 rounded border border-slate-200"
                        />
                      </td>
                      <td className="p-1 border-l border-slate-200">
                        <input
                          type="time"
                          value={rec.outT || ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            updateDoc((prev) => {
                              const r = { ...(prev.rows || {}) };
                              r[w.id] = { ...(r[w.id] || {}), outT: v };
                              return { ...prev, rows: r };
                            });
                          }}
                          className="w-full text-xs text-center p-1.5 rounded border border-slate-200"
                        />
                      </td>
                      <td className="py-2 px-3 text-center text-[11px] text-slate-400 font-medium">
                        توقيع يدوي
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Specialized: Wathiqat Istilam Hurras (استلام المهام بين الحراس)
  const renderIstilamHurrasContent = () => {
    const rows = currentDocData.rows || [{ date: '', dayGuard: '', nightGuard: '', notes: '' }];

    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">سجل استلام وتسليم المهام بين الحراس</h3>
          <button
            onClick={() => {
              updateDoc((prev) => {
                const r = [...(prev.rows || rows)];
                r.push({ date: '', dayGuard: '', nightGuard: '', notes: '' });
                return { ...prev, rows: r };
              });
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة وردية</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3 border-l border-slate-200 w-36">التاريخ</th>
                <th className="py-2.5 px-3 border-l border-slate-200">حارس الصباح (المستلم)</th>
                <th className="py-2.5 px-2 border-l border-slate-200 w-24 text-center">إمضاء</th>
                <th className="py-2.5 px-3 border-l border-slate-200">حارس الليل (المسلم)</th>
                <th className="py-2.5 px-2 border-l border-slate-200 w-24 text-center">إمضاء</th>
                <th className="py-2.5 px-3 border-l border-slate-200">الملاحظات</th>
                <th className="py-2.5 px-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-1 border-l border-slate-200">
                    <input
                      type="date"
                      value={row.date || ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateDoc((prev) => {
                          const r = [...(prev.rows || rows)];
                          r[idx] = { ...r[idx], date: v };
                          return { ...prev, rows: r };
                        });
                      }}
                      className="w-full text-xs p-1.5 rounded border border-slate-200"
                    />
                  </td>
                  <td className="p-1 border-l border-slate-200">
                    <input
                      type="text"
                      value={row.dayGuard || ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateDoc((prev) => {
                          const r = [...(prev.rows || rows)];
                          r[idx] = { ...r[idx], dayGuard: v };
                          return { ...prev, rows: r };
                        });
                      }}
                      placeholder="اسم حارس الصباح"
                      className="w-full text-xs p-1.5 rounded border border-slate-200"
                    />
                  </td>
                  <td className="py-2 px-2 text-center text-[11px] text-slate-400 border-l border-slate-200">
                    توقيع
                  </td>
                  <td className="p-1 border-l border-slate-200">
                    <input
                      type="text"
                      value={row.nightGuard || ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateDoc((prev) => {
                          const r = [...(prev.rows || rows)];
                          r[idx] = { ...r[idx], nightGuard: v };
                          return { ...prev, rows: r };
                        });
                      }}
                      placeholder="اسم حارس الليل"
                      className="w-full text-xs p-1.5 rounded border border-slate-200"
                    />
                  </td>
                  <td className="py-2 px-2 text-center text-[11px] text-slate-400 border-l border-slate-200">
                    توقيع
                  </td>
                  <td className="p-1 border-l border-slate-200">
                    <input
                      type="text"
                      value={row.notes || ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        updateDoc((prev) => {
                          const r = [...(prev.rows || rows)];
                          r[idx] = { ...r[idx], notes: v };
                          return { ...prev, rows: r };
                        });
                      }}
                      placeholder="حالة الأقفال والمحلات..."
                      className="w-full text-xs p-1.5 rounded border border-slate-200"
                    />
                  </td>
                  <td className="p-1 text-center">
                    <button
                      onClick={() => {
                        updateDoc((prev) => {
                          const r = [...(prev.rows || rows)];
                          r.splice(idx, 1);
                          return { ...prev, rows: r };
                        });
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Specialized: Taqrir Khidma Dakhiliya & Taqrir Qayim
  const renderReportsContent = () => {
    if (docKey === 'taqrir_khidma_dakhiliya') {
      const sections = currentDocData.sections || {};
      const lateRows = currentDocData.lateRows || [];
      const secs = [
        { id: 'clean', label: '1) النظافة العامة' },
        { id: 'light', label: '2) شبكة الإنارة والكهرباء' },
        { id: 'heat', label: '3) شبكة التدفئة والغاز' },
        { id: 'damage', label: '4) الإتلافات والأعطال المسجلة' },
        { id: 'security', label: '5) الحالة الأمنية العامة للمؤسسة' },
      ];

      return (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <h3 className="text-sm font-bold text-slate-900 pb-3 mb-4 border-b border-slate-100">
              تاريخ التقرير وحالة المحلات
            </h3>
            <div className="max-w-xs mb-4">
              <label className="text-xs font-semibold text-slate-600 block mb-1">التاريخ</label>
              <input
                type="date"
                value={currentDocData.date || ''}
                onChange={(e) => updateDoc((prev) => ({ ...prev, date: e.target.value }))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <div className="space-y-3">
              {secs.map((s) => (
                <div key={s.id}>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{s.label}</label>
                  <textarea
                    value={sections[s.id] || ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateDoc((prev) => ({
                        ...prev,
                        sections: { ...(prev.sections || {}), [s.id]: v },
                      }));
                    }}
                    rows={2}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Late staff */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">التأخرات المسجلة اليوم</h3>
              <button
                onClick={() => {
                  updateDoc((prev) => {
                    const l = [...(prev.lateRows || lateRows)];
                    l.push({ name: '', job: '' });
                    return { ...prev, lateRows: l };
                  });
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة</span>
              </button>
            </div>
            <div className="space-y-2">
              {lateRows.map((r: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={r.name || ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateDoc((prev) => {
                        const l = [...(prev.lateRows || lateRows)];
                        l[idx] = { ...l[idx], name: v };
                        return { ...prev, lateRows: l };
                      });
                    }}
                    placeholder="اللقب والاسم..."
                    className="flex-1 text-xs p-2 rounded-xl border border-slate-200"
                  />
                  <input
                    type="text"
                    value={r.job || ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      updateDoc((prev) => {
                        const l = [...(prev.lateRows || lateRows)];
                        l[idx] = { ...l[idx], job: v };
                        return { ...prev, lateRows: l };
                      });
                    }}
                    placeholder="الوظيفة..."
                    className="flex-1 text-xs p-2 rounded-xl border border-slate-200"
                  />
                  <button
                    onClick={() => {
                      updateDoc((prev) => {
                        const l = [...(prev.lateRows || lateRows)];
                        l.splice(idx, 1);
                        return { ...prev, lateRows: l };
                      });
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-2">
            <h4 className="text-xs font-bold text-slate-800">الأعمال المستعجلة المطلوبة</h4>
            <textarea
              value={currentDocData.urgent || ''}
              onChange={(e) => updateDoc((prev) => ({ ...prev, urgent: e.target.value }))}
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-2">
            <h4 className="text-xs font-bold text-slate-800">مسؤول الخدمة الداخلية (ملاحظات وتوقيع)</h4>
            <textarea
              value={currentDocData.signature || ''}
              onChange={(e) => updateDoc((prev) => ({ ...prev, signature: e.target.value }))}
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>
        </div>
      );
    }

    if (docKey === 'taqrir_qayim') {
      return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
            تقرير القيم اليومي
          </h3>
          <div className="max-w-xs">
            <label className="text-xs font-semibold text-slate-600 block mb-1">التاريخ</label>
            <input
              type="date"
              value={currentDocData.date || ''}
              onChange={(e) => updateDoc((prev) => ({ ...prev, date: e.target.value }))}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">الأعمال المنجزة</label>
            <textarea
              value={currentDocData.done || ''}
              onChange={(e) => updateDoc((prev) => ({ ...prev, done: e.target.value }))}
              rows={3}
              placeholder="إصلاح مصابيح، صيانة أنابيب..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">المواد المستعملة</label>
            <textarea
              value={currentDocData.materials || ''}
              onChange={(e) => updateDoc((prev) => ({ ...prev, materials: e.target.value }))}
              rows={3}
              placeholder="مصابيح، حنفيات، كوابل..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">ملاحظات مختلفة</label>
            <textarea
              value={currentDocData.notes || ''}
              onChange={(e) => updateDoc((prev) => ({ ...prev, notes: e.target.value }))}
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">القيم (ملاحظات وتوقيع)</label>
            <textarea
              value={currentDocData.signature || ''}
              onChange={(e) => updateDoc((prev) => ({ ...prev, signature: e.target.value }))}
              rows={2}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
            />
          </div>
        </div>
      );
    }

    return null;
  };

  // Switch between doc types
  const renderMainContent = () => {
    if (SIMPLE_DOCS_SPEC[docKey]) return renderSimpleDocContent();
    if (docKey === 'pv_magasin' || docKey === 'pv_sakanat') return renderChecklistDocContent();
    if (docKey === 'taskhir') return renderTaskhirContent();
    if (docKey === 'arqam_hawatif') return renderArqamHawatifContent();
    if (docKey === 'barnamij_fardi') return renderBarnamijFardiContent();
    if (docKey === 'barnamij_sanawi') return renderBarnamijSanawiContent();
    if (docKey === 'jadwal_ghiyabat') return renderJadwalGhiyabatContent();
    if (docKey === 'kashf_hudur') return renderKashfHudurContent();
    if (docKey === 'wathiqat_istilam_hurras') return renderIstilamHurrasContent();
    if (docKey === 'taqrir_khidma_dakhiliya' || docKey === 'taqrir_qayim') return renderReportsContent();

    return (
      <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
        هذه الوثيقة جاهزة للطباعة والتسجيل
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top action header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 mb-1.5 cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>الرجوع لدليل الوثائق</span>
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">{docInfo.title}</h2>
            {docInfo.subtitleFr && (
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                • {docInfo.subtitleFr}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{docInfo.group}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onPrintDoc(docKey, false)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>معاينة وطباعة</span>
          </button>
          <button
            onClick={() => onPrintDoc(docKey, true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <span>طباعة فارغة</span>
          </button>
        </div>
      </div>

      {/* Main Form Fields Content */}
      {renderMainContent()}

      {/* Sijill Al-Watha'iq (سجل الوثائق الصادرة والمملوءة) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4 transition-colors">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Archive className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            سجل الوثائق الصادرة والمملوءة
          </h3>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            (أرشفة الوثائق المسلمة مع الاسم وتاريخ الطلب)
          </span>
        </div>

        {/* Add entry form */}
        <div className="flex flex-wrap items-end gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <div className="flex-1 min-w-[200px] space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">
              الاسم واللقب (المستفيد / صاحب الوثيقة)
            </label>
            <input
              type="text"
              value={newRegName}
              onChange={(e) => setNewRegName(e.target.value)}
              placeholder="مثال: فرحات توفيق"
              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <div className="w-40 space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">تاريخ الإصدار / الطلب</label>
            <input
              type="date"
              value={newRegDate}
              onChange={(e) => setNewRegDate(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
          <button
            onClick={handleAddRegistryEntry}
            disabled={!newRegName.trim()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تسجيل في الأرشيف</span>
          </button>
        </div>

        {/* Registry Table */}
        {currentRegistry.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2.5 px-3 w-12 text-center">الرقم</th>
                  <th className="py-2.5 px-3">الاسم واللقب</th>
                  <th className="py-2.5 px-3 w-40">تاريخ الطلب / الإصدار</th>
                  <th className="py-2.5 px-2 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {currentRegistry.map((reg, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2 px-3 text-center text-slate-500 dark:text-slate-400 font-semibold">{idx + 1}</td>
                    <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">{reg.name}</td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-300 font-mono">{reg.date}</td>
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => handleDeleteRegistryEntry(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded cursor-pointer"
                        title="حذف من السجل"
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
          <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-400 dark:text-slate-500">
            لا توجد وثائق مسجلة بعد في أرشيف هذه الوثيقة.
          </div>
        )}
      </div>

      {/* Floating Save bar */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 dark:border-slate-800 flex items-center gap-4 no-print">
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>حفظ الوثيقة الآن</span>
        </button>
        {lastSavedText && (
          <span className="text-[11px] text-slate-300 font-medium hidden sm:inline">
            {lastSavedText}
          </span>
        )}
      </div>
    </div>
  );
};
