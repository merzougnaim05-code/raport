/** Export the current print preview as a real downloadable PDF file. */
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

function getPreviewElement(): HTMLElement | null {
  return (
    document.getElementById('print-preview-content') ||
    document.getElementById('print-sheet-root')
  );
}

/** ---- Convert modern CSS colors (oklch / color-mix) to rgb() ---- */
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
  if (v === 'black') return [0, 0, 0, 1];
  if (v === 'white') return [255, 255, 255, 1];
  return null;
}
function resolveColor(value: string): string | null {
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

const COLOR_PROPS = [
  'color',
  'background-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
];

/**
 * Render the preview to a real .pdf file (screenshot → A4 pages).
 * Colors are pre-resolved to rgb() so the capture matches the screen exactly.
 */
export async function exportToPdf(title: string): Promise<void> {
  const src = getPreviewElement();
  if (!src) {
    window.print();
    return;
  }

  try {
    await renderAndSavePdf(src, title);
  } catch (err) {
    console.error('PDF export failed, falling back to print:', err);
    window.print();
  }
}

async function renderAndSavePdf(src: HTMLElement, title: string): Promise<void> {

  // Off-screen clone at A4-friendly width, styled by the same document CSS.
  const wrapper = document.createElement('div');
  wrapper.style.cssText =
    'position:fixed;left:-12000px;top:0;width:834px;background:#ffffff;padding:20px;z-index:-1;';
  const clone = src.cloneNode(true) as HTMLElement;
  clone.removeAttribute('id');
  clone.style.width = '794px';
  clone.style.maxWidth = '794px';
  clone.style.margin = '0';
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    // Pre-resolve modern colors to rgb() for the capture engine.
    const oEls = [src, ...Array.from(src.querySelectorAll('*'))];
    const cEls = [clone, ...Array.from(clone.querySelectorAll('*'))];
    oEls.forEach((o, i) => {
      const c = cEls[i] as HTMLElement | undefined;
      if (!c) return;
      let cs: CSSStyleDeclaration;
      try {
        cs = window.getComputedStyle(o as Element);
      } catch {
        return;
      }
      for (const p of COLOR_PROPS) {
        try {
          const v = cs.getPropertyValue(p);
          if (!v) continue;
          const resolved = resolveColor(v);
          if (resolved) c.style.setProperty(p, resolved);
        } catch {
          /* ignore */
        }
      }
    });

    const canvas = await html2canvas(clone, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });

    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const pageW = 210;
    const pageH = 297;
    const margin = 10;
    const usableW = pageW - margin * 2;
    const usableH = pageH - margin * 2;
    const pxPerMm = canvas.width / usableW;
    const pagePxH = Math.floor(usableH * pxPerMm);

    let y = 0;
    let first = true;
    while (y < canvas.height) {
      const h = Math.min(pagePxH, canvas.height - y);
      const page = document.createElement('canvas');
      page.width = canvas.width;
      page.height = h;
      const ctx = page.getContext('2d');
      if (!ctx) break;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, page.width, page.height);
      ctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
      if (!first) pdf.addPage();
      pdf.addImage(page.toDataURL('image/jpeg', 0.95), 'JPEG', margin, margin, usableW, (h * usableW) / canvas.width);
      y += h;
      first = false;
    }

    const safe = title.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_');
    pdf.save(`${safe || 'document'}.pdf`);
  } finally {
    wrapper.remove();
  }
}
