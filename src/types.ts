export interface InstitutionMeta {
  republic: string;
  ministry: string;
  directorate: string;
  institution: string;
  municipality: string;
  wilaya: string;
  year: string;
  monthNum: number;
  monthName: string;
  economistName: string;
  directorName: string;
}

export interface Worker {
  id: string;
  name: string;
  job: string;
  phone: string;
}

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'general';

export interface MealTemplate {
  id: string;
  name: string;
  category: MealCategory;
  description: string;
}

export interface HeadcountRow {
  b_reg?: string | number;
  b_pres?: string | number;
  l_reg?: string | number;
  l_pres?: string | number;
  d_reg?: string | number;
  d_pres?: string | number;
  [key: string]: any;
}

export interface MealPlan {
  planned: string;
  served: string;
}

export interface AttendanceEntry {
  name: string;
  duration: string;
  reason: string;
  notes: string;
  auto?: boolean;
  workerId?: string;
}

export interface DayReportData {
  headcount: Record<string, HeadcountRow>;
  meals: {
    breakfast: MealPlan;
    lunch: MealPlan;
    dinner: MealPlan;
    [key: string]: any;
  };
  workerStatus: Record<string, string>;
  attendance: AttendanceEntry[];
  facilitiesStatus: string;
  worksDone: string;
  worksUrgent: string;
  notesEconomist: string;
  notesDirector: string;
  signedAt: string;
  [key: string]: any;
}

export interface DocRegistryEntry {
  name: string;
  date: string;
}

export interface ShiftCellData {
  mode?: string;
  from?: string;
  to?: string;
}

export interface AppData {
  meta: InstitutionMeta;
  workers: Worker[];
  mealLibrary: MealTemplate[];
  days: Record<number, DayReportData>;
  docs: Record<string, any>;
  docRegistry: Record<string, DocRegistryEntry[]>;
}

export type NavView = 'dashboard' | 'day' | 'doclist' | 'doc' | 'workers' | 'meals' | 'settings';

export interface DocMetaInfo {
  key: string;
  title: string;
  subtitleFr?: string;
  group: 'وثائق المخازن' | 'طلبات ووثائق العمال' | 'السكنات والمفاتيح' | 'متابعة العمال' | 'التقارير';
  description?: string;
}
