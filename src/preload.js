const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  convertImage: (data) => ipcRenderer.invoke("convert-image", data),
  batchConvert: (data) => ipcRenderer.invoke("batch-convert", data),
  selectFiles: () => ipcRenderer.invoke("select-files"),
  selectDirectory: () => ipcRenderer.invoke("select-directory"),
  getFormats: () => ipcRenderer.invoke("get-formats"),
  saveFileDialog: (defaultPath) =>
    ipcRenderer.invoke("save-file-dialog", defaultPath),
});
