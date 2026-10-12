/** Exact mirror of the desktop folder "أغلفة 2025\أغلفة" (copied as-is, no changes). */
export interface TasnifSection {
  dir: string;
  title: string;
  files: string[];
}

export const TASNIF_BASE = 'tasnif/أغلفة';

export const TASNIF_ROOT_FILES: string[] = [
  'EXTRAIT DE COMPTE.docx',
  'أغلفة BOU.docx',
  'اغلفة السجلات.docx',
  'التقارير الثلاثية للمطاعم المدرسية.docx',
  'الحوالات.docx',
  'تصنيف الوثائق الخاصة بالمقتصدية.doc',
  'شهادات الدفع.docx',
  'غلاف ورقة الاستهلاك اليومي.docx',
];

const four = (docsName: string) => [
  'CLA أغلفة.docx',
  'أغلفة BOU.docx',
  'الغلاف الخارجي.docx',
  docsName,
];

export const TASNIF_SECTIONS: TasnifSection[] = [
  { dir: 'تحضير الميزانية 1.2', title: 'تحضير الميزانية 1.2', files: four('الوثائق التي يتكون منها ملف الميزانية.doc') },
  { dir: 'ملف الاجور 2.2', title: 'ملف الاجور 2.2', files: four('الوثائق التي يتكون منها ملف الميزانية.doc') },
  { dir: '3.2 ملف الحساب المالي', title: '3.2 ملف الحساب المالي', files: four('الوثائق التي يتكون منها ملف ملف الحساب المالي.doc') },
  { dir: 'ملف النفقات4.2', title: 'ملف النفقات4.2', files: four('الوثائق التي يتكون منها ملف الميزانية.doc') },
  { dir: '5.2 ملف الإصلاحات', title: '5.2 ملف الإصلاحات', files: four('الوثائق التي يتكون منها ملف الميزانية.doc') },
  { dir: '6.2 ملف الجرد', title: '6.2 ملف الجرد', files: four('الوثائق التي يتكون منها ملف الميزانية.doc') },
  { dir: 'ملف الدخول المدرسي 7.2', title: 'ملف الدخول المدرسي 7.2', files: four('الوثائق التي يتكون منها ملف الميزانية.doc') },
  { dir: '8.2 الملفات المالية للموظفين', title: '8.2 الملفات المالية للموظفين', files: four('الوثائق التي يتكون منها ملف الميزانية.doc') },
  { dir: '10.2 ملف المطعم', title: '10.2 ملف المطعم', files: four('الوثائق التي يتكون منها ملف الميزانية.doc') },
  {
    dir: 'البطاقات',
    title: 'البطاقات',
    files: [
      'planing.doc',
      'إتلاف.doc',
      'الدفتر اليومي للصندوق.doc',
      'بطاقة الجرد العام.doc',
      'بطاقة مخزون الادوية.doc',
      'بطاقة مخزون التسيير و جرد المخبر.doc',
      'بطاقة مخزون القيم.doc',
      'بطاقة مخزون لوازم الرياضة.doc',
      'بطاقة مخزون لوازم المخبر.doc',
      'خروج.doc',
      'دخول.doc',
      'سجل إستعمال الوسائل المخبرية.doc',
      'سجل متابعة الوسائل المكتبية.doc',
      'صحيفة الميزانية.doc',
      'كشف حساب الخزينة.docx',
      'وصل الطلب.doc',
    ],
  },
  { dir: 'الخزينة', title: 'الخزينة', files: ['الوضعيات المالية و المحاسبية الشهرية.doc'] },
  {
    dir: 'مختلف',
    title: 'مختلف',
    files: [
      'التقرير الثلاثي للمطاعم المدرسية.docx',
      'الوثائق الخاصة بمديري المطاعم المدرسية.docx',
      'تقرير المخبري.docx',
    ],
  },
];

export const tasnifUrl = (dir: string, file: string) =>
  encodeURI(`/${TASNIF_BASE}${dir ? `/${dir}` : ''}/${file}`);
