/**
 * Raport-Portable (Electron) â€” طھط·ط¨ظٹظ‚ ط³ط·ط­ ظ…ظƒطھط¨ ط¨ظ…ط¹ظٹط§ط± ظˆظ‚ط§ظٹط©:
 * - ظٹط¹ظ…ظ„ ط¯ط§ط¦ظ…ظ‹ط§ ظ…ظ† ط§ظ„ط­ط²ظ…ط© ط§ظ„ظ…ط¯ظ…ط¬ط© (bundle) ط£ظˆ ط¢ط®ط± طھط­ظٹظ‘ظ† ظ…ط³طھظˆط±ط¯ â€” ظ„ط§ ط§طھطµط§ظ„ ظˆط§ظ„ط«ط§ط¨طھ.
 * - ط§ظ„طھط­ظٹظ‘ظ† ظپظ‚ط· ظٹط¯ظˆظٹظ‹ط§: ظ…ظ† ط§ظ„ظ…ظˆظ‚ط¹ (ط¨ظ…ظ„ظپ ظ…طھط±ط§ط¨ط· ط¨ط¹ظ„ط§ظ…ط© طھط±ط®ظٹطµ) ط£ظˆ ظ…ظ„ظپ .zip ظ…ط³طھظˆط±ط¯.
 * - طھط±ط®ظٹطµ ظ…ظ†طھظ‡ظٹط© ظپظٹ 31/12/2026 (ظ…ط¹ ظƒط´ظپ ط§ظ„طھط±ط§ط¬ط¹ ظ‚ظٹط§ط³ظٹ).
 * - ظ…ظ†ط·ظ‚ ط§ظ„طھط·ط¨ظٹظ‚ ظ…ط­ظ‚ظ† ظƒظ€ byte-code (ظٹطھط¹ظٹظ‘ظ† ط¹ظ„ظ‰ ط£ظٹ ط¬ظ‡ط© ظ‡ظ†ط¯ط³ط©/ط°ظƒط§ط، ط§طµط·ظ†ط§ط¹ظٹ ط§ط³طھط®ط±ط§ط¬ ط§ظ„ظƒظˆط¯).
 */
const { app, BrowserWindow, Menu, net, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { spawn } = require('child_process');

/* ------------------------------------------------------------------ */
/* ط«ظˆط§ط¨طھ ط§ظ„طھط±ط®ظٹطµ (ظ…ط¶ظ…ظ†ط© ظپظٹ bytenode â€” ط؛ظٹط± ظ‚ط§ط¨ظ„ط© ظ„ظ„طھط¹ط¯ظٹظ„ ط¨ط¯ظˆظ† ظ…ظپطھط§ط­ظ†ط§) */
const SITE_BASE = 'https://service-rapport.pages.dev';
const YEAR_END = Date.parse('2026-12-31T23:59:59');

/* ط§ظ„ظ…ظپطھط§ط­ ط§ظ„ط¹ط§ظ… ظ„طھط­ظٹظ‘ظ† (ط§ظ„ط®ط§طµ ظ…ط¹ظ†ط§ ظپظ‚ط·) */
const PUB = '-----BEGIN PUBLIC KEY-----\n' +
  'MCowBQYDK2VwAyEA2KTvAk3vVmmS0fW0s9RsHeGQBMC3D8fkY1orMODAOho=\n' +
  '-----END PUBLIC KEY-----\n';

/* ------------------------------------------------------------------ */
/* ط¹ط±ط¶ ظ…ط®ط²ظˆظ† ط³ط±ظٹ ظ„ظ„ط¢ط®ط± ظ…ط´ط؛ظ‘ظ„ (XOR-اتجاع)                                */
function pKey(salt) {
  return crypto.createHash('sha256').update('mostasid-raport::' + salt).digest();
}

function saveDat(file, obj) {
  try {
    const k = pKey('dat');
    const raw = Buffer.from(JSON.stringify(obj), 'utf8');
    const enc = Buffer.alloc(raw.length);
    for (let i = 0; i < raw.length; i++) enc[i] = raw[i] ^ k[i % k.length];
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, enc);
  } catch (e) { /* silent */ }
}

function loadDat(file) {
  try {
    if (!fs.existsSync(file)) return {};
    const k = pKey('dat');
    const enc = fs.readFileSync(file);
    const raw = Buffer.alloc(enc.length);
    for (let i = 0; i < enc.length; i++) raw[i] = enc[i] ^ k[i % k.length];
    return JSON.parse(raw.toString('utf8'));
  } catch (e) { return {}; }
}

/* ------------------------------------------------------------------ */
/* ظپط­طµ ط§ظ„طھط±ط®ظٹطµ                                                         */
function checkLicense(datFile) {
  const dat = loadDat(datFile);
  const now = Date.now();

  if (dat.locked === true) return { ok: false, reason: 'locked' };

  /* ظƒط´ظپ طھط±ط§ط¬ط¹ ط§ظ„ظˆظ‚طھ: ظ„ظ† ظٹط¹ظ…ظ„ ط¥ط°ط§ ظƒط§ظ†طھ ط³ط§ط¹ط© ط§ظ„ط¬ظ‡ط§ط² ط£ط¯ظ†ظ‰ ط¨~48 ط³ط§ط¹ط© ظ…ظ† ط¢ط®ط± ظ…ط±ط© */
  if (dat.lastRun && now < dat.lastRun - 48 * 3600 * 1000) {
    const locked = { ...dat, locked: true, lockedAt: now };
    saveDat(datFile, locked);
    return { ok: false, reason: 'clock' };
  }

  dat.lastRun = now;
  saveDat(datFile, dat);

  if (now > YEAR_END) return { ok: false, reason: 'expired' };

  return { ok: true };
}

/* ------------------------------------------------------------------ */
let win = null;
let gotLock = false;

function updatesRoot() { return path.join(app.getPath('userData'), 'raport-updates'); }
function currentDir() { return path.join(updatesRoot(), 'current'); }
function stageDir() { return path.join(updatesRoot(), 'stage'); }
function datFile() { return path.join(updatesRoot(), 'license.dat'); }

/** ط£ظپط¶ظ„ ط¹ظ†طµط± index ظ…ط­ظ„ظٹ ظ…طھط§ط­: ط¢ط®ط± طھط­ظٹظ‘ظ† (ط¥ظ† ط°ط§ ظ…ظˆط¬ظˆط¯) ط«ظ… ط§ظ„ط­ط²ظ…ط© ط§ظ„ظ…ط¯ظ…ط¬ط©. */
function localIndex() {
  const u = path.join(currentDir(), 'index.html');
  if (fs.existsSync(u)) return u;
  return path.join(__dirname, 'app', 'index.html');
}

function reloadInto(win) {
  try { win.loadFile(localIndex()).catch(() => {}); } catch (e) { /* noop */ }
}

/* ------------------------------------------------------------------ */
/* ط§ظ„طھط­ظٹظ‘ظ† ظ…ظ† ظ…ظ„ظپ                                                       */
function verifyManifest(m) {
  try {
    if (!m || typeof m !== 'object' || !Array.isArray(m.files) || typeof m.sig !== 'string') return false;
    const body = JSON.stringify({ version: m.version, files: m.files });
    return crypto.verify(null, Buffer.from(body, 'utf8'), PUB, Buffer.from(m.sig, 'base64'));
  } catch (e) { return false; }
}

function expandZip(zipPath, dest) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(dest, { recursive: true });
    const cmd = `Expand-Archive -Force -Path '${zipPath}' -DestinationPath '${dest}'`;
    const p = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', cmd], { stdio: 'ignore' });
    p.on('exit', (code) => code === 0 ? resolve() : reject(new Error('ظپظƒ ط§ظ„ط¶ط؛ط· ظپط´ظ„ (code ' + code + ')')));
    p.on('error', reject);
  });
}

/** ظٹطھط£ظƒط¯ ط£ظ† ظƒظ„ ظ…ظ„ظپ ظپظٹ manifest ظٹظ†ط·ط¨ظ‚ ظ…ط¹ ظ‡ط´ظ‘ظ‡ط§ طھظ…ط§ظ…ظ‹ط§. */
function verifyFiles(dir, files) {
  for (const f of files) {
    const p = path.join(dir, f.path);
    if (!fs.existsSync(p)) throw new Error('ظ…ظ„ظپ ظ…ظپظ‚ظˆط¯: ' + f.path);
    const h = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
    if (h !== f.sha256) throw new Error('ط¹ط¯ظ… طھط·ط§ط¨ظ‚ ط§ظ„ظ‡ط´ظ‘ط©: ' + f.path);
  }
}

/** ظٹط¬ظٹط¨ ظ‚ط§ط¦ظ…ط© ط§ط³طھط«ظ†ط§ط¦ظٹط© ظ…ظ† ط§ظ„ظ…ظ„ظپط§طھ ظپظٹ ظ…ط¬ظ„ط¯. */
function listFiles(root) {
  const out = [];
  const rec = (d) => {
    for (const it of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, it.name);
      if (it.isDirectory()) rec(p); else out.push(p);
    }
  };
  rec(root);
  return out;
}

/** ظٹط³طھط¨ط¯ظ„ ظ…ط¬ظ„ط¯ current ط¨ط¹ط¯ طھط­ظ‚ظ‚ ط¢ظ…ظ†. */
function commitStage() {
  const cur = currentDir();
  const stg = stageDir();
  const old = path.join(updatesRoot(), 'old');
  fs.rmSync(old, { recursive: true, force: true });
  try { fs.renameSync(cur, old); } catch (e) { /* ط£ظˆظ„ ظ…ط±ط© */ }
  fs.renameSync(stg, cur);
  fs.rmSync(old, { recursive: true, force: true });
}

async function applyUpdateFiles(win) {
  const stg = stageDir();
  const mPath = path.join(stg, 'app-update.json');
  if (!fs.existsSync(mPath)) throw new Error('ظ…ظ„ظپ ط§ظ„طھط­ظٹظ‘ظ† ظ„ط§ ظٹط¶ظ… طھط±ط®ظٹطµظ‹ط§ ظ…ط¹طھظ…ط¯ظ‹ط§');
  const m = JSON.parse(fs.readFileSync(mPath, 'utf8'));
  if (!verifyManifest(m)) throw new Error('طھظˆظ‚ظٹط¹ ظ…ظ„ظپ ط§ظ„طھط­ظٹظ‘ظ† ط؛ظٹط± ظ…ط¹طھظ…ط¯ â€” ط§ظ„ظ…ط±ط¬ط¹ ط§ظ„ظ…ط³طھط®ط¯ظ… ط؛ظٹط± ظ…ظ‚ط¨ظˆظ„');
  verifyFiles(stg, m.files);
  commitStage();
  win && win.webContents.send('raport:update-event', { type: 'done', version: m.version });
  dialog.showMessageBox(win, {
    type: 'info',
    title: 'طھظ… ط§ظ„طھط­ط¯ظٹط«',
    message: `طھظ… طھط­ظٹظ‘ظ† ط§ظ„طھط·ط¨ظٹظ‚ ط¥ظ„ظ‰ ظ†ط³ط®ط© ${m.version} ط¨ظ†ط¬ط§ط­.`,
    buttons: ['ط¥ط¹ط§ط¯ط© ط§ظ„طھط­ظ…ظٹظ„ ط§ظ„ط¢ظ†', 'ظ„ط§ط­ظ‚ظ‹ط§'],
    defaultId: 0,
  }).then(({ response }) => {
    if (response === 0 && win) reloadInto(win);
  });
}

/** طھط­ظٹظ‘ظ† ط¢ظ„ظٹ ظ…ظ† ط§ظ„ظ…ظˆظ‚ط¹: ظٹظڈظ†ط²ظ‘ظ„ ط­ط²ظ…ط© ظ…ظˆظ‚ظ‘ط¹ط© ظ…ظ† ط§ظ„ظ…ظˆظ‚ط¹. */
async function updateFromSite() {
  if (!win) return;
  try {
    if (!net.isOnline()) throw new Error('ظ„ط§ ظٹظˆط¬ط¯ ط§طھطµط§ظ„ ط¨ط§ظ„ط¥ظ†طھط±ظ†طھ');

    const mRes = await net.fetch(SITE_BASE + '/app-update.json', { cache: 'no-store' });
    const m = await mRes.json();
    if (!verifyManifest(m)) throw new Error('ظ…ظ„ظپ ط§ظ„طھط­ظٹظ‘ظ† ظ…ظ† ط§ظ„ظ…ظˆظ‚ط¹ ط؛ظٹط± ظ…ط¹طھظ…ط¯ (طھظˆظ‚ظٹط¹ ط؛ظٹط± ظ…طھظپط§ط¹ظ„)');

    const zRes = await net.fetch(SITE_BASE + '/' + m.zip, { cache: 'no-store' });
    if (!zRes.ok) throw new Error('طھط¹ط°ظ‘ط± طھط­ظ…ظٹظ„ ط­ط²ظ…ط© ط§ظ„طھط­ط¯ظٹط«');
    const zipBuf = Buffer.from(await zRes.arrayBuffer());

    const stage = stageDir();
    fs.rmSync(stage, { recursive: true, force: true });
    fs.mkdirSync(stage, { recursive: true });
    const zPath = path.join(updatesRoot(), 'latest.zip');
    fs.writeFileSync(zPath, zipBuf);
    await expandZip(zPath, stage);
    fs.rmSync(zPath, { force: true });
    await applyUpdateFiles(win);
  } catch (e) {
    dialog.showErrorBox('ظپط´ظ„ ط§ظ„طھط­ط¯ظٹط«', String(e && e.message ? e.message : e));
  }
}

/** طھط­ظٹظ‘ظ† ظٹط¯ظˆظٹ: ط§ط³طھظٹط±ط§ط¯ ظ…ظ„ظپ .zip ظ…ظˆظ‚ظ‘ط¹ (ظ†ظپط³ طµظٹط؛ط© ط§ظ„ط­ط²ظ…ط© ط§ظ„ظ…ط±ظپظˆط¹ط©). */
async function importUpdateFile() {
  if (!win) return;
  try {
    const r = await dialog.showOpenDialog(win, {
      title: 'ط§ط³طھظٹط±ط§ط¯ ظ…ظ„ظپ طھط­ظٹظ‘ظ†',
      properties: ['openFile'],
      filters: [{ name: 'ظ…ظ„ظپ طھط­ظٹظ‘ظ†', extensions: ['zip'] }],
    });
    const zipPath = r.canceled ? null : (r.filePaths && r.filePaths[0]);
    if (!zipPath) return;

    const stage = stageDir();
    fs.rmSync(stage, { recursive: true, force: true });
    await expandZip(zipPath, stage);
    await applyUpdateFiles(win);
  } catch (e) {
    dialog.showErrorBox('ظپط´ظ„ ط§ظ„ط§ط³طھظٹط±ط§ط¯', String(e && e.message ? e.message : e));
  }
}

/* ------------------------------------------------------------------ */
/* ظ†ط§ظپط°ط© ط؛ظ„ظ‚: ط±ط³ط§ظ„ط© ظ…ظ†طھظ‡ظٹط© ط§ظ„طھط±ط®ظٹطµ                                     */
function showLicenseBlockedWindow(reason) {
  const messages = {
    expired: 'ط§ظ†طھظ‡طھ طµظ„ط§ط­ظٹط© ط§ظ„ط±ط®طµط© ظپظٹ 31/12/2026.\nظ…ظ† ظپط¶ظ„ظƒ ط±ط§ط¬ط¹ ظ…طµط¯ط± ط§ظ„ط¨ط±ظ†ط§ظ…ط¬ ظ„طھط¬ط¯ظٹط¯ ط§ظ„ط±ط®طµط©.',
    clock: 'طھظ… ظƒط´ظپ طھط¹ط¯ظٹظ„ طھط§ط±ظٹط® ط§ظ„ط¬ظ‡ط§ط².\nظ…ط­ط§ظˆظ„ط§طھ ط§ظ„طھط±ط§ط¬ط¹ ط§ظ„ط²ظ…ظ†ظٹ ظٹظ…ظ†ط¹ ط§ظ„ط¹ظ…ظ„ ظ…ط¹ ظپطھط±ط© ط§ظ„طھط±ط®ظٹطµ.',
    locked: 'ط§ظ„ط±ط®طµط© ظ…ظ‚ظپظ„ط© ظ†طھظٹط¬ط© ظ…ط­ط§ظˆظ„ط© طھط¹ط¯ظٹظ„ طھط§ط±ظٹط® ط§ظ„ط¬ظ‡ط§ط².\nظ…ظ† ظپط¶ظ„ظƒ ط±ط§ط¬ط¹ ظ…طµط¯ط± ط§ظ„ط¨ط±ظ†ط§ظ…ط¬.',
  };
  const msg = messages[reason] || messages.expired;
  const html = '<!doctype html><html><meta charset="utf-8"><body style="margin:0;background:#0b1220;color:#fff;' +
    'font-family:Cairo,Segoe UI,Arial;display:flex;align-items:center;justify-content:center;min-height:100vh;' +
    'text-align:center;padding:24px">' +
    '<div><div style="font-size:52px">ًں”’</div><h1 style="font-size:20px;color:#f59e0b">ط§ظ„ط±ط®طµط© ظ…ظ‚ظپظ„ط©</h1>' +
    '<p style="color:#cbd5e1;line-height:1.8;white-space:pre-line">' + msg + '</p></div></body></html>';
  const w = new BrowserWindow({
    width: 480,
    height: 380,
    resizable: false,
    autoHideMenuBar: true,
    backgroundColor: '#0b1220',
  });
  w.setMenuBarVisibility(false);
  const dataURL = 'data:text/html;charset=utf-8,' + encodeURIComponent(html);
  w.loadURL(dataURL).catch(() => {});
  return w;
}

/* ------------------------------------------------------------------ */
function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    autoHideMenuBar: false,
    backgroundColor: '#0b1220',
    title: 'ط§ظ„طھظ‚ط±ظٹط± ط§ظ„ظٹظˆظ…ظٹ â€” ظ…طµظ„ط­ط© ط§ظ„ط§ظ‚طھطµط§ط¯',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.setMenuBarVisibility(true);
  reloadInto(win);
}

function buildMenu() {
  const template = [
    {
      label: 'طھط­ظٹظ‘ظ†',
      submenu: [
        { label: 'طھط­ظٹظ‘ظ† ط¢ظ„ظٹ ظ…ظ† ط§ظ„ظ…ظˆظ‚ط¹', accelerator: 'CommandOrControl+U', click: () => updateFromSite() },
        { label: 'ط§ط³طھظٹط±ط§ط¯ ظ…ظ„ظپ طھط­ظٹظ‘ظ†â€¦', click: () => importUpdateFile() },
        { type: 'separator' },
        { label: 'ظپط­طµ ظ…ط¬ظ„ط¯ ط§ظ„طھط­ط¯ظٹط«', click: () => shell.openPath(updatesRoot()) },
      ],
    },
    {
      label: 'ظ…ظ„ظپ',
      submenu: [
        { label: 'ط®ط±ظˆط¬', role: 'quit' },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  const lic = checkLicense(datFile());
  if (!lic.ok) {
    showLicenseBlockedWindow(lic.reason);
    return;
  }
  buildMenu();
  createWindow();
  ipcMain.handle('raport:update-site', () => updateFromSite());
  ipcMain.handle('raport:import-update', () => importUpdateFile());
});

app.on('window-all-closed', () => app.quit());

