import { AppData, DayReportData, MealTemplate } from '../types';
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

export const DEFAULT_MEALS: MealTemplate[] = [
  { id: 'm0', name: 'فطور عادي', category: 'breakfast', description: 'حليب، قهوة، خبز، زبدة ومربى' },
  { id: 'm1', name: 'غداء عادي', category: 'lunch', description: 'سلطة متنوعة، طبق رئيسي، خبز وفاكهة' },
  { id: 'm2', name: 'عشاء عادي', category: 'dinner', description: 'حساء الخضر، طبق خفيف، ياغورت' },
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

export const DEFAULT_SEED_WORKERS = [
  { id: 'w0', name: 'فرحات توفيق', job: 'رئيس مخزن', phone: '' },
  { id: 'w1', name: 'بوسديرة الشريف', job: 'مسؤول خ الداخلية', phone: '' },
  { id: 'w2', name: 'بوخالفة صابر', job: 'عامل مهني م 2 (قيم)', phone: '' },
  { id: 'w3', name: 'مساعدية موسى', job: 'طباخ', phone: '' },
  { id: 'w4', name: 'حجيج رشيد', job: 'عامل مهني م 01', phone: '' },
  { id: 'w5', name: 'منتفي نورية', job: 'عامل مهني م 01', phone: '' },
  { id: 'w6', name: 'العلمي صحراوي', job: 'عامل مهني م 01', phone: '' },
  { id: 'w7', name: 'حجيج يزيد', job: 'عامل مهني خ ص', phone: '' },
  { id: 'w8', name: 'قرينة فواز', job: 'عامل مهني م 01', phone: '' },
  { id: 'w9', name: 'بروال امحمد', job: 'عامل مهني م 01', phone: '' },
  { id: 'w10', name: 'عطية ميلود', job: 'عامل مهني م 01', phone: '' },
  { id: 'w11', name: 'العمري علي', job: 'عامل مهني م 01', phone: '' },
  { id: 'w12', name: 'بونوارة زوبير', job: 'عامل مهني ص 01', phone: '' },
  { id: 'w13', name: 'خلفة عز الدين', job: 'حارس', phone: '' },
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
      directorate: 'مديرية التربية لولاية باتنة',
      institution: 'متوسطة الإخوة الشهداء',
      municipality: 'تالخمت',
      wilaya: 'باتنة',
      year: getDefaultSchoolYear(now),
      monthNum: currentMonthIdx + 1,
      monthName: ARABIC_MONTHS[currentMonthIdx] || 'أفريل',
      economistName: 'بن عمارة سمير',
      directorName: 'قادري عزوز',
    },
    workers: DEFAULT_SEED_WORKERS,
    mealLibrary: DEFAULT_MEALS.map((m) => ({ ...m })),
    days: {},
    docs: {},
    docRegistry: {},
  };
}
