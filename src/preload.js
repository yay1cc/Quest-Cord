const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('questCord', {
  connect: (id) => ipcRenderer.invoke('rpc:connect', id),
  setActivity: (game) => ipcRenderer.invoke('rpc:activity', game),
  clearActivity: () => ipcRenderer.invoke('rpc:clear')
});
