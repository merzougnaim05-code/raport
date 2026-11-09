import { AppData, DayReportData, MealTemplate, ShiftTemplate, ModawamaGroup, ModawamaProgram } from '../types';
import { getDefaultSchoolYear } from '../utils/dateUtils';

export const CATEGORIES = [
  { key: 'boarding', label: 'داخلي' },
  { key: 'halfboard', label: 'نصف داخلي' },
  { key: 'teachers', label: 'أساتذة' },
  { key: 'assistants', label: 'مساعدو التربية' },
  { key: 'guests', label: 'ضيوف' },
];

export const STATUS_OPTIONS = [
  'حاضر',
  'يوم كامل',
  'خروج قبل الوقت',
  'تأخر',
  'عدم الإمضاء على ورقة الحضور',
  'تعويض يوم',
  'غياب غير شرعي',
  'طلب غياب',
  'عطلة مرضية',
  'طلب تعويض',
  'رخصة الخروج قبل الوقت',
  'غير مبرر',
  'تسخير',
  'عطلة استثنائية',
];

export const ARABIC_MONTHS = [
  'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
  'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

export const WEEKDAY_AR = [
  'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
];

export const MEAL_CATEGORIES = [
  { id: 'breakfast', label: 'فطور الصباح' },
  { id: 'lunch', label: 'وجبة الغداء' },
  { id: 'dinner', label: 'وجبة العشاء' },
  { id: 'general', label: 'عام (كل الوجبات)' },
];

export const DEFAULT_SHIFT_TEMPLATES: ShiftTemplate[] = [
  { id: 's0', name: 'صباحي', from: '08:00', to: '12:00', color: '#059669' },
  { id: 's1', name: 'مسائي', from: '13:00', to: '17:00', color: '#d97706' },
  { id: 's2', name: 'ليلي', from: '20:00', to: '06:00', color: '#4f46e5' },
];

export const SHIFT_COLOR_PALETTE = ['#059669', '#d97706', '#4f46e5', '#0891b2', '#db2777', '#65a30d', '#9333ea'];

/** Ensure every shift template has a distinct color (backfills older saved data). */
export function normalizeShiftTemplates(arr: any[]): ShiftTemplate[] {
  if (!Array.isArray(arr)) return DEFAULT_SHIFT_TEMPLATES.map((s) => ({ ...s }));
  return arr.map((s: any, i: number) => ({
    id: String(s?.id || `s_${i}`),
    name: String(s?.name || ''),
    from: String(s?.from || ''),
    to: String(s?.to || ''),
    color: s?.color || SHIFT_COLOR_PALETTE[i % SHIFT_COLOR_PALETTE.length],
  }));
}

let modawamaSeq = 0;
const newModawamaId = (p: string) => `${p}_${Date.now()}_${(modawamaSeq++).toString(36)}${Math.random().toString(36).substring(2, 5)}`;

export function createEmptyModawamaGroup(name: string): ModawamaGroup {
  return {
    id: newModawamaId('g'),
    name,
    from: '',
    to: '',
    rows: Array.from({ length: 4 }, () => ({
      id: newModawamaId('r'),
      workerId: '',
      tasks: '',
      schedule: {},
    })),
  };
}

export function createModawamaProgram(title: string): ModawamaProgram {
  return {
    id: newModawamaId('md'),
    title,
    periodFrom: '',
    periodTo: '',
    groups: [createEmptyModawamaGroup('الفوج الأول')],
    notes: [],
  };
}

function defaultModawamaGroup(gid: string, name: string): ModawamaGroup {
  return {
    id: gid,
    name,
    from: '',
    to: '',
    rows: [1, 2, 3, 4].map((n) => ({ id: `${gid}_r${n}`, workerId: '', tasks: '', schedule: {} })),
  };
}

function defaultModawamaProgram(id: string, title: string): ModawamaProgram {
  return {
    id,
    title,
    periodFrom: '',
    periodTo: '',
    groups: [defaultModawamaGroup(`${id}_g1`, 'الفوج الأول'), defaultModawamaGroup(`${id}_g2`, 'الفوج الثاني')],
    notes: [],
  };
}

export const DEFAULT_MODAWAMA_PROGRAMS: ModawamaProgram[] = [
  defaultModawamaProgram('md_kharif', 'برنامج عطلة الخريف لعمال الخدمات'),
  defaultModawamaProgram('md_chita', 'برنامج عطلة الشتاء لعمال الخدمات'),
  defaultModawamaProgram('md_rabi', 'برنامج عطلة الربيع لعمال الخدمات'),
  defaultModawamaProgram('md_sayf', 'برنامج العطلة الصيفية لعمال الخدمات'),
];

export const ECONOMIST_NOTE_OPTIONS = [
  'سير عادي للخدمة',
  'تم توزيع الوجبات في الوقت المحدد',
  'تم التنسيق مع الطباخ والمخزني',
  'النظافة العامة جيدة بالمطعم وقاعات الدراسة',
  'المرافق في حالة جيدة، لا توجد أعطال',
  'توجد ملاحظات تتطلب تدخل المدير',
];

export const WEEK_SCHEDULE_DAYS = [
  { id: 'sat', label: 'السبت' },
  { id: 'sun', label: 'الأحد' },
  { id: 'mon', label: 'الإثنين' },
  { id: 'tue', label: 'الثلاثاء' },
  { id: 'wed', label: 'الأربعاء' },
  { id: 'thu', label: 'الخميس' },
  { id: 'fri', label: 'الجمعة' }
];

export function createEmptyDay(): DayReportData {
  const headcount: Record<string, any> = {};
  CATEGORIES.forEach(c => {
    headcount[c.key] = { b_reg: '', b_pres: '', l_reg: '', l_pres: '', d_reg: '', d_pres: '' };
  });

  return {
    headcount,
    meals: {
      breakfast: { planned: '', served: '' },
      lunch: { planned: '', served: '' },
      dinner: { planned: '', served: '' },
    },
    workerStatus: {},
    attendance: [],
    economistNotes: [
      { preset: '', text: '' },
      { preset: '', text: '' },
      { preset: '', text: '' },
    ],
    facilitiesStatus: '',
    worksDone: '',
    worksUrgent: '',
    notesEconomist: '',
    notesDirector: '',
    mealNotes: '',
    signedAt: '',
  };
}

export function getDefaultAppData(): AppData {
  const now = new Date();
  const currentMonthIdx = now.getMonth();
  return {
    meta: {
      republic: 'الجمهورية الجزائرية الديمقراطية الشعبية',
      ministry: 'وزارة التربية الوطنية',
      directorate: '',
      institution: '',
      municipality: '',
      wilaya: '',
      year: getDefaultSchoolYear(now),
      monthNum: currentMonthIdx + 1,
      monthName: ARABIC_MONTHS[currentMonthIdx] || 'أفريل',
      economistName: '',
      directorName: '',
    },
    // نسخة فارغة تمامًا للمستخدم الجديد — من لديه بيانات سابقة يبقي بياناته (مفتاح التخزين نفسه)
    workers: [],
    mealLibrary: [],
    shiftTemplates: DEFAULT_SHIFT_TEMPLATES.map((s) => ({ ...s })),
    sijl: {},
    modawama: JSON.parse(JSON.stringify(DEFAULT_MODAWAMA_PROGRAMS)),
    days: {},
    docs: {},
    docRegistry: {},
  };
}
