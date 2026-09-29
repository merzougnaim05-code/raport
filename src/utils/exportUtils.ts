/** Export the current print preview as PDF (via print dialog) or Word (.doc). */

function getPreviewHtml(): string {
  const el = document.getElementById('print-preview-content');
  if (el) return el.innerHTML;
  const fallback = document.getElementById('print-sheet-root');
  return fallback ? fallback.innerHTML : document.body.innerHTML;
}

function buildFullHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<style>
  body { font-family: 'Cairo', Arial, sans-serif; direction: rtl; color: #000; background: #fff; padding: 20px; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; }
  th, td { border: 1px solid #000; padding: 6px; font-size: 12px; }
  h2 { text-align: center; }
  @page { size: A4 portrait; margin: 10mm 12mm; }
</style>
</head>
<body>${bodyHtml}</body>
</html>`;
}

/** Open a clean window containing only the document, then trigger print (user can choose "Save as PDF"). */
export function exportToPdf(title: string) {
  const html = buildFullHtml(title, getPreviewHtml());
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) {
    // Popup blocked: fallback to direct print of the page.
    const prev = document.title;
    document.title = title;
    window.print();
    document.title = prev;
    return;
  }
  win.document.write(html);
  win.document.close();
  win.focus();
  // Give the new window a moment to render fonts before printing.
  setTimeout(() => {
    win.print();
  }, 400);
}

/** Download the current document as a Word-compatible .doc file (opens in MS Word). */
export function exportToWord(title: string) {
  const bodyHtml = getPreviewHtml();
  const full = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8" /><title>${title}</title>
<style>body { font-family: Arial; direction: rtl; } table { border-collapse: collapse; width: 100%; } th, td { border: 1px solid #000; padding: 6px; }</style>
</head><body>${bodyHtml}</body></html>`;
  const blob = new Blob(['\ufeff', full], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safe = title.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_');
  a.href = url;
  a.download = `${safe || 'document'}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
