import React, { useEffect } from 'react';
import { AppData, DayReportData, ShiftCellData, SIJL_FIELDS } from '../types';
import { Letterhead } from './Letterhead';
import { CATEGORIES, WEEK_SCHEDULE_DAYS } from '../data/initialData';
import { getWeekdayName as resolveWeekday, resolveReportYear, getCanonicalMonthName, getDaysInMonth } from '../utils/dateUtils';
import { DOC_LIST, SIMPLE_DOCS_SPEC } from '../data/documentsConfig';
import { computeAutoSijl, computeSijlStats, fmt, mergeSijlRows } from '../utils/sijlUtils';

interface PrintSheetRendererProps {
  type: 'day' | 'workers' | 'doc' | 'sijl' | 'modawama' | 'attendance' | 'internalSrv';
  data: AppData;
  dayNum?: number;
  docKey?: string;
  blank?: boolean;
  sijlWorkerId?: string;
  modawamaId?: string;
}

export const PrintSheetRenderer: React.FC<PrintSheetRendererProps> = ({
  type,
  data,
  dayNum = 1,
  docKey = '',
  blank = false,
  sijlWorkerId = '',
  modawamaId = '',
}) => {
  const meta = data.meta;

  // Landscape orientation for wide tables (annual program). Written into <head>
  // AFTER the bundled stylesheet so it wins over the default portrait @page.
  const isLandscapeDoc = type === 'sijl' || type === 'modawama' || type === 'attendance' || (type === 'doc' && docKey === 'barnamij_sanawi');
  useEffect(() => {
    const id = 'print-orientation-override';
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = isLandscapeDoc
      ? '@media print { @page { size: A4 landscape; margin: 8mm; } }'
      : '@media print { @page { size: A4 portrait; margin: 10mm 12mm; } }';
    return () => {
      const node = document.getElementById(id);
      if (node) node.textContent = '@media print { @page { size: A4 portrait; margin: 10mm 12mm; } }';
    };
  }, [isLandscapeDoc]);

  // Format shift cells stacked vertically (times only, each timing in its own color)
  const shiftColorFor = (cell?: ShiftCellData): string => {
    if (!cell?.from || !cell?.to) return '';
    const t = (data.shiftTemplates || []).find((x) => x.from === cell.from && x.to === cell.to);
    return t?.color || '';
  };
  const formatShiftCell = (cell?: ShiftCellData) => {
    if (!cell) return '';
    if (cell.mode === 'راحة') return 'راحة';
    if (!cell.from && !cell.to) return cell.mode || '';
    const c = shiftColorFor(cell);
    return (
      <div className="leading-[1.15] whitespace-nowrap font-bold" style={c ? { color: c } : undefined}>
        {cell.from ? <div>من {cell.from}</div> : null}
        {cell.to ? <div>إلى {cell.to}</div> : null}
      </div>
    );
  };

  // Program notes print block: saved notes + blank ruled lines for handwriting
  const renderProgramNotesPrint = (notes: unknown) => {
    const saved = blank
      ? []
      : (Array.isArray(notes) ? notes.map((n) => String(n || '').trim()).filter(Boolean) : []);
    return (
      <div className="text-[11px]">
        <div className="font-bold mb-1">ملاحظات:</div>
        {saved.map((n, i) => (
          <div key={i} className="pr-2 mb-0.5">{i + 1}- {n}</div>
        ))}
        {Array.from({ length: Math.max(0, 3 - saved.length) }).map((_, i) => (
          <div key={`b${i}`} className="border-b border-dotted border-black h-6"></div>
        ))}
      </div>
    );
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
      mealNotes: '',
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
          mealNotes: '',
          signedAt: '',
        }
      : realDay;

    const weekday = getWeekdayName(dayNum);
    const reportYear = resolveReportYear(meta);
    const displayMonth = getCanonicalMonthName(meta.monthNum) || meta.monthName;
    const dateLabel = `يوم ${weekday || ''} — ${dayNum} ${displayMonth} ${reportYear}`;

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

    return (
      <div className="space-y-2 text-slate-900 leading-tight font-sans" dir="rtl">
        <Letterhead
          meta={meta}
          title="التقرير اليومي للمصالح الاقتصادية"
          subtitle={blank ? 'نسخة رسمية فارغة' : dateLabel}
        />

        {/* Headcount Table */}
        <div>
          <div className="text-xs font-bold mb-0.5">أولاً: تعداد المستفيدين من الإطعام</div>
          <table className="w-full text-center text-[10px] border-collapse border border-black">
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
          <div className="text-xs font-bold mb-0.5">ثانيًا: الوجبات الغذائية المقررة والمقدمة</div>
          <table className="w-full text-right text-[10px] border-collapse border border-black">
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
          {/* ملاحظات حول الوجبة — مباشرة تحت الوجبات الغذائية */}
          <div className="mt-1 flex gap-1 text-[10px]">
            <span className="font-bold shrink-0">ملاحظات حول الوجبة:</span>
            <span className="flex-1 border-b border-dotted border-black min-h-[16px]">
              {blank ? '' : (day.mealNotes || '')}
            </span>
          </div>
        </div>

        {/* Worker daily presence table: only absentees are shown to fit one page */}
        <div>
          <div className="text-xs font-bold mb-0.5">ثالثًا: وضعية وحضور العمال المهنيين وموظفي الخدمات</div>
          {(() => {
            const isPresent = (s?: string) => !s || s === 'حاضر' || s === 'يوم كامل';
            if (!blank) {
              const absent = data.workers.filter((w) => !isPresent(day.workerStatus?.[w.id]));
              if (absent.length === 0) {
                return (
                  <div className="border border-black p-1.5 text-center text-xs font-bold">
                    لا يوجد غياب — جميع العمال حاضرون.
                  </div>
                );
              }
              return (
                <table className="w-full text-right text-[10px] border-collapse border border-black">
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
              <table className="w-full text-right text-[10px] border-collapse border border-black">
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

        {/* Facilities & Works: each in its own frame */}
        <div className="text-[10px] space-y-1 pt-0.5">
          <div className="border border-black p-1.5 min-h-[70px]">
            <div className="mb-1 font-black">1. وضعية المحلات والمرافق</div>
            <div>{blank ? '' : day.facilitiesStatus || 'المحلات في حالة حسنة.'}</div>
          </div>
          <div className="flex gap-1">
            <div className="flex-1 border border-black p-1.5 min-h-[70px]">
              <div className="mb-1 font-black">2. الأشغال المنجزة</div>
              <div>{blank ? '' : day.worksDone || '—'}</div>
            </div>
            <div className="flex-1 border border-black p-1.5 min-h-[70px]">
              <div className="mb-1 font-black">3. الأشغال المستعجلة</div>
              <div>{blank ? '' : day.worksUrgent || '—'}</div>
            </div>
          </div>
          <div className="flex gap-1 items-stretch">
            <div className="flex-1 border border-black p-2 min-h-[130px]">
              <div className="mb-1 font-black">ملاحظات المقتصد:</div>
              <div>
                {blank
                  ? ''
                  : (day.economistNotes || [])
                      .map((n) => (n?.text || '').trim())
                      .filter(Boolean)
                      .join(' — ') || day.notesEconomist || 'سير عادي للخدمة.'}
              </div>
            </div>
            <div className="flex-1 border border-black p-2 min-h-[130px]">
              <div className="mb-1 font-black">ملاحظات وتأشيرة المدير:</div>
              <div>{blank ? '' : day.notesDirector || '—'}</div>
            </div>
          </div>
        </div>

        {/* Date and Signatures */}
        <div className="pt-1 text-[10px]">
          <div className="text-left">
            <b>حرر بـ:</b> {blank ? '............................... في ...............................' : day.signedAt || `بـ ${meta.municipality} في ${dayNum} ${displayMonth} ${reportYear}`}
          </div>
          <div className="flex justify-around items-start text-center mt-3">
            <div className="w-48">
              <div className="font-bold text-xs">مقتصد المؤسسة</div>
              <div className="text-[10px] text-slate-700 mt-1">{meta.economistName || ''}</div>
              <div className="h-8 mt-1 border-b border-dotted border-black"></div>
            </div>
            <div className="w-48">
              <div className="font-bold text-xs">مدير المؤسسة</div>
              <div className="text-[10px] text-slate-700 mt-1">{meta.directorName || ''}</div>
              <div className="h-8 mt-1 border-b border-dotted border-black"></div>
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
  // SIJL — absences & delays register (individual + collective sheets)
  // =========================================================================
  // =========================================================================
  // كشف الحضور اليومي للعمال المهنيين (ورقة حضور + استلام المهام + إمضاءات)
  // =========================================================================
  if (type === 'attendance') {
    const reportYear = resolveReportYear(meta);
    const displayMonth = getCanonicalMonthName(meta.monthNum) || meta.monthName;
    const weekday = resolveWeekday(dayNum, meta);
    const dateLabel = blank
      ? '................ /................ / 20......'
      : `${weekday} ${dayNum} ${displayMonth} ${reportYear}`;
    const workersList = blank ? [] : data.workers || [];
    const placeholderRows = Math.max(3, 18 - workersList.length);

    const signBlock = (title: string) => (
      <div className="border border-black">
        <div className="text-center text-[10px] font-black border-b border-black py-0.5">{title}</div>
        <div className="px-1.5 py-0.5 text-[9px]">
          <div className="flex items-center gap-1">
            <b>الإسـم و اللـقـب :</b>
            <span className="flex-1 border-b border-dotted border-black">&nbsp;</span>
          </div>
          <div className="mt-0.5"><b>الملاحظات :</b></div>
          <div className="border-b border-dotted border-black h-3.5"></div>
          <div className="border-b border-dotted border-black h-3.5"></div>
          <div className="flex items-center gap-1 mt-0.5">
            <b>الإمضـــــاء :</b>
            <span className="flex-1 border-b border-dotted border-black">&nbsp;</span>
          </div>
        </div>
      </div>
    );

    return (
      <div className="space-y-1.5 text-slate-900 leading-tight font-sans" dir="rtl">
        {/* ترويسة مدمجة (النموذج الورقي) */}
        <div className="text-center border-b-2 border-black pb-1 mb-1">
          <div className="text-[11px] font-bold">الجمهورية الجزائرية الديمقراطية الشعبية — وزارة التربية الوطنية</div>
          <div className="flex justify-between items-center text-[10px] font-semibold mt-0.5 px-1">
            <div className="text-right">
              <div>مديـرية التربية لولاية: {meta.wilaya || '—'}</div>
              <div className="font-black text-[11px]">{meta.institution || '—'}</div>
            </div>
            <div className="text-center text-[12px] font-black underline">كشف الحضور اليومي للعمال المهنيين</div>
            <div className="text-left">
              <div>السنة الدراسية: {meta.year || '—'}</div>
              <div>لـيوم : <b>{blank ? '...... /...... /......' : dateLabel}</b></div>
            </div>
          </div>
        </div>

        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr>
              <th className="border border-black p-0.5 min-w-[30px]">التسلسل</th>
              <th className="border border-black p-0.5 min-w-[130px]">الاسم واللقب</th>
              <th className="border border-black p-0.5 min-w-[120px]">الوظيفة</th>
              <th className="border border-black p-0.5 min-w-[100px]">توقيت الدخـــول</th>
              <th className="border border-black p-0.5 min-w-[100px]">توقيت الخروج</th>
              <th className="border border-black p-0.5 min-w-[130px]">خروج ورجوع أثناء العمل</th>
              <th className="border border-black p-0.5 min-w-[110px]">الإمضـــاء</th>
            </tr>
          </thead>
          <tbody>
            {workersList.map((w, idx) => (
              <tr key={w.id}>
                <td className="border border-black px-1 py-[1px] text-center font-bold">{idx + 1}</td>
                <td className="border border-black px-1 py-[1px] font-semibold">{w.name}</td>
                <td className="border border-black px-1 py-[1px] text-center">{w.job}</td>
                <td className="border border-black px-1 py-[1px]">&nbsp;</td>
                <td className="border border-black px-1 py-[1px]">&nbsp;</td>
                <td className="border border-black px-1 py-[1px]">&nbsp;</td>
                <td className="border border-black px-1 py-[1px]">&nbsp;</td>
              </tr>
            ))}
            {Array.from({ length: placeholderRows }, (_, i) => (
              <tr key={`p${i}`}>
                <td className="border border-black px-1 py-[1px] text-center font-bold">{workersList.length + i + 1}</td>
                <td className="border border-black px-1 py-[1px]">&nbsp;</td>
                <td className="border border-black px-1 py-[1px]">&nbsp;</td>
                <td className="border border-black px-1 py-[1px]">&nbsp;</td>
                <td className="border border-black px-1 py-[1px]">&nbsp;</td>
                <td className="border border-black px-1 py-[1px]">&nbsp;</td>
                <td className="border border-black px-1 py-[1px]">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* استلام المهام: صباحاً / مساءً / ليلاً */}
        <div className="grid grid-cols-3 gap-1.5">
          {signBlock('العـــامل المستلم للمهام صبــــاحاً')}
          {signBlock('العـــامل المستلم للمهام مســـــاء')}
          {signBlock('العـــامل المستلم للمهام ليــــــلا')}
        </div>

        <div className="flex gap-1.5 items-stretch">
          <div className="flex-1 border border-black p-1.5 min-h-[52px] text-[9px]">
            <b>ملاحظات مسؤول الخدمات :</b>
          </div>
          <div className="flex-1 border border-black p-1.5 min-h-[52px] text-[9px]">
            <b>ملاحظات المقتصد :</b>
          </div>
        </div>

        <div className="text-[9px] border border-black p-1 bg-slate-50 print:bg-white">
          <b className="underline">ملاحظـــــة :</b>{' '}
          <span>
            يجب على الحراس قبل استلام المهام تفقد كل المحلات والمـرجل وخزان الماء وحضيرة الشاحنة، والتأكد من سلامة كل الأبواب والنوافذ.
          </span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // التقرير اليومي لمسؤول الخدمة الداخلية
  // =========================================================================
  if (type === 'internalSrv') {
    const reportYear = resolveReportYear(meta);
    const displayMonth = getCanonicalMonthName(meta.monthNum) || meta.monthName;
    const weekday = resolveWeekday(dayNum, meta);
    const dateLabel = blank
      ? '................ /................ / 20......'
      : `${weekday} ${dayNum} ${displayMonth} ${reportYear}`;
    const day = blank ? null : data.days?.[dayNum];
    const statusFor = (wid: string) => (day ? (day.workerStatus || {})[wid] : undefined);
    const isAbsent = (st?: string) => !!st && !['حاضر', 'يوم كامل', ''].includes(st);

    return (
      <div className="space-y-1.5 text-slate-900 leading-tight font-sans" dir="rtl">
        <Letterhead meta={meta} title="التقرير اليومي لمسؤول الخدمة الداخلية" subtitle={blank ? 'نسخة رسمية فارغة' : `لـيوم : ${dateLabel}`} />

        {/* 1- حالة المحلات */}
        <div>
          <div className="text-[10px] font-black mb-0.5">1- حـــــالة الـمـحلات</div>
          <div className="grid grid-cols-2 gap-1">
            <div className="border border-black p-1 min-h-[46px] text-[9px]"><b>الإنـــــــــارة :</b></div>
            <div className="border border-black p-1 min-h-[46px] text-[9px]"><b>التدفـئـــــة :</b></div>
            <div className="border border-black p-1 min-h-[46px] text-[9px]"><b>النظـــــافة :</b></div>
            <div className="border border-black p-1 min-h-[46px] text-[9px]"><b>الإتـلافـــــات :</b></div>
          </div>
        </div>

        {/* 2- الحالة الأمنية */}
        <div>
          <div className="text-[10px] font-black mb-0.5">2- الحالة الأمنية</div>
          <div className="border border-black p-1 min-h-[46px] text-[9px]">&nbsp;</div>
        </div>

        {/* 3- التأخرات والغيابات */}
        <div>
          <div className="text-[10px] font-black mb-0.5">3- التأخرات والغيابات</div>
          <table className="w-full border-collapse text-[9px]">
            <thead>
              <tr>
                <th rowSpan={2} className="border border-black p-0.5 min-w-[24px]">التسلسل</th>
                <th rowSpan={2} className="border border-black p-0.5">اللقب والجهة</th>
                <th rowSpan={2} className="border border-black p-0.5 min-w-[85px]">الوظيفة</th>
                <th colSpan={2} className="border border-black p-0.5">التأخرات</th>
                <th colSpan={2} className="border border-black p-0.5">الغيابـــــات</th>
              </tr>
              <tr>
                <th className="border border-black p-0.5 min-w-[60px]">مدة التأخر</th>
                <th className="border border-black p-0.5 min-w-[70px]">التبرير</th>
                <th className="border border-black p-0.5 min-w-[70px]">السبب</th>
                <th className="border border-black p-0.5 min-w-[70px]">التبرير</th>
              </tr>
            </thead>
            <tbody>
              {(data.workers || []).map((w, idx) => {
                const st = statusFor(w.id);
                const isAbs = isAbsent(st);
                const isLate = st === 'تأخر';
                return (
                  <tr key={w.id}>
                    <td className="border border-black px-1 py-[1px] text-center font-bold">{idx + 1}</td>
                    <td className="border border-black px-1 py-[1px] font-semibold">{w.name}</td>
                    <td className="border border-black px-1 py-[1px] text-center">{w.job}</td>
                    <td className="border border-black px-1 py-[1px] text-center">{blank ? '' : isLate ? 'تأخر' : ''}</td>
                    <td className="border border-black px-1 py-[1px]">&nbsp;</td>
                    <td className="border border-black px-1 py-[1px] text-center">{blank ? '' : isAbs && !isLate ? (st || '') : ''}</td>
                    <td className="border border-black px-1 py-[1px]">&nbsp;</td>
                  </tr>
                );
              })}
              {Math.max(0, 19 - (data.workers || []).length) > 0
                ? Array.from({ length: Math.max(0, 19 - (data.workers || []).length) }, (_, i) => (
                    <tr key={`b${i}`}>
                      <td className="border border-black px-1 py-[1px] text-center font-bold">{(data.workers || []).length + i + 1}</td>
                      <td className="border border-black px-1 py-[1px]">&nbsp;</td>
                      <td className="border border-black px-1 py-[1px]">&nbsp;</td>
                      <td className="border border-black px-1 py-[1px]">&nbsp;</td>
                      <td className="border border-black px-1 py-[1px]">&nbsp;</td>
                      <td className="border border-black px-1 py-[1px]">&nbsp;</td>
                      <td className="border border-black px-1 py-[1px]">&nbsp;</td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>

        {/* 4 + 5 الأعمال المنجزة والمستعجلة */}
        <div className="grid grid-cols-2 gap-1">
          <div className="border border-black p-1 min-h-[82px] text-[9px]">
            <b>الأعمال المنجزة :</b>{' '}
            {blank ? '' : day?.worksDone || '—'}
          </div>
          <div className="border border-black p-1 min-h-[82px] text-[9px]">
            <b>الأعمال المستعجلة :</b>{' '}
            {blank ? '' : day?.worksUrgent || '—'}
          </div>
        </div>

        {/* الإمضاءات */}
        <div className="flex gap-1.5 items-stretch">
          <div className="flex-1 border border-black p-1 min-h-[88px] text-[9px]">
            <b>مسؤول الخدمة الداخلية</b>
            <div className="text-slate-600 print:text-black">( ملاحظات و توقـيع )</div>
          </div>
          <div className="flex-1 border border-black p-1 min-h-[88px] text-[9px]">
            <b>المقتصـــــد</b>
            <div className="text-slate-600 print:text-black">( ملاحظات ، ختم و توقـيع )</div>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'sijl') {
    const reportYear = resolveReportYear(meta);
    const displayMonth = getCanonicalMonthName(meta.monthNum) || meta.monthName;
    const todayNum = new Date().getDate();
    const sijlDaysInMonth = getDaysInMonth(meta);
    const sijlDays = Array.from({ length: sijlDaysInMonth }, (_, i) => i + 1);
    const sijlInMonth = (arr?: number[]) =>
      Array.isArray(arr) ? arr.filter((d) => d >= 1 && d <= sijlDaysInMonth) : [];
    const sijlHasAny = (rowMarks: any, day: number) =>
      SIJL_FIELDS.some((f) => sijlInMonth(rowMarks?.[f.id]).includes(day));

    // دمج اليدوي + الآلي المجلوب من التقارير اليومية (لا طباعة للآلي في النسخة الفارغة)
    const sijlAutoAll = blank ? {} : computeAutoSijl(data.days || {}, data.workers || [], sijlDaysInMonth);
    const sijlMerged = (wid: string) =>
      mergeSijlRows(blank ? undefined : (data.sijl[wid] as any), sijlAutoAll[wid]);

    const sijlHeader = (title: string, subtitle: string) => (
      <div className="border-[3px] border-double border-black p-3 mb-4">
        <div className="text-center">
          <div className="font-bold text-[13px]">{meta.republic || 'الجمهورية الجزائرية الديمقراطية الشعبية'}</div>
          <div className="font-bold text-[13px]">{meta.ministry || 'وزارة التربية الوطنية'}</div>
        </div>
        <div className="flex justify-between items-start text-[10px] font-medium mt-2">
          <div className="text-right">
            <div><span className="font-bold">مديرية التربية لولاية:</span> {meta.wilaya || '—'}</div>
            <div className="font-black text-xs mt-0.5">{meta.institution || '—'}</div>
          </div>
          <div className="text-left shrink-0">
            <div><span className="font-bold">السنة الدراسية:</span> {meta.year || '—'}</div>
          </div>
        </div>
        <div className="text-center mt-3">
          <div className="text-[10px] tracking-[0.3em]">❖ ❖ ❖</div>
          <h2 className="text-xl font-black mt-1">{title}</h2>
          {subtitle ? <div className="text-xs font-bold text-slate-700 mt-1">{subtitle}</div> : null}
        </div>
      </div>
    );

    const sijlFooter = () => (
      <div className="pt-2 text-[11px]">
        <div className="text-left">
          <b>حرر بـ:</b> {blank ? '............................... في ...............................' : `${meta.municipality} في ${todayNum} ${displayMonth} ${reportYear}`}
        </div>
        <div className="mt-6 flex justify-end">
          <div className="w-48 text-center">
            <div className="font-bold text-xs">إمضاء المقتصد</div>
            <div className="text-[11px] text-slate-700 mt-1">{meta.economistName || ''}</div>
            <div className="h-14 mt-1 border-b border-dotted border-black"></div>
          </div>
        </div>
      </div>
    );

    const netLabel = (st: { netKind: string; netDays: number }) =>
      st.netKind === 'abs'
        ? `أيام غياب: ${fmt(st.netDays)}`
        : st.netKind === 'comp'
          ? `أيام تعويض: ${fmt(st.netDays)}`
          : 'متعادل';

    // ---- Individual worker sheet ----
    if (sijlWorkerId) {
      const w = data.workers.find((x) => x.id === sijlWorkerId);
      const rowMarks = sijlMerged(sijlWorkerId);
      const st = blank
        ? null
        : computeSijlStats(rowMarks, sijlDaysInMonth);
      return (
        <div className="space-y-4 text-slate-900 leading-normal font-sans" dir="rtl" data-landscape="true">
          {sijlHeader('سجل الغيابات والتأخرات — ورقة فردية', blank ? 'نسخة رسمية فارغة' : `${displayMonth} ${reportYear}`)}
          <table className="w-full text-right text-xs border-collapse border-2 border-black mb-2">
            <tbody>
              <tr>
                <th className="border border-black p-2 bg-slate-100 w-40">الاسم واللقب</th>
                <td className="border border-black p-2 font-black">{blank ? '' : w?.name || ''}</td>
                <th className="border border-black p-2 bg-slate-100 w-40">الرتبة / الوظيفة</th>
                <td className="border border-black p-2 font-bold">{blank ? '' : w?.job || ''}</td>
              </tr>
            </tbody>
          </table>
          <table className="w-full text-center text-[9px] border-collapse border-2 border-black">
            <thead>
              <tr className="bg-slate-200 font-black">
                <th className="border-2 border-black p-1 text-right">الخانة</th>
                {sijlDays.map((d) => (
                  <th key={d} className="border border-black p-[1px]">{String(d).padStart(2, '0')}</th>
                ))}
                <th className="border-2 border-black p-1">المجموع</th>
              </tr>
            </thead>
            <tbody>
              {SIJL_FIELDS.map((f) => {
                const marks = blank ? [] : sijlInMonth((rowMarks as any)?.[f.id]);
                return (
                  <tr key={f.id}>
                    <td className="border-2 border-black p-1 text-right font-bold text-[10px]">{f.label}</td>
                    {sijlDays.map((d) => (
                      <td key={d} className="border border-black p-[1px] font-black">{marks.includes(d) ? '1' : ''}</td>
                    ))}
                    <td className="border-2 border-black p-1 font-black">{blank ? '' : marks.length}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {st && (
            <table className="w-full text-center text-[11px] border-collapse border-2 border-black">
              <tbody>
                <tr className="font-bold">
                  <td className="border border-black p-1.5">عدد ساعات الغياب: {fmt(st.absHours)} سا (اليوم = 8 سا)</td>
                  <td className="border border-black p-1.5">إجمالي الغيابات: {fmt(st.absDays)} يوم</td>
                  <td className="border border-black p-1.5">إجمالي التعويضات: {fmt(st.compDays)} يوم</td>
                  <td className="border border-black p-1.5 font-black">الصافي: {netLabel(st)}</td>
                </tr>
              </tbody>
            </table>
          )}
          {sijlFooter()}
        </div>
      );
    }

    // ---- Collective monthly sheet (all workers) ----
    return (
      <div className="space-y-4 text-slate-900 leading-normal font-sans" dir="rtl" data-landscape="true">
        {sijlHeader('سجل الغيابات والتأخرات — الورقة الجماعية الشهرية', blank ? 'نسخة رسمية فارغة' : `شهر ${displayMonth} ${reportYear}`)}
        <table className="w-full text-center text-[9px] border-collapse border-2 border-black">
          <thead>
            <tr className="bg-slate-200 font-black">
              <th className="border-2 border-black p-1 w-8">ر.ت</th>
              <th className="border-2 border-black p-1 text-right">الاسم واللقب</th>
              {sijlDays.map((d) => (
                <th key={d} className="border border-black p-[1px]">{String(d).padStart(2, '0')}</th>
              ))}
              <th className="border-2 border-black p-1">الغيابات</th>
              <th className="border-2 border-black p-1">التعويضات</th>
              <th className="border-2 border-black p-1">النتيجة</th>
            </tr>
          </thead>
          <tbody>
            {data.workers.map((w, idx) => {
              const rowMarks = sijlMerged(w.id);
              const st = blank
                ? null
                : computeSijlStats(rowMarks, sijlDaysInMonth);
              return (
                <tr key={w.id}>
                  <td className="border border-black p-[1px] font-bold">{idx + 1}</td>
                  <td className="border border-black p-1 text-right font-bold text-[10px]">{w.name}</td>
                  {sijlDays.map((d) => (
                    <td key={d} className="border border-black p-[1px] font-black">{sijlHasAny(rowMarks, d) ? '1' : ''}</td>
                  ))}
                  <td className="border-2 border-black p-1 font-bold">{st ? fmt(st.absDays) : ''}</td>
                  <td className="border-2 border-black p-1 font-bold">{st ? fmt(st.compDays) : ''}</td>
                  <td className="border-2 border-black p-1 font-black">{st ? netLabel(st) : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sijlFooter()}
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

        {renderProgramNotesPrint(currentDoc.programNotes)}

        <div className="flex justify-center items-start text-center mt-10 text-xs font-bold">
          <div className="w-48">
            <div>مدير المؤسسة</div>
            <div className="text-[11px] text-slate-700 mt-1">{meta.directorName || ''}</div>
            <div className="h-16 w-36 border-b border-dotted border-black mt-2 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // Specialized: Barnamij Sanawi (البرنامج السنوي)
  if (docKey === 'barnamij_sanawi') {
    const rows = currentDoc.rows || {};
    return (
      <div className="space-y-4 text-slate-900 leading-normal font-sans" dir="rtl" data-landscape="true">
        <Letterhead
          meta={meta}
          title="البرنامج السنوي لتوزيع مهام العمال المهنيين"
          subtitle={blank ? 'نسخة رسمية فارغة' : `للفترة من ${currentDoc.periodFrom || '—'} إلى ${currentDoc.periodTo || '—'}`}
        />
        <table className="w-full text-center text-[10px] border-collapse border border-black">
          <thead>
            <tr className="bg-slate-100 font-bold">
              <th className="border border-black px-[3px] py-[2px] w-8">الرقم</th>
              <th className="border border-black px-[3px] py-[2px] text-right w-28">الاسم واللقب</th>
              <th className="border border-black px-[3px] py-[2px] text-right w-24">الوظيفة</th>
              {WEEK_SCHEDULE_DAYS.map((d) => (
                <th key={d.id} className="border border-black px-[3px] py-[2px] w-[1%] whitespace-nowrap">{d.label}</th>
              ))}
              <th className="border border-black px-[3px] py-[2px] text-right">الأعمال الموكلة</th>
            </tr>
          </thead>
          <tbody>
            {data.workers.map((w, idx) => {
              const rec = rows[w.id] || { tasks: '', schedule: {} };
              return (
                <tr key={w.id}>
                  <td className="border border-black px-[3px] py-[2px] font-bold">{idx + 1}</td>
                  <td className="border border-black px-[3px] py-[2px] text-right font-bold">{w.name}</td>
                  <td className="border border-black px-[3px] py-[2px] text-right">{w.job}</td>
                  {WEEK_SCHEDULE_DAYS.map((d) => (
                    <td key={d.id} className="border border-black px-[3px] py-[2px] w-[1%]">
                      {blank ? '' : formatShiftCell(rec.schedule?.[d.id])}
                    </td>
                  ))}
                  <td className="border border-black px-[3px] py-[2px] text-right">{blank ? '' : rec.tasks}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {renderProgramNotesPrint(currentDoc.programNotes)}
        <div className="flex justify-center items-start text-center mt-8 text-xs font-bold">
          <div className="w-48">
            <div>مدير المؤسسة</div>
            <div className="text-[11px] text-slate-700 mt-1">{meta.directorName || ''}</div>
            <div className="h-16 w-36 border-b border-dotted border-black mt-2 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MODAWAMA — school-holiday duty programs (landscape, director signs only)
  // =========================================================================
  if (type === 'modawama') {
    const prog = blank
      ? { title: '', periodFrom: '', periodTo: '', groups: [], notes: [] }
      : data.modawama.find((p) => p.id === modawamaId) || { title: '', periodFrom: '', periodTo: '', groups: [], notes: [] };
    const workerName = (wid: string) => data.workers.find((x) => x.id === wid)?.name || '';
    const workerJob = (wid: string) => data.workers.find((x) => x.id === wid)?.job || '';
    return (
      <div className="space-y-4 text-slate-900 leading-normal font-sans" dir="rtl" data-landscape="true">
        <Letterhead
          meta={meta}
          title={prog.title || 'برنامج مداومة العطل المدرسية'}
          subtitle={
            blank
              ? 'نسخة رسمية فارغة'
              : `الفترة من ${prog.periodFrom || '—'} إلى ${prog.periodTo || '—'}`
          }
        />
        {(prog.groups || []).map((g: any, gi: number) => (
          <div key={g.id || gi}>
            <div className="text-xs font-black mb-1">
              {g.name || `الفوج ${gi + 1}`}
              {g.from || g.to ? ` — من ${g.from || '—'} إلى ${g.to || '—'}` : ''}
            </div>
            <table className="w-full text-center text-[10px] border-collapse border border-black">
              <thead>
                <tr className="bg-slate-100 font-bold">
                  <th className="border border-black px-[3px] py-[2px] w-8">الرقم</th>
                  <th className="border border-black px-[3px] py-[2px] text-right w-28">الاسم واللقب</th>
                  {WEEK_SCHEDULE_DAYS.map((d) => (
                    <th key={d.id} className="border border-black px-[3px] py-[2px] w-[1%] whitespace-nowrap">{d.label}</th>
                  ))}
                  <th className="border border-black px-[3px] py-[2px] text-right">الأعمال الموكلة</th>
                </tr>
              </thead>
              <tbody>
                {(g.rows || []).map((r: any, idx: number) => (
                  <tr key={r.id || idx}>
                    <td className="border border-black px-[3px] py-[2px] font-bold">{idx + 1}</td>
                    <td className="border border-black px-[3px] py-[2px] text-right font-bold">
                      {blank ? '' : workerName(r.workerId)}
                      {blank || !workerJob(r.workerId) ? '' : ` — ${workerJob(r.workerId)}`}
                    </td>
                    {WEEK_SCHEDULE_DAYS.map((d) => (
                      <td key={d.id} className="border border-black px-[3px] py-[2px] w-[1%]">
                        {blank ? '' : formatShiftCell(r.schedule?.[d.id])}
                      </td>
                    ))}
                    <td className="border border-black px-[3px] py-[2px] text-right">{blank ? '' : r.tasks || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        <div className="text-[11px]">
          <div className="font-bold mb-1">ملاحظات:</div>
          {blank ? (
            <>
              <div className="border-b border-dotted border-black h-6"></div>
              <div className="border-b border-dotted border-black h-6"></div>
              <div className="border-b border-dotted border-black h-6"></div>
            </>
          ) : (prog.notes || []).filter((n: string) => (n || '').trim()).length > 0 ? (
            (prog.notes || [])
              .filter((n: string) => (n || '').trim())
              .map((n: string, i: number) => (
                <div key={i} className="pr-2 mb-0.5">{i + 1}- {n}</div>
              ))
          ) : (
            <div className="border-b border-dotted border-black h-6"></div>
          )}
        </div>
        <div className="flex justify-center items-start text-center mt-8 text-xs font-bold">
          <div className="w-48">
            <div>مدير المؤسسة</div>
            <div className="text-[11px] text-slate-700 mt-1">{meta.directorName || ''}</div>
            <div className="h-16 w-36 border-b border-dotted border-black mt-2 mx-auto" />
          </div>
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
