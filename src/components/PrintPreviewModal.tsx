import React, { useState } from 'react';
import { Printer, X, FileDown, Loader2 } from 'lucide-react';
import { exportToPdf } from '../utils/exportUtils';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  const [busy, setBusy] = useState(false);

  const handlePrint = () => {
    const prev = document.title;
    document.title = title;
    window.print();
    document.title = prev;
  };

  const handleDownloadPdf = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await exportToPdf(title);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/80 backdrop-blur-xs no-print">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-3.5 bg-slate-900 border-b border-slate-700 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold">{title}</h3>
            <p className="text-xs text-slate-400">معاينة جاهزة للطباعة على ورق قياس A4</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={busy}
            title="تحميل ملف PDF مباشرة"
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-60 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            {busy ? 'جاري إنشاء PDF...' : 'تحميل PDF'}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            طباعة المستند الآن
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
            إغلاق
          </button>
        </div>
      </div>

      {/* Hint to remove browser URL footer (Netlify link) */}
      <div className="px-6 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 font-semibold">
        لإخفاء رابط الموقع (netlify) من الورقة المطبوعة: في نافذة الطباعة أزل علامة «الرؤوس والتذييلات / Headers and footers».
      </div>

      {/* Preview paper body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-slate-800/60">
        <div id="print-preview-content" className="w-full max-w-[850px] bg-white text-slate-900 rounded-xl shadow-2xl p-8 md:p-12 border border-slate-200 my-auto">
          {children}
        </div>
      </div>
    </div>
  );
};
