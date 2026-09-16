import React from 'react';
import { NavView, InstitutionMeta } from '../types';
import { 
  LayoutDashboard, 
  CalendarDays, 
  FolderArchive, 
  Users, 
  Settings, 
  X, 
  CheckCircle2, 
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  currentView: NavView;
  currentDay: number;
  meta: InstitutionMeta;
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: NavView) => void;
  onSelectDay: (day: number) => void;
  isDayFilled: (day: number) => boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  currentDay,
  meta,
  isOpen,
  onClose,
  onSelectView,
  onSelectDay,
  isDayFilled,
}) => {
  const navItems = [
    { id: 'dashboard' as NavView, label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'day' as NavView, label: 'التقرير اليومي', icon: CalendarDays },
    { id: 'doclist' as NavView, label: 'الوثائق الإدارية (19)', icon: FolderArchive },
    { id: 'workers' as NavView, label: 'قائمة العمال', icon: Users },
    { id: 'settings' as NavView, label: 'معلومات المؤسسة', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden no-print"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed lg:sticky top-0 right-0 z-40 h-screen w-72 bg-slate-900 text-slate-100 flex flex-col border-l border-slate-800 transition-transform duration-300 ease-in-out no-print ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-950/50">
              🇩🇿
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wide">
                التقرير اليومي للمقتصد
              </div>
              <div className="text-xs text-emerald-400 font-medium truncate max-w-[150px]">
                {meta.institution || 'مصلحة التسيير المادي'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* Main Views */}
          <div className="space-y-1">
            <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              الأقسام الرئيسية
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectView(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600/90 text-white shadow-sm shadow-emerald-900/50 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Days Calendar Grid */}
          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between px-3 pb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                أيام الشهر ({meta.monthName || 'أفريل'})
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                31 يوم
              </span>
            </div>

            <div className="grid grid-cols-6 gap-1.5 px-1">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                const filled = isDayFilled(d);
                const active = currentView === 'day' && currentDay === d;
                return (
                  <button
                    key={d}
                    onClick={() => {
                      onSelectDay(d);
                      onClose();
                    }}
                    title={`اليوم ${d} ${filled ? '(مكتمل جزئيًا)' : ''}`}
                    className={`relative aspect-square flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-900/50 scale-105 z-10'
                        : filled
                        ? 'bg-slate-800 text-emerald-300 border border-emerald-500/30 hover:bg-slate-700'
                        : 'bg-slate-800/40 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {d}
                    {filled && !active && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="truncate">
              <div className="font-semibold text-slate-300">نظام محلي آمن</div>
              <div className="text-[10px] text-slate-500">حفظ تلقائي للمعلومات</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
