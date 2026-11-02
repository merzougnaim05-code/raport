/**
 * Raport-Portable (Electron)
 * يُحمّل دائمًا النسخة الحية من الموقع — أي تحديث للموقع يظهر تلقائيًا في التطبيق.
 * عند انقطاع الإنترنت تمامًا يعتمد على النسخة المدمجة (app/index.html) حتى عودة الاتصال.
 * زر «تحيّن» عائم لفرض إعادة التحميل/التنقل للنسخة الحية يدويًا.
 */
const { app, BrowserWindow, net, shell } = require('electron');
const path = require('path');

const ONLINE_URL = 'https://service-rapport.pages.dev';

let win = null;
let failures = 0;
let isLocalMode = false;
let gotLock = false;

try {
  gotLock = app.requestSingleInstanceLock();
} catch (e) {
  gotLock = true;
}

if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
  });

  /** التحميل من النسخة المدمجة (وضع الصبر عند غياب الإنترنت). */
  const loadLocal = () => {
    if (!win) return;
    isLocalMode = true;
    win.loadFile(path.join(__dirname, 'app', 'index.html')).catch(() => {});
  };

  /** التحميل من الموقع الحي (الوضع الأساسي). */
  const goOnline = () => {
    if (!win) return;
    failures = 0;
    isLocalMode = false;
    win.loadURL(ONLINE_URL).catch(() => {});
  };

  /** إرسال حالة الوضع للصفحة + حقن زر «تحيّن» العائم */
  const injectUpdateButton = async () => {
    if (!win || win.isDestroyed()) return;
    try {
      await win.webContents.executeJavaScript(
        `(() => {
          if (document.getElementById('raport-update-btn')) {
            window.__raportOnline = ${isLocalMode ? 'false' : 'true'};
            return;
          }
          const btn = document.createElement('button');
          btn.id = 'raport-update-btn';
          btn.textContent = '⟳ تحيّن';
          btn.title = 'تحديث التطبيق من الموقع مباشرة';
          btn.style.cssText = [
            'position:fixed', 'bottom:14px', 'left:14px', 'z-index:2147483647',
            'width:34px', 'height:34px', 'padding:0', 'border:0', 'border-radius:50%',
            'background:linear-gradient(135deg,#10b981,#059669)', 'color:#fff',
            'font:700 11px/1 Cairo, "Segoe UI", Arial, sans-serif',
            'box-shadow:0 4px 14px rgba(5,150,105,.45)', 'cursor:pointer',
            'opacity:.82', 'transition:opacity .2s, transform .2s'
          ].join(';');
          btn.addEventListener('mouseenter', () => { btn.style.opacity = '1'; btn.style.transform = 'scale(1.08)'; });
          btn.addEventListener('mouseleave', () => { btn.style.opacity = '.82'; btn.style.transform = 'scale(1)'; });
          btn.addEventListener('click', () => {
            if (window.__raportOnline === false) {
              // وضع الصبر: الانتقال للنسخة الحية
              location.href = ${JSON.stringify(ONLINE_URL)} + '?t=' + Date.now();
            } else {
              // نسخة حية: إعادة تحميل قسرية
              location.reload();
            }
          });
          document.body.appendChild(btn);
          window.__raportOnline = ${isLocalMode ? 'false' : 'true'};
        })()`,
        true
      );
    } catch {
      /* الصفحة لم تجهز بعد — سيعاد الحقن بعد التنقل */
    }
  };

  const createWindow = () => {
    win = new BrowserWindow({
      width: 1440,
      height: 900,
      minWidth: 900,
      autoHideMenuBar: true,
      backgroundColor: '#0b1220',
      title: 'التقرير اليومي — مصلحة الاقتصاد',
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });
    win.setMenuBarVisibility(false);

    // الروابط الخارجية تفتح بمتصفح النظام وليس داخل التطبيق
    win.webContents.setWindowOpenHandler(({ url }) => {
      if (url && url.startsWith('http')) shell.openExternal(url);
      return { action: 'deny' };
    });

    win.webContents.on('did-navigate', () => injectUpdateButton());
    win.webContents.on('did-frame-navigate', () => injectUpdateButton());

    if (net.isOnline()) goOnline();
    else loadLocal();

    win.webContents.on('did-fail-load', (_e, _code, _desc, _url, isMain) => {
      if (!isMain) return;
      failures += 1;
      if (failures >= 3) loadLocal();
      else setTimeout(goOnline, 2500);
    });

    // إذا كنا في الوضع المحلي وعاد الإنترنت: نعود فورًا للموقع الحي (تحديث تلقائي)
    const backOnlineTimer = setInterval(async () => {
      if (!win || win.isDestroyed()) {
        clearInterval(backOnlineTimer);
        return;
      }
      try {
        if (!isLocalMode) return;
        if (!net.isOnline()) return;
        await net.fetch(ONLINE_URL, { method: 'GET' });
        goOnline();
      } catch {
        /* لا اتصال بعد — تبقى النسخة المدمجة */
      }
    }, 30000);
  };

  app.whenReady().then(createWindow);

  app.on('window-all-closed', () => app.quit());
}
