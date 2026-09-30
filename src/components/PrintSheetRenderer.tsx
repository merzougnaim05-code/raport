import React from 'react';
import { AppData, DayReportData, ShiftCellData } from '../types';
import { Letterhead } from './Letterhead';
import { CATEGORIES, WEEK_SCHEDULE_DAYS } from '../data/initialData';
import { getWeekdayName as resolveWeekday } from '../utils/dateUtils';
import { DOC_LIST, SIMPLE_DOCS_SPEC } from '../data/documentsConfig';

interface PrintSheetRendererProps {
  type: 'day' | 'workers' | 'doc';
  data: AppData;
  dayNum?: number;
  docKey?: string;
  blank?: boolean;
}

export const PrintSheetRenderer: React.FC<PrintSheetRendererProps> = ({
  type,
  data,
  dayNum = 1,
  docKey = '',
  blank = false,
}) => {
  const meta = data.meta;

  // Format shift cells
  const formatShiftCell = (cell?: ShiftCellData) => {
    if (!cell) return '';
    if (cell.mode === 'راحة') return 'راحة';
    if (cell.from || cell.to) return `${cell.from || ''} - ${cell.to || ''}`;
    return cell.mode || '';
  };

  // Helper to get weekday name (shared util: handles school-year + current month correctly)
  const getWeekdayName = (n: number) => resolveWeekday(n, meta);

  // =========================================================================
  // 1. DAY REPORT PRINT
  // =========================================================================
  if (type === 'day') {
    const realDay = data.days[dayNum] || {
      headcount: {},
      meals: {
        breakfast: { planned: '', served: '' },
        lunch: { planned: '', served: '' },
        dinner: { planned: '', served: '' },
      },
      workerStatus: {},
      attendance: [],
      facilitiesStatus: '',
      worksDone: '',
      worksUrgent: '',
      notesEconomist: '',
      notesDirector: '',
      signedAt: '',
    };

    const day = blank
      ? {
          headcount: {},
          meals: {
            breakfast: { planned: '', served: '' },
            lunch: { planned: '', served: '' },
            dinner: { planned: '', served: '' },
          },
          workerStatus: {},
          attendance: [],
          facilitiesStatus: '',
          worksDone: '',
          worksUrgent: '',
          notesEconomist: '',
          notesDirector: '',
          signedAt: '',
        }
      : realDay;

    const weekday = getWeekdayName(dayNum);
    const dateLabel = `يوم ${weekday || ''} — ${dayNum} ${meta.monthName} ${meta.year}`;

    // Calculate totals
    const totals = {
      b_reg: 0,
      b_pres: 0,
      l_reg: 0,
      l_pres: 0,
      d_reg: 0,
      d_pres: 0,
    };

    CATEGORIES.forEach((cat) => {
      const c: any = day.headcount?.[cat.key] || {};
      totals.b_reg += Number(c.b_reg) || 0;
      totals.b_pres += Number(c.b_pres) || 0;
      totals.l_reg += Number(c.l_reg) || 0;
      totals.l_pres += Number(c.l_pres) || 0;
      totals.d_reg += Number(c.d_reg) || 0;
      totals.d_pres += Number(c.d_pres) || 0;
    });

    const attendanceRows =
      day.attendance && day.attendance.length > 0
        ? day.attendance
        : Array.from({ length: 3 }, () => ({ name: '', duration: '', reason: '', notes: '' }));

    return (
      <div className="space-y-4 text-slate-900 leading-normal font-sans" dir="rtl">
        <Letterhead
          meta={meta}
          title="التقرير اليومي للمصالح الاقتصادية"
          subtitle={blank ? 'نسخة رسمية فارغة' : dateLabel}
        />

        {/* Headcount Table */}
        <div>
          <div className="text-xs font-bold mb-1">أولاً: تعداد المستفيدين من الإطعام</div>
          <table className="w-full text-center text-[11px] border-collapse border border-black">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th rowSpan={2} className="border border-black p-1 text-right w-28">الفئة</th>
                <th colSpan={2} className="border border-black p-0.5">فطور الصباح</th>
                <th colSpan={2} className="border border-black p-0.5">وجبة الغداء</th>
                <th colSpan={2} className="border border-black p-0.5">وجبة العشاء</th>
              </tr>
              <tr className="bg-slate-50 font-semibold">
                <th className="border border-black p-0.5 w-14">مسجلون</th>
                <th className="border border-black p-0.5 w-14">حاضرون</th>
                <th className="border border-black p-0.5 w-14">مسجلون</th>
                <th className="border border-black p-0.5 w-14">حاضرون</th>
                <th className="border border-black p-0.5 w-14">مسجلون</th>
                <th className="border border-black p-0.5 w-14">حاضرون</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORIES.map((cat) => {
                const c: any = day.headcount?.[cat.key] || {};
                return (
                  <tr key={cat.key}>
                    <td className="border border-black p-1 font-bold text-right">{cat.label}</td>
                    <td className="border border-black p-1">{blank ? '' : c.b_reg || 0}</td>
                    <td className="border border-black p-1 font-semibold">{blank ? '' : c.b_pres || 0}</td>
                    <td className="border border-black p-1">{blank ? '' : c.l_reg || 0}</td>
                    <td className="border border-black p-1 font-semibold">{blank ? '' : c.l_pres || 0}</td>
                    <td className="border border-black p-1">{blank ? '' : c.d_reg || 0}</td>
                    <td className="border border-black p-1 font-semibold">{blank ? '' : c.d_pres || 0}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-200 font-bold">
                <td className="border border-black p-1 text-right">المجموع الكلي</td>
                <td className="border border-black p-1">{blank ? '' : totals.b_reg}</td>
                <td className="border border-black p-1">{blank ? '' : totals.b_pres}</td>
                <td className="border border-black p-1">{blank ? '' : totals.l_reg}</td>
                <td className="border border-black p-1">{blank ? '' : totals.l_pres}</td>
                <td className="border border-black p-1">{blank ? '' : totals.d_reg}</td>
                <td className="border border-black p-1">{blank ? '' : totals.d_pres}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Meals Table */}
        <div>
          <div className="text-xs font-bold mb-1">ثانيًا: الوجبات الغذائية المقررة والمقدمة</div>
          <table className="w-full text-right text-[11px] border-collapse border border-black">
            <thead>
              <tr className="bg-slate-100 font-bold text-center">
                <th className="border border-black p-1 w-24">الوجبة</th>
                <th className="border border-black p-1">الوجبة المقررة</th>
                <th className="border border-black p-1">الوجبة المقدمة فعليًا</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-1 font-bold text-center">فطور الصباح</td>
                <td className="border border-black p-1">{blank ? '' : day.meals?.breakfast?.planned}</td>
                <td className="border border-black p-1">{blank ? '' : day.meals?.breakfast?.served}</td>
              </tr>
              <tr>
                <td className="border border-black p-1 font-bold text-center">وجبة الغداء</td>
                <td className="border border-black p-1">{blank ? '' : day.meals?.lunch?.planned}</td>
                <td className="border border-black p-1">{blank ? '' : day.meals?.lunch?.served}</td>
              </tr>
              <tr>
                <td className="border border-black p-1 font-bold text-center">وجبة العشاء</td>
                <td className="border border-black p-1">{blank ? '' : day.meals?.dinner?.planned}</td>
                <td className="border border-black p-1">{blank ? '' : day.meals?.dinner?.served}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Worker daily presence table: only absentees are shown to fit one page */}
        <div>
          <div className="text-xs font-bold mb-1">ثالثًا: وضعية وحضور العمال المهنيين وموظفي الخدمات</div>
          {(() => {
            const isPresent = (s?: string) => !s || s === 'حاضر' || s === 'يوم كامل';
            if (!blank) {
              const absent = data.workers.filter((w) => !isPresent(day.workerStatus?.[w.id]));
              if (absent.length === 0) {
                return (
                  <div className="border border-black p-2 text-center text-xs font-bold">
                    لا يوجد غياب — جميع العمال حاضرون.
                  </div>
                );
              }
              return (
                <table className="w-full text-right text-[11px] border-collapse border border-black">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-center">
                      <th className="border border-black p-1 w-10">ر.ت</th>
                      <th className="border border-black p-1">الاسم واللقب</th>
                      <th className="border border-black p-1">الوظيفة / الرتبة</th>
                      <th className="border border-black p-1 w-44 text-center">الحالة اليومية</th>
                      <th className="border border-black p-1">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {absent.map((w, idx) => (
                      <tr key={w.id}>
                        <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                        <td className="border border-black p-1 font-semibold">{w.name}</td>
                        <td className="border border-black p-1">{w.job}</td>
                        <td className="border border-black p-1 text-center font-bold">
                          {day.workerStatus?.[w.id] || 'حاضر'}
                        </td>
                        <td className="border border-black p-1"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );
            }
            return (
              <table className="w-full text-right text-[11px] border-collapse border border-black">
                <thead>
                  <tr className="bg-slate-100 font-bold text-center">
                    <th className="border border-black p-1 w-10">ر.ت</th>
                    <th className="border border-black p-1">الاسم واللقب</th>
                    <th className="border border-black p-1">الوظيفة / الرتبة</th>
                    <th className="border border-black p-1 w-44 text-center">الحالة اليومية</th>
                    <th className="border border-black p-1">ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {data.workers.map((w, idx) => (
                    <tr key={w.id}>
                      <td className="border border-black p-1 text-center font-bold">{idx + 1}</td>
                      <td className="border border-black p-1 font-semibold">{w.name}</td>
                      <td className="border border-black p-1">{w.job}</td>
                      <td className="border border-black p-1 text-center font-bold"></td>
                      <td className="border border-black p-1"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          })()}
        </div>

        {/* Attendance & Irregularities */}
        <div>
          <div className="text-xs font-bold mb-1">رابعًا: سجل المواظبة (التغيبات والتأخرات)</div>
          <table className="w-full text-right text-[11px] border-collapse border border-black">
            <thead>
              <tr className="bg-slate-100 font-bold text-center">
                <th className="border border-black p-1 w-10">ر.ت</th>
                <th className="border border-black p-1 w-48">اللقب والاسم</th>
                <th className="border border-black p-1 w-24 text-center">المدة</th>
                <th className="border border-black p-1 w-48">المبرر</th>
                <th className="border border-black p-1">الملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRows.map((r: any, idx: number) => (
                <tr key={idx}>
                  <td className="border border-black p-1 text-center">{idx + 1}</td>
                  <td className="border border-black p-1">{blank ? '' : r.name}</td>
                  <td className="border border-black p-1 text-center">{blank ? '' : r.duration}</td>
                  <td className="border border-black p-1">{blank ? '' : r.reason}</td>
                  <td className="border border-black p-1">{blank ? '' : r.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Facilities & Works: each in its own frame */}
        <div className="text-[11px] space-y-1.5 pt-1">
          <div className="border border-black p-2">
            <b>الوضعية وحالة المحلات:</b> {blank ? '' : day.facilitiesStatus || 'المحلات في حالة حسنة.'}
          </div>
          <div className="flex gap-1.5">
            <div className="flex-1 border border-black p-2">
              <b>الأشغال المنجزة:</b> {blank ? '' : day.worksDone || '—'}
            </div>
            <div className="flex-1 border border-black p-2">
              <b>الأشغال المستعجلة:</b> {blank ? '' : day.worksUrgent || '—'}
            </div>
          </div>
          <div className="flex gap-1.5">
            <div className="flex-1 border border-black p-2">
              <b>ملاحظات المقتصد:</b> {blank ? '' : day.notesEconomist || 'سير عادي للخدمة.'}
            </div>
            <div className="flex-1 border border-black p-2">
              <b>ملاحظات وتأشيرة المدير:</b> {blank ? '' : day.notesDirector || '—'}
            </div>
          </div>
        </div>

        {/* Date and Signatures */}
        <div className="pt-2 text-[11px]">
          <div className="text-left">
            <b>حرر بـ:</b> {blank ? '............................... في ...............................' : day.signedAt || `بـ ${meta.municipality} في ${dayNum} ${meta.monthName} ${meta.year}`}
          </div>
          <div className="flex justify-around items-start text-center mt-6">
            <div className="w-48">
              <div className="font-bold text-xs">مقتصد المؤسسة</div>
              <div className="text-[11px] text-slate-700 mt-1">{meta.economistName || ''}</div>
              <div className="h-14 mt-1 border-b border-dotted border-black"></div>
            </div>
            <div className="w-48">
              <div className="font-bold text-xs">مدير المؤسسة</div>
              <div className="text-[11px] text-slate-700 mt-1">{meta.directorName || ''}</div>
              <div className="h-14 mt-1 border-b border-dotted border-black"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. WORKERS DIRECTORY PRINT
  // =========================================================================
  if (type === 'workers') {
    return (
      <div className="space-y-4 text-slate-900 leading-normal font-sans" dir="rtl">
        <Letterhead meta={meta} title="القائمة الرسمية للعمال والموظفين" subtitle={`للسنة الدراسية ${meta.year}`} />
        <table className="w-full text-right text-xs border-collapse border border-black">
          <thead>
            <tr className="bg-slate-100 font-bold text-center">
              <th className="border border-black p-2 w-12">الرقم</th>
              <th className="border border-black p-2 text-right">الاسم واللقب</th>
              <th className="border border-black p-2 text-right">الوظيفة / الرتبة</th>
              <th className="border border-black p-2 text-center w-40">رقم الهاتف</th>
            </tr>
          </thead>
          <tbody>
            {data.workers.map((w, idx) => (
              <tr key={w.id}>
                <td className="border border-black p-2 text-center font-bold">{idx + 1}</td>
                <td className="border border-black p-2 font-bold">{w.name}</td>
                <td className="border border-black p-2">{w.job}</td>
                <td className="border border-black p-2 text-center font-mono">{w.phone || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-around items-start text-center mt-12 text-xs font-bold">
          <div>المقتصد<div className="h-16 w-36 border-b border-dotted border-black mt-2" /></div>
          <div>المدير<div className="h-16 w-36 border-b border-dotted border-black mt-2" /></div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. ADMINISTRATIVE DOCUMENTS (ALL 19 PRESERVED EXACTLY)
  // =========================================================================
  const docMeta = DOC_LIST.find((d) => d.key === docKey) || { key: docKey, title: 'وثيقة رسمية', group: 'التقارير' };
  const rawDocData = data.docs[docKey] || {};
  const currentDoc = blank ? {} : rawDocData;

  // Simple Docs spec printing
  if (SIMPLE_DOCS_SPEC[docKey]) {
    const spec = SIMPLE_DOCS_SPEC[docKey];
    const fields = currentDoc.fields || {};
    const textareas = currentDoc.textareas || {};
    const tableRows = currentDoc.table || Array.from({ length: spec.table?.rows || 6 }, () => ({}));

    return (
      <div className="space-y-4 text-slate-900 leading-normal font-sans" dir="rtl">
        <Letterhead
          meta={meta}
          title={spec.title}
          subtitleFr={spec.subtitleFr}
          refline={spec.refline}
          subtitle={blank ? 'نسخة رسمية فارغة' : ''}
        />

        {spec.intro && (
          <p className="text-xs font-semibold leading-relaxed mb-2">{spec.intro}</p>
        )}

        {/* Fields list */}
        <table className="w-full text-right text-xs border-collapse border border-black mb-3">
          <tbody>
            {spec.fields.map((f: any) => (
              <tr key={f.id}>
                <th className="border border-black p-2 bg-slate-50 w-44 font-bold text-slate-800">
                  {f.label}
                </th>
                <td className="border border-black p-2 font-semibold">
                  {blank ? '' : fields[f.id] || ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Textareas */}
        {spec.textareas &&
          spec.textareas.map((t: any) => (
            <div key={t.id} className="border border-black p-3 rounded text-xs space-y-1 my-2">
              <div className="font-bold text-slate-800">{t.label}:</div>
              <div className="min-h-[40px] whitespace-pre-wrap">
                {blank ? '' : textareas[t.id] || ''}
              </div>
            </div>
          ))}

        {/* Dynamic Table */}
        {spec.table && (
          <div className="my-3">
            <div className="text-xs font-bold mb-1">{spec.table.label}:</div>
            <table className="w-full text-center text-xs border-collapse border border-black">
              <thead>
                <tr className="bg-slate-100 font-bold">
                  {spec.table.numbered && (
                    <th className="border border-black p-1.5 w-10">الرقم</th>
                  )}
                  {spec.table.columns.map((c: any) => (
                    <th key={c.id} className="border border-black p-1.5">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row: any, rIdx: number) => (
                  <tr key={rIdx}>
                    {spec.table.numbered && (
                      <td className="border border-black p-1.5 font-bold">{rIdx + 1}</td>
                    )}
                    {spec.table.columns.map((c: any) => (
                      <td key={c.id} className="border border-black p-1.5 text-right">
                        {blank ? '' : row[c.id] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notes and static regulations */}
        {spec.note && (
          <p className="text-[11px] text-slate-700 italic border-t border-slate-300 pt-2">
            {spec.note}
          </p>
        )}
        {spec.staticNotes && (
          <div className="text-[11px] leading-relaxed my-2">
            <div className="font-bold mb-1">تعليمات هامة:</div>
            <ul className="list-disc list-inside space-y-0.5 pr-2">
              {spec.staticNotes.map((n: string, i: number) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Signatures */}
        {spec.signatures && (
          <div className="flex justify-around items-start text-center mt-10 text-xs font-bold">
            {spec.signatures.map((sig: string, idx: number) => (
              <div key={idx} className="w-44">
                <div>{sig}</div>
                <div className="h-16 border-b border-dotted border-black mt-2" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Specialized: Checklist docs (pv_magasin, pv_sakanat)
  if (docKey === 'pv_magasin' || docKey === 'pv_sakanat') {
    const isMagasin = docKey === 'pv_magasin';
    const fields = currentDoc.fields || {};
    const items = currentDoc.items || {};
    const committee = currentDoc.committee || {};

    const committeeMembers = isMagasin
      ? ['المقتصد (ة)', 'المدير (ة)', 'المخزني (ة)']
      : ['المقتصد (ة)', 'المخزني (ة)', 'المعني (ة)'];

    return (
      <div className="space-y-4 text-slate-900 leading-normal font-sans" dir="rtl">
        <Letterhead
          meta={meta}
          title={isMagasin ? 'محضر معاينة مخزن المواد الغذائية' : 'محضر معاينة السكنات الوظيفية'}
          subtitle={blank ? 'نسخة رسمية فارغة' : ''}
        />

        <table className="w-full text-right text-xs border-collapse border border-black mb-3">
          <tbody>
            <tr>
              <th className="border border-black p-2 bg-slate-50 w-44">في يوم / بتاريخ</th>
              <td className="border border-black p-2 font-semibold">
                {blank ? '' : `${fields.day || ''} ${fields.date || ''} على الساعة ${fields.time || ''}`}
              </td>
            </tr>
            <tr>
              <th className="border border-black p-2 bg-slate-50">اللجنة المعاينة</th>
              <td className="border border-black p-2 font-semibold">
                {blank ? '' : `السيد (ة): ${fields.person1 || '—'} رفقة السيد (ة): ${fields.person2 || '—'}`}
              </td>
            </tr>
            <tr>
              <th className="border border-black p-2 bg-slate-50">
                {isMagasin ? 'المخزن المعاين' : 'السكن الوظيفي'}
              </th>
              <td className="border border-black p-2 font-semibold">
                {blank ? '' : `رقم: ${isMagasin ? fields.storeNum || '' : fields.housingNum || ''} — الممسوك/المشغول من طرف: ${isMagasin ? fields.keeper || '' : fields.occupant || ''}`}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Items */}
        {isMagasin ? (
          <table className="w-full text-right text-xs border-collapse border border-black my-3">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="border border-black p-2">البند والملاحظة</th>
                <th className="border border-black p-2 w-48 text-center">النتيجة المسجلة</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'clean', label: '1) نظافة المخزن وتنظيم المواد' },
                { id: 'cards', label: '2) بطاقات المخزون ومطابقتها' },
                { id: 'cardsVisa', label: '3) تأشيرات بطاقات المخزون وترقيمها' },
                { id: 'bons', label: '4) وصولات الخروج واستعمالها' },
                { id: 'magasinierVisa', label: '5) تأشير المخزني في وصولات الاستلام' },
                { id: 'expiry', label: '6) تواريخ انتهاء الصلاحية' },
              ].map((it) => (
                <tr key={it.id}>
                  <td className="border border-black p-2 font-bold">{it.label}</td>
                  <td className="border border-black p-2 text-center font-bold">
                    {blank ? '' : items[it.id] || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-right text-xs border-collapse border border-black my-3">
            <thead>
              <tr className="bg-slate-100 font-bold text-center">
                <th className="border border-black p-2 text-right">الغرفة / المرفق</th>
                <th className="border border-black p-2 w-28">النظافة</th>
                <th className="border border-black p-2 w-28">الطلاء</th>
                <th className="border border-black p-2 w-28">الصيانة</th>
              </tr>
            </thead>
            <tbody>
              {[
                'الغرفة 01',
                'الغرفة 02',
                'الغرفة 03',
                'غرفة الضيوف',
                'المطبخ',
                'لواحق السكن (الردهة والشرفة)',
              ].map((room, ridx) => (
                <tr key={ridx}>
                  <td className="border border-black p-2 font-bold">{room}</td>
                  <td className="border border-black p-2 text-center">
                    {blank ? '' : items[`r${ridx}_clean`] || '—'}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {blank ? '' : items[`r${ridx}_paint`] || '—'}
                  </td>
                  <td className="border border-black p-2 text-center">
                    {blank ? '' : items[`r${ridx}_maint`] || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="text-xs my-2">
          <b>ملاحظات وتوصيات عامة:</b> {blank ? '' : currentDoc.notes || '—'}
        </div>

        {/* Committee signatures */}
        <div className="mt-8">
          <div className="text-xs font-bold mb-2">أعضاء اللجنة المكلفة بالمعاينة والتوقيع:</div>
          <table className="w-full text-center text-xs border-collapse border border-black">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="border border-black p-2">الصفة / المنصب</th>
                <th className="border border-black p-2 text-right">الاسم واللقب</th>
                <th className="border border-black p-2 w-40">الإمضاء والختم</th>
              </tr>
            </thead>
            <tbody>
              {committeeMembers.map((role) => (
                <tr key={role}>
                  <td className="border border-black p-2 font-bold">{role}</td>
                  <td className="border border-black p-2 text-right">
                    {blank ? '' : committee[role] || ''}
                  </td>
                  <td className="border border-black p-2 h-14"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Specialized: Taskhir (تسخير العمال)
  if (docKey === 'taskhir') {
    const fields = currentDoc.fields || {};
    const selected = currentDoc.selected || {};
    const selectedWorkers = blank
      ? Array.from({ length: 4 }, () => ({ name: '', job: '' }))
      : data.workers.filter((w) => selected[w.id]);
    const tasks = blank ? ['', '', ''] : currentDoc.tasks || [];

    return (
      <div className="space-y-4 text-slate-900 leading-normal font-sans" dir="rtl">
        <Letterhead meta={meta} title="أمر تسخـــــــــير عمال" subtitle={blank ? 'نسخة رسمية فارغة' : ''} />
        <p className="text-xs leading-relaxed font-semibold">
          ليكن في علم جميع العمال الآتية أسماؤهم أدناه أنهم مسخرون يوم{' '}
          <b>{blank ? '......................' : fields.day || '—'}</b> على الساعة{' '}
          <b>{blank ? '............' : fields.time || '—'}</b>، وذلك للقيام بـ:{' '}
          <b>{blank ? '......................................................' : fields.reason || 'أعمال استثنائية مستعجلة'}</b>.
        </p>

        <table className="w-full text-right text-xs border-collapse border border-black my-3">
          <thead>
            <tr className="bg-slate-100 font-bold text-center">
              <th className="border border-black p-1.5 w-12">الرقم</th>
              <th className="border border-black p-1.5 text-right">الاسم واللقب</th>
              <th className="border border-black p-1.5 text-right">الوظيفة / الرتبة</th>
              <th className="border border-black p-1.5 w-36">إمضاء المعني بالأمر</th>
            </tr>
          </thead>
          <tbody>
            {(selectedWorkers.length > 0 ? selectedWorkers : [{ name: '', job: '' }]).map((w: any, idx: number) => (
              <tr key={idx}>
                <td className="border border-black p-2 text-center font-bold">{idx + 1}</td>
                <td className="border border-black p-2 font-bold">{w.name}</td>
                <td className="border border-black p-2">{w.job}</td>
                <td className="border border-black p-2"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {tasks.length > 0 && (
          <div className="text-xs my-3">
            <div className="font-bold mb-1">الأعمال المستعجلة الموكلة:</div>
            <ol className="list-decimal list-inside space-y-1 pr-2">
              {tasks.map((t: string, idx: number) => (
                <li key={idx}>{t || '................................................'}</li>
              ))}
            </ol>
          </div>
        )}

        <div className="text-[11px] leading-relaxed text-slate-700 my-3">
          - المطلوب من رئيس العمال موافاتنا بتقرير مفصل بعد الانتهاء التام من العملية.<br />
          - يجب أن يطّلع جميع العمال المذكورة أسماؤهم على هذا التسخير مع الإمضاء الإلزامي.
        </div>

        <div className="flex justify-around items-start text-center mt-10 text-xs font-bold">
          <div>المقتصد<div className="h-16 w-36 border-b border-dotted border-black mt-2" /></div>
          <div>مدير المؤسسة<div className="h-16 w-36 border-b border-dotted border-black mt-2" /></div>
        </div>
      </div>
    );
  }

  // Specialized: Barnamij Fardi (البرنامج الفردي)
  if (docKey === 'barnamij_fardi') {
    const selectedWorker = currentDoc.selectedWorker || (data.workers[0]?.id || '');
    const w = blank ? { name: '', job: '' } : (data.workers.find((x) => x.id === selectedWorker) || { name: '', job: '' });
    const rec = blank ? { tasks: '', schedule: {} } : (currentDoc.rows?.[selectedWorker] || { tasks: '', schedule: {} });

    return (
      <div className="space-y-4 text-slate-900 leading-normal font-sans" dir="rtl">
        <Letterhead meta={meta} title="البرنامج الفردي لتوزيع مهام العمال" subtitle={blank ? 'نسخة رسمية فارغة' : ''} />
        
        <table className="w-full text-right text-xs border-collapse border border-black mb-3">
          <tbody>
            <tr>
              <th className="border border-black p-2 bg-slate-50 w-36">الاسم واللقب</th>
              <td className="border border-black p-2 font-bold">{w.name}</td>
              <th className="border border-black p-2 bg-slate-50 w-36">الوظيفة</th>
              <td className="border border-black p-2 font-bold">{w.job}</td>
            </tr>
            <tr>
              <th className="border border-black p-2 bg-slate-50">المهام المسندة</th>
              <td colSpan={3} className="border border-black p-2">{rec.tasks}</td>
            </tr>
          </tbody>
        </table>

        <div className="text-xs font-bold mb-1">التوقيت الأسبوعي والورديات:</div>
        <table className="w-full text-center text-xs border-collapse border border-black mb-4">
          <thead>
            <tr className="bg-slate-100 font-bold">
              {WEEK_SCHEDULE_DAYS.map((d) => (
                <th key={d.id} className="border border-black p-2">{d.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {WEEK_SCHEDULE_DAYS.map((d) => (
                <td key={d.id} className="border border-black p-2 font-semibold">
                  {blank ? '' : formatShiftCell(rec.schedule?.[d.id])}
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        <div className="text-[11px] leading-relaxed">
          <b>تنبيهات هامة:</b> المعني ملزم بالتوقيت المذكور، ارتداء المئزر، احترام توجيهات المصلحة، وكل غياب غير مبرر يترتب عنه الخصم القانوني.
        </div>

        <div className="flex justify-around items-start text-center mt-12 text-xs font-bold">
          <div>المقتصد<div className="h-16 w-32 border-b border-dotted border-black mt-2" /></div>
          <div>العامل المكلف<div className="h-16 w-32 border-b border-dotted border-black mt-2" /></div>
          <div>مدير المؤسسة<div className="h-16 w-32 border-b border-dotted border-black mt-2" /></div>
        </div>
      </div>
    );
  }

  // Specialized: Barnamij Sanawi (البرنامج السنوي)
  if (docKey === 'barnamij_sanawi') {
    const rows = currentDoc.rows || {};
    return (
      <div className="space-y-4 text-slate-900 leading-normal font-sans" dir="rtl">
        <Letterhead
          meta={meta}
          title="البرنامج السنوي لتوزيع مهام العمال المهنيين"
          subtitle={blank ? 'نسخة رسمية فارغة' : `للفترة من ${currentDoc.periodFrom || '—'} إلى ${currentDoc.periodTo || '—'}`}
        />
        <table className="w-full text-center text-[10px] border-collapse border border-black">
          <thead>
            <tr className="bg-slate-100 font-bold">
              <th className="border border-black p-1 w-8">الرقم</th>
              <th className="border border-black p-1 text-right w-28">الاسم واللقب</th>
              <th className="border border-black p-1 text-right w-24">الوظيفة</th>
              {WEEK_SCHEDULE_DAYS.map((d) => (
                <th key={d.id} className="border border-black p-1">{d.label}</th>
              ))}
              <th className="border border-black p-1 text-right">الأعمال الموكلة</th>
            </tr>
          </thead>
          <tbody>
            {data.workers.map((w, idx) => {
              const rec = rows[w.id] || { tasks: '', schedule: {} };
              return (
                <tr key={w.id}>
                  <td className="border border-black p-1 font-bold">{idx + 1}</td>
                  <td className="border border-black p-1 text-right font-bold">{w.name}</td>
                  <td className="border border-black p-1 text-right">{w.job}</td>
                  {WEEK_SCHEDULE_DAYS.map((d) => (
                    <td key={d.id} className="border border-black p-1">
                      {blank ? '' : formatShiftCell(rec.schedule?.[d.id])}
                    </td>
                  ))}
                  <td className="border border-black p-1 text-right">{blank ? '' : rec.tasks}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex justify-around items-start text-center mt-8 text-xs font-bold">
          <div>المقتصد<div className="h-16 w-32 border-b border-dotted border-black mt-2" /></div>
          <div>مدير المؤسسة<div className="h-16 w-32 border-b border-dotted border-black mt-2" /></div>
        </div>
      </div>
    );
  }

  // Specialized: Kashf Hudur (كشف الحضور اليومي)
  if (docKey === 'kashf_hudur') {
    const rows = currentDoc.rows || {};
    return (
      <div className="space-y-4 text-slate-900 leading-normal font-sans" dir="rtl">
        <Letterhead
          meta={meta}
          title="كشف الحضور اليومي للعمال المهنيين"
          subtitle={blank ? 'نسخة رسمية فارغة' : `ليوم: ${currentDoc.date || '........................'}`}
        />
        <table className="w-full text-right text-xs border-collapse border border-black">
          <thead>
            <tr className="bg-slate-100 font-bold text-center">
              <th className="border border-black p-1.5 w-10">الرقم</th>
              <th className="border border-black p-1.5 text-right">اللقب والاسم</th>
              <th className="border border-black p-1.5 text-right">الوظيفة</th>
              <th className="border border-black p-1.5 w-20">الدخول</th>
              <th className="border border-black p-1.5 w-20">خروج (من)</th>
              <th className="border border-black p-1.5 w-20">رجوع (إلى)</th>
              <th className="border border-black p-1.5 w-20">الخروج</th>
              <th className="border border-black p-1.5 w-24">الإمضاء</th>
            </tr>
          </thead>
          <tbody>
            {data.workers.map((w, idx) => {
              const rec = rows[w.id] || {};
              return (
                <tr key={w.id}>
                  <td className="border border-black p-1.5 text-center font-bold">{idx + 1}</td>
                  <td className="border border-black p-1.5 font-bold">{w.name}</td>
                  <td className="border border-black p-1.5">{w.job}</td>
                  <td className="border border-black p-1.5 text-center">{blank ? '' : rec.inT || ''}</td>
                  <td className="border border-black p-1.5 text-center">{blank ? '' : rec.outFrom || ''}</td>
                  <td className="border border-black p-1.5 text-center">{blank ? '' : rec.outTo || ''}</td>
                  <td className="border border-black p-1.5 text-center">{blank ? '' : rec.outT || ''}</td>
                  <td className="border border-black p-1.5"></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex justify-around items-start text-center mt-8 text-xs font-bold">
          <div>المقتصد<div className="h-14 w-32 border-b border-dotted border-black mt-2" /></div>
          <div>مدير المؤسسة<div className="h-14 w-32 border-b border-dotted border-black mt-2" /></div>
        </div>
      </div>
    );
  }

  // Fallback for any other doc
  return (
    <div className="space-y-4 text-slate-900 leading-normal font-sans" dir="rtl">
      <Letterhead meta={meta} title={docMeta.title} subtitleFr={docMeta.subtitleFr} />
      <div className="border border-black p-4 rounded text-xs">
        <p>وثيقة إدارية رسمية تابعة لـ {docMeta.group}.</p>
      </div>
    </div>
  );
};
