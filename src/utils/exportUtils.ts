/** Export the current print preview as PDF (via print dialog) or Word (.doc). */

function getPreviewHtml(): string {
  const el = document.getElementById('print-preview-content');
  if (el) return el.innerHTML;
  const fallback = document.getElementById('print-sheet-root');
  return fallback ? fallback.innerHTML : document.body.innerHTML;
}

/** Absolute URLs of the app stylesheets so the exported window renders identically. */
function getStyleLinks(): string {
  return Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map((l) => {
      const href = l.getAttribute('href') || '';
      if (!href) return '';
      const abs = new URL(href, document.baseURI).href;
      return `<link rel="stylesheet" href="${abs}">`;
    })
    .join('\n');
}

function getInlineStyles(): string {
  return Array.from(document.querySelectorAll('style'))
    .map((s) => s.textContent || '')
    .join('\n');
}

/** Build a window whose rendering matches the on-screen preview (same CSS). */
function buildMatchingHtml(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
${getStyleLinks()}
<style>${getInlineStyles()}</style>
<style>
  body { background: #fff !important; color: #000; padding: 12px; }
  @page { size: A4 portrait; margin: 10mm 12mm; }
</style>
</head>
<body>
<div id="print-sheet-root" style="display:block !important;position:static !important;">
<div class="space-y-4" dir="rtl">${bodyHtml}</div>
</div>
</body>
</html>`;
}

function openPrintWindow(title: string, html: string, afterOpen: (win: Window) => void) {
  const win = window.open('', '_blank', 'width=1000,height=800');
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
  // Wait for stylesheets + fonts so the output matches the preview.
  const done = () => setTimeout(() => afterOpen(win), 600);
  if (win.document.readyState === 'complete') done();
  else win.onload = done;
}

/** Open a window styled exactly like the preview, then trigger print (user can choose "Save as PDF"). */
export function exportToPdf(title: string) {
  openPrintWindow(title, buildMatchingHtml(title, getPreviewHtml()), (win) => {
    win.print();
  });
}

/** ---- Exact-match color support: convert modern CSS colors to Word-safe rgb() ---- */
function clamp255(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}
function oklchToRgb(l: number, c: number, hDeg: number): [number, number, number] {
  const h = (hDeg * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;
  const l3 = l_ ** 3;
  const m3 = m_ ** 3;
  const s3 = s_ ** 3;
  const r1 = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const g1 = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const b1 = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;
  const f = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
  return [clamp255(f(r1) * 255), clamp255(f(g1) * 255), clamp255(f(b1) * 255)];
}
function parseAlpha(a?: string): number {
  if (!a) return 1;
  const t = a.trim();
  return t.endsWith('%') ? parseFloat(t) / 100 : parseFloat(t);
}
function splitTopLevel(s: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  parts.push(cur);
  return parts;
}
function colorToRgb(value: string): [number, number, number, number] | null {
  const v = value.trim().toLowerCase();
  if (!v || v === 'transparent' || v === 'none') return null;
  let m = v.match(/^#([0-9a-f]{6})$/);
  if (m) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16), 1];
  m = v.match(/^#([0-9a-f]{3})$/);
  if (m) {
    const p = (i: number) => parseInt(m![1][i] + m![1][i], 16);
    return [p(0), p(1), p(2), 1];
  }
  m = v.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)$/);
  if (m) return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]), m[4] !== undefined ? parseFloat(m[4]) : 1];
  m = v.match(/^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.%]+))?\s*\)$/);
  if (m) {
    const lRaw = m[1];
    const L = lRaw.endsWith('%') ? parseFloat(lRaw) / 100 : parseFloat(lRaw);
    const [r, g, b] = oklchToRgb(L, parseFloat(m[2]), parseFloat(m[3]));
    return [r, g, b, parseAlpha(m[4])];
  }
  m = v.match(/^color-mix\(\s*in\s+[^,]+,\s*(.+)\)$/);
  if (m) {
    const parts = splitTopLevel(m[1]);
    if (parts.length === 2) {
      const pw = (s: string) => {
        const mm = s.trim().match(/([\d.]+)%\s*$/);
        return mm ? parseFloat(mm[1]) / 100 : 1;
      };
      const cs = (s: string) => s.trim().replace(/\s+[\d.]+%\s*$/, '');
      const c1 = colorToRgb(cs(parts[0]));
      const c2 = colorToRgb(cs(parts[1]));
      if (c1 && c2) {
        const w1 = pw(parts[0]);
        const w2 = pw(parts[1]);
        const tot = w1 + w2 || 1;
        return [(c1[0] * w1 + c2[0] * w2) / tot, (c1[1] * w1 + c2[1] * w2) / tot, (c1[2] * w1 + c2[2] * w2) / tot, 1];
      }
    }
    return null;
  }
  const named: Record<string, [number, number, number]> = {
    black: [0, 0, 0],
    white: [255, 255, 255],
  };
  if (named[v]) return [named[v][0], named[v][1], named[v][2], 1];
  return null;
}
function resolveColorForWord(value: string): string | null {
  const c = colorToRgb(value);
  if (!c) return null;
  const [r, g, b, a] = c;
  if (a <= 0) return null;
  if (a < 1) {
    const f = (x: number) => Math.round(x * a + 255 * (1 - a));
    return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
  }
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}
const COLOR_PROPS = new Set([
  'color',
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
]);

/** Word has no flexbox: render flex rows as side-by-side table cells instead. */
function applyWordFlexTables(root: HTMLElement) {
  const divs = Array.from(root.querySelectorAll('div')) as HTMLElement[];
  for (const f of divs) {
    const cls = f.getAttribute('class') || '';
    if (!/\bflex\b/.test(cls)) continue;
    f.style.display = 'table';
    f.style.width = '100%';
    (f.style as any).borderSpacing = '6px';
    const kids = Array.from(f.children).filter((k) => k.tagName === 'DIV') as HTMLElement[];
    if (kids.length > 0) {
      const w = `${(100 / kids.length).toFixed(1)}%`;
      kids.forEach((k) => {
        k.style.display = 'table-cell';
        k.style.width = w;
        k.style.verticalAlign = 'top';
      });
    }
  }
}

/** Word-safe explicit styles for the utility classes used in the print sheets
 * (Tailwind v4 emits oklch()/color-mix() which Word cannot render). */
function applyWordFallbacks(root: HTMLElement) {
  const all: HTMLElement[] = [root, ...(Array.from(root.querySelectorAll('*')) as HTMLElement[])];
  for (const el of all) {
    const cls = ` ${el.getAttribute('class') || ''} `;
    const extra: string[] = [];
    if (cls.includes('bg-slate-100')) extra.push('background-color:#f1f5f9');
    else if (cls.includes('bg-slate-200')) extra.push('background-color:#e2e8f0');
    else if (cls.includes('bg-slate-50')) extra.push('background-color:#f8fafc');
    if (cls.includes('border-black')) {
      extra.push('border-color:#000000');
    }
    if (/(^|\s)(border|border-t|border-b|border-l|border-r)(\s|$)/.test(cls.trim().replace(/border-black/g, '').replace(/border-collapse/g, '')) || cls.includes('border-black')) {
      extra.push('border-width:1px', 'border-style:solid');
    }
    if (/(^|\s)border-collapse(\s|$)/.test(` ${cls} `)) extra.push('border-collapse:collapse');
    if (cls.includes('text-center')) extra.push('text-align:center');
    if (cls.includes('font-bold') || cls.includes('font-black') || cls.includes('font-semibold')) extra.push('font-weight:bold');
    if (el.tagName === 'TABLE') {
      extra.push('width:100%', 'border-collapse:collapse');
    }
    if ((el.tagName === 'TD' || el.tagName === 'TH') && !/border-color/i.test(el.getAttribute('style') || '')) {
      extra.push('border-width:1px', 'border-style:solid', 'border-color:#000000');
    }
    if (extra.length) {
      const prev = el.getAttribute('style') || '';
      el.setAttribute('style', `${prev};${extra.join(';')}`);
    }
  }
}

/** Old-school table attributes: rendered by every Word version and phone viewer. */
function applyWordTableAttributes(root: HTMLElement) {
  const tables = Array.from(root.querySelectorAll('table'));
  for (const t of tables) {
    t.setAttribute('border', '1');
    t.setAttribute('cellpadding', '5');
    t.setAttribute('cellspacing', '0');
    t.setAttribute('width', '100%');
  }
  const heads = Array.from(root.querySelectorAll('thead th, thead td, tfoot td'));
  for (const h of heads) {
    (h as HTMLElement).setAttribute('bgcolor', '#E2E8F0');
  }
  const titles = Array.from(root.querySelectorAll('h2'));
  for (const h of titles) {
    (h as HTMLElement).setAttribute('align', 'center');
  }
}

/** Copy the real on-screen computed styles inline so Word renders like the preview. */
function inlineComputedStyles(root: HTMLElement): HTMLElement {
  const clone = root.cloneNode(true) as HTMLElement;
  applyWordFallbacks(clone);
  applyWordTableAttributes(clone);
  applyWordFlexTables(clone);
  const srcEls: HTMLElement[] = [root, ...(Array.from(root.querySelectorAll('*')) as HTMLElement[])];
  const dstEls: HTMLElement[] = [clone, ...(Array.from(clone.querySelectorAll('*')) as HTMLElement[])];
  const props = [
    'color', 'background-color',
    'font-size', 'font-weight', 'font-family', 'line-height', 'text-align', 'vertical-align',
    'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
    'margin-top', 'margin-bottom',
    'border-collapse',
    'border-top-width', 'border-top-style', 'border-top-color',
    'border-right-width', 'border-right-style', 'border-right-color',
    'border-bottom-width', 'border-bottom-style', 'border-bottom-color',
    'border-left-width', 'border-left-style', 'border-left-color',
    'width',
  ];
  srcEls.forEach((src, i) => {
    let cs: CSSStyleDeclaration;
    try {
      cs = window.getComputedStyle(src);
    } catch {
      return;
    }
    const dst = dstEls[i];
    if (!dst) return;
    const parts: string[] = [];
    for (const p of props) {
      try {
        const v = cs.getPropertyValue(p);
        if (!v || v === '') continue;
        if (COLOR_PROPS.has(p)) {
          const resolved = resolveColorForWord(v);
          if (resolved) parts.push(`${p}:${resolved}`);
        } else if (!/oklch|oklab|color-mix|var\(/.test(v)) {
          parts.push(`${p}:${v}`);
        }
      } catch {
        /* ignore unreadable property */
      }
    }
    if (parts.length) {
      const prev = dst.getAttribute('style') || '';
      dst.setAttribute('style', `${prev};${parts.join(';')}`);
    }
    dst.removeAttribute('class');
    dst.removeAttribute('id');
  });
  return clone;
}

/** Download the current document as a Word-compatible .doc file (opens in MS Word). */
export function exportToWord(title: string) {
  const src = document.getElementById('print-preview-content') || document.getElementById('print-sheet-root');
  const styledHtml = src ? inlineComputedStyles(src).outerHTML : getPreviewHtml();
  const full = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8" /><title>${title}</title></head>
<body dir="rtl">${styledHtml}</body></html>`;
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
