/**
 * Preload آمن — يكشف واجهة التطبيق المكتبي فقط (بلا أي صلاحيات متقدمة).
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('raportDesktop', {
  desktop: true,
  updateFromSite: () => ipcRenderer.invoke('raport:update-site'),
  importUpdateFile: () => ipcRenderer.invoke('raport:import-update'),
  onUpdateEvent: (cb) => {
    const handler = (_e, data) => cb(data);
    ipcRenderer.on('raport:update-event', handler);
    return () => ipcRenderer.removeListener('raport:update-event', handler);
  },
});
