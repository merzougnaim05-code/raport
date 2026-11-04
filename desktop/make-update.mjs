/**
 * make-update.mjs — يصنع حزمة تحيّن موقّعة من desktop/app:
 *   desktop/release/update/raport-latest.zip   (الحزمة كاملة)
 *   desktop/release/update/app-update.json     (بيان موقّع — يرفع مع الحزمة على الموقع)
 * الاستعمال:
 *   node desktop/make-update.mjs --key D:\rapport\raport-private-key.pem --desktop-version ...
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopDir = __dirname;
const appSrc = path.join(desktopDir, 'app');
const outDir = path.join(desktopDir, 'release', 'update');
const args = process.argv.slice(2);
const keyIdx = args.indexOf('--key');
const keyPath = keyIdx >= 0 ? args[keyIdx + 1] : null;
const pkg = JSON.parse(fs.readFileSync(path.join(desktopDir, 'package.json'), 'utf8'));
const version = pkg.version;

if (!fs.existsSync(appSrc)) throw new Error('desktop/app غير موجود — ابنِ الواجهة أولًا');
if (!keyPath || !fs.existsSync(keyPath)) throw new Error('مفتاح التوقيع الخاص غير موجود');

const VERSION_FIELD = { version };

function listFiles(root) {
  const out = [];
  const rec = (d) => {
    for (const it of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, it.name);
      if (it.isDirectory()) rec(p);
      else out.push(p);
    }
  };
  rec(root);
  return out;
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

// 1. حساب هشّة كل ملف (استثناء app-update.json إذا وُجد من سابق)
const files = listFiles(appSrc).map((p) => {
  const rel = path.relative(appSrc, p).split(path.sep).join('/');
  return { path: rel, sha256: crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex') };
});

// 2. كتابة بيان موقّع داخل appSrc (لان خاصية الحزمة الذاتية عند الاستيراد)
const body = JSON.stringify({ ...VERSION_FIELD, files });
let keyObj = fs.readFileSync(keyPath, 'utf8');
const signature = crypto.sign(null, Buffer.from(body, 'utf8'), {
  key: keyObj,
  format: 'pem',
  type: 'pkcs8',
}).toString('base64');
const manifest = { ...VERSION_FIELD, files, sig: signature };
fs.writeFileSync(path.join(appSrc, 'app-update.json'), JSON.stringify(manifest, null, 2));

// 3. ضغط الحزمة (PowerShell Compress-Archive؛ بلا تبعيات)
const zipPath = path.join(outDir, 'raport-latest.zip');
const ps = spawnSync('powershell.exe', [
  '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command',
  `Compress-Archive -Force -Path '${appSrc}\\*' -DestinationPath '${zipPath}'`,
], { stdio: 'inherit' });
if (ps.status !== 0) throw new Error('Compress-Archive فشل');

// 4. نسخة البيان خارج الحزمة (تُرفع على الموقع لتمكين التحيّن الآلي)
fs.writeFileSync(path.join(outDir, 'app-update.json'), JSON.stringify(manifest, null, 2));

// 5. إزالة النسخة المؤقتة من appSrc (توثيق نظيف للمرة القادمة)
fs.rmSync(path.join(appSrc, 'app-update.json'), { force: true });

console.log('UPDATE_PKG_OK', {
  zip: zipPath,
  manifest: path.join(outDir, 'app-update.json'),
  files: files.length,
  version,
});
