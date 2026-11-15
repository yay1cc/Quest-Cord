const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("questCord", {
  connect: (clientId) => ipcRenderer.invoke("quest:connect", clientId),
  publish: (gameName) => ipcRenderer.invoke("quest:publish", gameName),
  clear: () => ipcRenderer.invoke("quest:clear"),
  onStatus: (callback) => {
    if (typeof callback !== "function") return;
    const listener = (_event, message) => callback(message);
    ipcRenderer.on("quest:status", listener);
    return () => ipcRenderer.removeListener("quest:status", listener);
  }
});
