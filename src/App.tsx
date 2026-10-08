import React, { useState, useEffect, useRef } from 'react';
import { AppData, NavView, DayReportData, InstitutionMeta, Worker, MealTemplate } from './types';
import { getDefaultAppData, createEmptyDay, ARABIC_MONTHS } from './data/initialData';
import { getDaysInMonth } from './utils/dateUtils';
import { DOC_LIST } from './data/documentsConfig';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { DayReportView } from './components/DayReportView';
import { DocListView } from './components/DocListView';
import { DocDetailView } from './components/DocDetailView';
import { WorkersView } from './components/WorkersView';
import { MealsLibraryView } from './components/MealsLibraryView';
import { SettingsView } from './components/SettingsView';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { PrintSheetRenderer } from './components/PrintSheetRenderer';
import { SplashModal } from './components/SplashModal';
import { ConfirmModal } from './components/ConfirmModal';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'mostasid_daily_report_v2';
const SPLASH_SEEN_KEY = 'mostasid_splash_dismissed_v2';

export default function App() {
  // Load data from localStorage
  const [data, setData] = useState<AppData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const defaults = getDefaultAppData();
        const mergedMeta = { ...defaults.meta, ...(parsed.meta || {}) };
        // إصلاح تلقائي: اسم الشهر مشتق دائمًا من الرقم لمنع عدم توافق الأيام
        const mn = Number(mergedMeta.monthNum);
        if (mn >= 1 && mn <= 12) {
          mergedMeta.monthName = ARABIC_MONTHS[mn - 1];
        }
        return {
          meta: mergedMeta,
          workers: parsed.workers && parsed.workers.length > 0 ? parsed.workers : defaults.workers,
          mealLibrary: parsed.mealLibrary ?? defaults.mealLibrary,
          days: parsed.days || {},
          docs: parsed.docs || {},
          docRegistry: parsed.docRegistry || {},
        };
      }
    } catch (e) {
      console.error('Error loading stored data:', e);
    }
    return getDefaultAppData();
  });

  // App navigation state
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [currentDocKey, setCurrentDocKey] = useState<string>('bon_sortie');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Dark mode state with system preference detection and localStorage persistence
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('mostasid_theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('mostasid_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('mostasid_theme', 'light');
      }
    } catch {
      // Ignore
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Splash screen state - show on first visit (loading/welcome), then remember dismissal
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SPLASH_SEEN_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  // Print Preview Modal state
  const [printModal, setPrintModal] = useState<{
    isOpen: boolean;
    title: string;
    content: React.ReactNode;
  }>({
    isOpen: false,
    title: '',
    content: null,
  });

  // Active print sheet for window.print()
  const [activePrintContent, setActivePrintContent] = useState<React.ReactNode>(null);

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [lastSavedText, setLastSavedText] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save to localStorage
  const saveToStorage = (newData: AppData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      const now = new Date();
      const timeStr = now.toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });
      setLastSavedText(`آخر حفظ تلقائي: ${timeStr}`);
    } catch (e) {
      console.error('Save failed:', e);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  // Check if a day has any entered data
  const isDayFilled = (d: number): boolean => {
    const day = data.days[d];
    if (!day) return false;

    const hasHc = Object.values(day.headcount || {}).some((cat: any) =>
      Object.values(cat || {}).some((v) => Number(v) > 0)
    );

    const hasMeals = Object.values(day.meals || {}).some(
      (m: any) => Boolean(m?.planned) || Boolean(m?.served)
    );

    const hasNotes = Boolean(
      day.notesEconomist ||
      day.notesDirector ||
      day.facilitiesStatus ||
      day.worksDone ||
      day.worksUrgent
    );

    const hasAttendance = Boolean(day.attendance && day.attendance.length > 0);

    return hasHc || hasMeals || hasNotes || hasAttendance;
  };

  // Updaters
  const handleUpdateDay = (dayNum: number, updater: (prev: DayReportData) => DayReportData) => {
    setData((prev) => {
      const prevDay = prev.days[dayNum] || createEmptyDay();
      const updatedDay = updater(prevDay);
      const newDays = { ...prev.days, [dayNum]: updatedDay };
      const nextData = { ...prev, days: newDays };
      saveToStorage(nextData);
      return nextData;
    });
  };

  const handleUpdateDocData = (key: string, docData: any) => {
    setData((prev) => {
      const newDocs = { ...prev.docs, [key]: docData };
      const nextData = { ...prev, docs: newDocs };
      saveToStorage(nextData);
      return nextData;
    });
  };

  const handleUpdateRegistry = (key: string, registry: any[]) => {
    setData((prev) => {
      const newRegistry = { ...prev.docRegistry, [key]: registry };
      const nextData = { ...prev, docRegistry: newRegistry };
      saveToStorage(nextData);
      return nextData;
    });
    showToast('تم تحديث وأرشفة سجل الوثائق بنجاح');
  };

  const handleUpdateMeta = (updater: (prev: InstitutionMeta) => InstitutionMeta) => {
    setData((prev) => {
      const updatedMeta = updater(prev.meta);
      // فرض التوافق: أي تغيير في رقم الشهر يفرض اسم الشهر القانوني
      const mn = Number(updatedMeta.monthNum);
      if (mn >= 1 && mn <= 12) {
        updatedMeta.monthName = ARABIC_MONTHS[mn - 1];
      }
      const nextData = { ...prev, meta: updatedMeta };
      saveToStorage(nextData);
      return nextData;
    });
  };

  // Clamp selected day whenever the month changes (e.g. 31 -> 28 in February)
  useEffect(() => {
    const max = getDaysInMonth(data.meta);
    if (currentDay > max) setCurrentDay(max);
  }, [data.meta.monthNum, data.meta.year]);

  // Enforce sidebar auto-hide whenever a document view is active (all paths)
  useEffect(() => {
    if (currentView === 'doc' || currentView === 'doclist') {
      setIsSidebarOpen(false);
      if (window.innerWidth >= 1024) setSidebarCollapsed(true);
    }
  }, [currentView, currentDocKey]);

  // Workers actions
  const handleAddWorker = () => {
    setData((prev) => {
      const newWorker: Worker = {
        id: `w_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: '',
        job: '',
        phone: '',
      };
      const updated = [...prev.workers, newWorker];
      const nextData = { ...prev, workers: updated };
      saveToStorage(nextData);
      return nextData;
    });
    showToast('تمت إضافة سطر لعامل جديد');
  };

  const handleUpdateWorker = (index: number, field: keyof Worker, value: string) => {
    setData((prev) => {
      const updated = [...prev.workers];
      updated[index] = { ...updated[index], [field]: value };
      const nextData = { ...prev, workers: updated };
      saveToStorage(nextData);
      return nextData;
    });
  };

  const handleDeleteWorker = (index: number) => {
    const worker = data.workers[index];
    setConfirmModal({
      isOpen: true,
      title: 'حذف عامل من السجل',
      message: `هل أنت متأكد من حذف "${worker.name || 'هذا العامل'}" من قائمة العمال الرسمية؟`,
      onConfirm: () => {
        setData((prev) => {
          const updated = [...prev.workers];
          updated.splice(index, 1);
          const nextData = { ...prev, workers: updated };
          saveToStorage(nextData);
          return nextData;
        });
        setConfirmModal((m) => ({ ...m, isOpen: false }));
        showToast('تم حذف العامل من القائمة');
      },
    });
  };

  // Meals library actions
  const handleAddMeal = (meal: Omit<MealTemplate, 'id'>) => {
    setData((prev) => {
      const item: MealTemplate = {
        ...meal,
        id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      };
      const nextData = { ...prev, mealLibrary: [...prev.mealLibrary, item] };
      saveToStorage(nextData);
      return nextData;
    });
    showToast('تمت إضافة الوجبة إلى المكتبة');
  };

  const handleUpdateMeal = (id: string, patch: Partial<MealTemplate>) => {
    setData((prev) => {
      const updated = prev.mealLibrary.map((m) => (m.id === id ? { ...m, ...patch } : m));
      const nextData = { ...prev, mealLibrary: updated };
      saveToStorage(nextData);
      return nextData;
    });
  };

  const handleDeleteMeal = (id: string) => {
    const meal = data.mealLibrary.find((m) => m.id === id);
    setConfirmModal({
      isOpen: true,
      title: 'حذف وجبة من المكتبة',
      message: `هل أنت متأكد من حذف "${meal?.name || 'هذه الوجبة'}" من مكتبة الوجبات؟`,
      onConfirm: () => {
        setData((prev) => {
          const nextData = { ...prev, mealLibrary: prev.mealLibrary.filter((m) => m.id !== id) };
          saveToStorage(nextData);
          return nextData;
        });
        setConfirmModal((m) => ({ ...m, isOpen: false }));
        showToast('تم حذف الوجبة من المكتبة');
      },
    });
  };

  // Clear day with confirmation
  const handleClearDay = () => {
    setConfirmModal({
      isOpen: true,
      title: 'تفريغ تقرير اليوم',
      message: `هل أنت متأكد من حذف جميع بيانات اليوم ${currentDay}؟ لا يمكن التراجع عن هذه الخطوة.`,
      onConfirm: () => {
        handleUpdateDay(currentDay, () => createEmptyDay());
        setConfirmModal((m) => ({ ...m, isOpen: false }));
        showToast(`تم تفريغ بيانات اليوم ${currentDay}`);
      },
    });
  };

  // Navigation helpers
  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarCollapsed(false);
      setIsSidebarOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };
  const handleNavigate = (view: NavView, arg?: any) => {
    setCurrentView(view);
    if (view === 'day' && typeof arg === 'number') {
      const max = getDaysInMonth(data.meta);
      setCurrentDay(Math.min(Math.max(1, arg), max));
    }
    if (view === 'doc' && typeof arg === 'string') {
      setCurrentDocKey(arg);
    }
    setIsSidebarOpen(false);
    // Auto-hide sidebar on desktop when opening documents area (more reading space)
    if ((view === 'doc' || view === 'doclist') && window.innerWidth >= 1024) {
      setSidebarCollapsed(true);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Print triggers
  const openPrintModal = (title: string, content: React.ReactNode) => {
    setActivePrintContent(content);
    setPrintModal({
      isOpen: true,
      title,
      content,
    });
  };

  const handlePrintDay = (blank: boolean = false) => {
    const title = `التقرير اليومي — اليوم ${currentDay}${blank ? ' (نسخة فارغة)' : ''}`;
    const content = (
      <PrintSheetRenderer
        type="day"
        data={data}
        dayNum={currentDay}
        blank={blank}
      />
    );
    openPrintModal(title, content);
  };

  const handlePrintWorkers = () => {
    const title = 'القائمة الرسمية للعمال والموظفين';
    const content = <PrintSheetRenderer type="workers" data={data} />;
    openPrintModal(title, content);
  };

  const handlePrintDoc = (key: string, blank: boolean = false) => {
    const docInfo = DOC_LIST.find((d) => d.key === key);
    const title = `${docInfo?.title || 'وثيقة'}${blank ? ' (نسخة فارغة)' : ''}`;
    const content = (
      <PrintSheetRenderer
        type="doc"
        data={data}
        docKey={key}
        blank={blank}
      />
    );
    openPrintModal(title, content);
  };

  // Export JSON Backup
  const handleExportBackup = () => {
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const cleanInstName = (data.meta.institution || 'تقرير_المقتصد').replace(/\s+/g, '_');
      a.href = url;
      a.download = `${cleanInstName}_${data.meta.monthName}_${data.meta.year.replace(/\s+/g, '')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('تم تنزيل النسخة الاحتياطية بنجاح ✓');
    } catch (e) {
      console.error(e);
      showToast('فشل في تصدير النسخة الاحتياطية', 'error');
    }
  };

  // Import JSON Backup
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        setConfirmModal({
          isOpen: true,
          title: 'استيراد نسخة احتياطية',
          message: 'سيتم استبدال جميع بيانات التطبيق بالبيانات الموجودة في الملف المستورد. هل ترغب في المتابعة؟',
          onConfirm: () => {
            const defaults = getDefaultAppData();
            const mergedData: AppData = {
              meta: { ...defaults.meta, ...(imported.meta || {}) },
              workers: imported.workers || defaults.workers,
              mealLibrary: imported.mealLibrary ?? defaults.mealLibrary,
              days: imported.days || {},
              docs: imported.docs || {},
              docRegistry: imported.docRegistry || {},
            };
            setData(mergedData);
            saveToStorage(mergedData);
            setConfirmModal((m) => ({ ...m, isOpen: false }));
            showToast('تم استيراد البيانات وتحديث المنظومة بنجاح ✓');
            setCurrentView('dashboard');
          },
        });
      } catch (err) {
        console.error(err);
        showToast('تعذر قراءة الملف — تأكد من صحة ملف JSON المستورد', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Document Registry counts
  const docRegistryCount: Record<string, number> = {};
  DOC_LIST.forEach((d) => {
    docRegistryCount[d.key] = (data.docRegistry[d.key] || []).length;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f4ed] dark:bg-slate-950 text-[#1c2e24] dark:text-slate-100 transition-colors" dir="rtl">
      {/* Hidden file input for backup restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".json,application/json"
        className="hidden"
      />

      {/* Splash Entrance Modal */}
      {showSplash && (
        <SplashModal
          data={data}
          onEnter={() => {
            setShowSplash(false);
            try {
              localStorage.setItem(SPLASH_SEEN_KEY, 'true');
            } catch {
              // Ignore in sandboxed iframes
            }
          }}
        />
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((m) => ({ ...m, isOpen: false }))}
      />

      {/* Print Preview Modal */}
      <PrintPreviewModal
        isOpen={printModal.isOpen}
        title={printModal.title}
        onClose={() => setPrintModal((m) => ({ ...m, isOpen: false }))}
      >
        {printModal.content}
      </PrintPreviewModal>

      {/* Dedicated Print Sheet for window.print() */}
      <div id="print-sheet-root" className="hidden print:block">
        {activePrintContent || (
          <PrintSheetRenderer
            type="day"
            data={data}
            dayNum={currentDay}
          />
        )}
      </div>

      {/* Main Application Container */}
      <div id="app-root" className="flex flex-1 min-h-screen">
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          currentDay={currentDay}
          meta={data.meta}
          isOpen={isSidebarOpen}
          collapsed={sidebarCollapsed}
          onClose={() => {
            setIsSidebarOpen(false);
            if (window.innerWidth >= 1024) setSidebarCollapsed(true);
          }}
          onSelectView={(v) => handleNavigate(v)}
          onSelectDay={(d) => handleNavigate('day', d)}
          onSelectDoc={(key) => handleNavigate('doc', key)}
          onBackToLanding={() => setShowSplash(true)}
          isDayFilled={isDayFilled}
        />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col">
          <Header
            meta={data.meta}
            currentView={currentView}
            currentDay={currentDay}
            onSelectDay={(d) => handleNavigate('day', d)}
            onToggleSidebar={handleToggleSidebar}
            onExport={handleExportBackup}
            onImportClick={() => fileInputRef.current?.click()}
            onQuickPrint={() => {
              if (currentView === 'day') handlePrintDay(false);
              else if (currentView === 'doc') handlePrintDoc(currentDocKey, false);
              else if (currentView === 'workers') handlePrintWorkers();
              else handlePrintDay(false);
            }}
            onGoDashboard={() => handleNavigate('dashboard')}
            onOpenSplash={() => setShowSplash(true)}
            darkMode={darkMode}
            onToggleDarkMode={toggleDarkMode}
            lastSavedText={lastSavedText}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {/* View Switcher */}
            {currentView === 'dashboard' && (
              <DashboardView
                data={data}
                currentDay={currentDay}
                onNavigate={handleNavigate}
                onExport={handleExportBackup}
                onImportClick={() => fileInputRef.current?.click()}
                onPrintCurrentDay={() => handlePrintDay(false)}
                isDayFilled={isDayFilled}
              />
            )}

            {currentView === 'day' && (
              <DayReportView
                data={data}
                dayNum={currentDay}
                onUpdateDay={handleUpdateDay}
                onPrevDay={() => {
                  if (currentDay > 1) setCurrentDay((d) => d - 1);
                }}
                onNextDay={() => {
                  const max = getDaysInMonth(data.meta);
                  if (currentDay < max) setCurrentDay((d) => d + 1);
                }}
                onPrintDay={handlePrintDay}
                onClearDay={handleClearDay}
                onSave={() => {
                  saveToStorage(data);
                  showToast('تم حفظ التقرير اليومي بنجاح ✓');
                }}
                lastSavedText={lastSavedText}
              />
            )}

            {currentView === 'doclist' && (
              <DocListView
                onSelectDoc={(key) => handleNavigate('doc', key)}
                onPrintDocBlank={(key) => handlePrintDoc(key, true)}
                docRegistryCount={docRegistryCount}
              />
            )}

            {currentView === 'doc' && (
              <DocDetailView
                data={data}
                docKey={currentDocKey}
                onBack={() => handleNavigate('doclist')}
                onUpdateDocData={handleUpdateDocData}
                onUpdateRegistry={handleUpdateRegistry}
                onPrintDoc={handlePrintDoc}
                onSave={() => {
                  saveToStorage(data);
                  showToast('تم حفظ بيانات الوثيقة بنجاح ✓');
                }}
                lastSavedText={lastSavedText}
              />
            )}

            {currentView === 'workers' && (
              <WorkersView
                workers={data.workers}
                onAddWorker={handleAddWorker}
                onUpdateWorker={handleUpdateWorker}
                onDeleteWorker={handleDeleteWorker}
                onPrintWorkers={handlePrintWorkers}
              />
            )}

            {currentView === 'meals' && (
              <MealsLibraryView
                library={data.mealLibrary}
                onAddMeal={handleAddMeal}
                onUpdateMeal={handleUpdateMeal}
                onDeleteMeal={handleDeleteMeal}
              />
            )}

            {currentView === 'settings' && (
              <SettingsView
                meta={data.meta}
                onUpdateMeta={handleUpdateMeta}
                onSave={() => {
                  saveToStorage(data);
                  showToast('تم حفظ وتحديث بيانات المؤسسة بنجاح ✓');
                }}
                lastSavedText={lastSavedText}
                darkMode={darkMode}
                onToggleDarkMode={toggleDarkMode}
              />
            )}
          </main>
        </div>
      </div>

      {/* Floating Status Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
