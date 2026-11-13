const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('menhApi', { goi: (ten, duLieu) => ipcRenderer.invoke('menh', ten, duLieu) });
