const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  saveUser: (data) => ipcRenderer.invoke("save-user", data),
  loginUser: (data) => ipcRenderer.invoke("login-user", data), 
  checkUserIdle: () => ipcRenderer.invoke("check-idle-time"),
});
