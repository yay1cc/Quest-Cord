const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const { Client } = require("@xhayper/discord-rpc");

let mainWindow;
let rpcClient;
let rpcReady = false;

function sendStatus(message) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("quest:status", message);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1080,
    height: 760,
    minWidth: 850,
    minHeight: 650,
    backgroundColor: "#211722",
    title: "Quest-Cord v1.0.0",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  mainWindow.on("closed", () => { mainWindow = null; });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  try {
    if (rpcClient) rpcClient.destroy();
  } catch (_) {
    // Best-effort cleanup of the local Discord IPC connection.
  }
});

ipcMain.handle("quest:connect", async (_event, clientId) => {
  if (typeof clientId !== "string" || !/^\d{17,20}$/.test(clientId)) {
    throw new Error("Geçerli bir Discord Application ID gir.");
  }

  try {
    if (rpcClient) {
      try { rpcClient.destroy(); } catch (_) {}
      rpcClient = null;
      rpcReady = false;
    }

    rpcClient = new Client({ clientId });
    await rpcClient.login();
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Discord bağlantısı zaman aşımına uğradı.")), 12000);
      rpcClient.once("ready", () => { clearTimeout(timeout); resolve(); });
      rpcClient.once("error", (error) => { clearTimeout(timeout); reject(error); });
    });
    rpcReady = true;
    sendStatus("Discord bağlantısı kuruldu.");
    return { ok: true };
  } catch (error) {
    rpcReady = false;
    try { if (rpcClient) rpcClient.destroy(); } catch (_) {}
    rpcClient = null;
    throw new Error("Discord'a bağlanılamadı. Discord masaüstü uygulamasının açık olduğundan emin ol.");
  }
});

ipcMain.handle("quest:publish", async (_event, gameName) => {
  if (!rpcClient || !rpcReady) throw new Error("Önce Discord'a bağlan.");
  if (typeof gameName !== "string" || gameName.length < 1 || gameName.length > 100) {
    throw new Error("Geçersiz oyun adı.");
  }
  await rpcClient.user.setActivity({
    details: "Playing " + gameName,
    state: "discord:@enhij"
  });
  return { ok: true };
});

ipcMain.handle("quest:clear", async () => {
  if (!rpcClient || !rpcReady) throw new Error("Discord bağlantısı yok.");
  await rpcClient.user.clearActivity();
  return { ok: true };
});
