const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const RPC = require('discord-rpc');

let win;
let rpc;
let connected = false;
let currentClientId = '';

function createWindow() {
  win = new BrowserWindow({
    width: 1080,
    height: 760,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#211722',
    title: 'Quest-Cord',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  win.loadFile(path.join(__dirname, 'index.html'));
}

async function disconnectRPC() {
  if (rpc) {
    try { await rpc.destroy(); } catch {}
  }
  rpc = null;
  connected = false;
  currentClientId = '';
}

ipcMain.handle('rpc:connect', async (_event, clientId) => {
  if (typeof clientId !== 'string' || !/^\d{17,20}$/.test(clientId)) {
    return { ok: false, message: 'Geçerli bir Discord Application ID gir.' };
  }
  await disconnectRPC();
  try {
    RPC.register(clientId);
    rpc = new RPC.Client({ transport: 'ipc' });
    currentClientId = clientId;
    await rpc.login({ clientId });
    connected = true;
    return { ok: true, message: 'Discord bağlantısı kuruldu.' };
  } catch (error) {
    await disconnectRPC();
    return { ok: false, message: 'Discord masaüstü uygulaması açık mı? ' + error.message };
  }
});

ipcMain.handle('rpc:activity', async (_event, game) => {
  if (!connected || !rpc) return { ok: false, message: 'Önce Discord bağlantısı kur.' };
  if (typeof game !== 'string' || !game.trim()) return { ok: false, message: 'Bir oyun seç.' };
  try {
    await rpc.setActivity({
      details: 'Playing ' + game.slice(0, 128),
      state: 'via Quest-Cord',
      instance: false
    });
    return { ok: true, message: game + ' Discord durumuna eklendi.' };
  } catch (error) {
    return { ok: false, message: 'Durum gönderilemedi: ' + error.message };
  }
});

ipcMain.handle('rpc:clear', async () => {
  if (rpc && connected) {
    try { await rpc.clearActivity(); } catch {}
    return { ok: true, message: 'Discord durumu temizlendi.' };
  }
  return { ok: false, message: 'Discord bağlantısı yok.' };
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on('before-quit', () => { if (rpc) rpc.destroy().catch(() => {}); });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
