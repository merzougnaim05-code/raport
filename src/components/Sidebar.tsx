import React, { useState } from 'react';
import { NavView, InstitutionMeta } from '../types';
import { DOC_LIST } from '../data/documentsConfig';
import { getWeekdayName, getDaysInMonth, getCanonicalMonthName } from '../utils/dateUtils';
import { 
  LayoutDashboard, 
  CalendarDays, 
  FolderArchive, 
  Users, 
  Settings, 
  X, 
  CheckCircle2, 
  ShieldCheck,
  Search,
  FileText,
  Utensils,
  Home
} from 'lucide-react';

interface SidebarProps {
  currentView: NavView;
  currentDay: number;
  meta: InstitutionMeta;
  isOpen: boolean;
  collapsed: boolean;
  onClose: () => void;
  onSelectView: (view: NavView) => void;
  onSelectDay: (day: number) => void;
  onSelectDoc: (key: string) => void;
  onBackToLanding: () => void;
  isDayFilled: (day: number) => boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  currentDay,
  meta,
  isOpen,
  collapsed,
  onClose,
  onSelectView,
  onSelectDay,
  onSelectDoc,
  onBackToLanding,
  isDayFilled,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const q = searchTerm.trim().toLowerCase();
  const showResults = q.length > 0;
  const daysInMonth = getDaysInMonth(meta);
  const displayMonth = getCanonicalMonthName(meta.monthNum) || meta.monthName || 'أفريل';

  const matchedDays = showResults
    ? Array.from({ length: daysInMonth }, (_, i) => i + 1).filter((d) => {
        const wd = getWeekdayName(d, meta);
        return (
          String(d).includes(q) ||
          `اليوم ${d}`.includes(searchTerm.trim()) ||
          (wd && wd.includes(searchTerm.trim()))
        );
      }).slice(0, 8)
    : [];

  const matchedDocs = showResults
    ? DOC_LIST.filter(
        (doc) =>
          doc.title.toLowerCase().includes(q) ||
          (doc.subtitleFr && doc.subtitleFr.toLowerCase().includes(q))
      ).slice(0, 8)
    : [];
  const navItems = [
    { id: 'dashboard' as NavView, label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'day' as NavView, label: 'التقرير اليومي', icon: CalendarDays },
    { id: 'meals' as NavView, label: 'مكتبة الوجبات', icon: Utensils },
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
        className={`fixed lg:sticky top-3 right-3 z-40 h-[calc(100vh-1.5rem)] w-72 shrink-0 bg-gradient-to-b from-[#215a3e] to-[#174a32] text-slate-100 flex flex-col rounded-3xl border border-[#fcbb00]/40 shadow-2xl transition-transform duration-300 ease-in-out no-print ${
          collapsed ? 'hidden' : ''
        } ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#f7f4ed] border-2 border-[#fcbb00] text-white flex items-center justify-center text-lg shadow-md shrink-0">
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
            title="إخفاء الشريط الجانبي"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* Global instant search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث فوري: يوم، وثيقة..."
              className="w-full text-xs pr-10 pl-3 py-2.5 rounded-xl border border-white/15 bg-[#174a32]/80 text-white placeholder:text-emerald-100/50 focus:bg-[#174a32] focus:ring-2 focus:ring-[#fcbb00]/40 focus:border-[#fcbb00]/60 focus:outline-none"
            />
          </div>

          {showResults ? (
            <div className="space-y-4">
              {matchedDays.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    الأيام
                  </div>
                  {matchedDays.map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        onSelectDay(d);
                        setSearchTerm('');
                        onClose();
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <span>اليوم {d} — {getWeekdayName(d, meta)}</span>
                      {isDayFilled(d) && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              )}
              {matchedDocs.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    الوثائق
                  </div>
                  {matchedDocs.map((doc) => (
                    <button
                      key={doc.key}
                      onClick={() => {
                        onSelectDoc(doc.key);
                        setSearchTerm('');
                        onClose();
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer text-right"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{doc.title}</span>
                    </button>
                  ))}
                </div>
              )}
              {matchedDays.length === 0 && matchedDocs.length === 0 && (
                <div className="text-center text-xs text-slate-500 py-4">
                  لا نتائج مطابقة لـ «{searchTerm.trim()}»
                </div>
              )}
            </div>
          ) : (
            <>
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
                      ? 'bg-[#fcbb00] text-[#1c2e24] font-black shadow-sm'
                      : 'text-emerald-50/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#1c2e24]' : 'text-emerald-200/80'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Days Calendar Grid */}
          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            <div className="flex items-center justify-between px-3 pb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                أيام الشهر ({displayMonth})
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                {daysInMonth} يوم
              </span>
            </div>

            <div className="grid grid-cols-6 gap-1.5 px-1">
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
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
                        ? 'bg-[#fcbb00] text-[#1c2e24] font-black shadow-md scale-105 z-10'
                        : filled
                        ? 'bg-white/10 text-[#fcbb00] border border-[#fcbb00]/30 hover:bg-white/20'
                        : 'bg-white/5 text-emerald-100/70 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    {d}
                    {filled && !active && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#fcbb00]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/20 space-y-3">
          <button
            onClick={() => {
              onBackToLanding();
              onClose();
            }}
            title="العودة إلى شاشة الواجهة الرئيسية"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-black transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4 text-[#fcbb00]" />
            <span>العودة إلى الواجهة</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="truncate">
              <div className="font-semibold text-slate-300">نظام محلي آمن</div>
              <div className="text-[10px] text-slate-500">حفظ تلقائي للمعلومات • إصدار 2.3</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
