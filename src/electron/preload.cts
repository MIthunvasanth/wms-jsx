import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("machineAPI", {
  saveMachine: (machine: any) => ipcRenderer.invoke("save-machine", machine),
  loadMachines: () => ipcRenderer.invoke("load-machines"),
  getCompanies: () => ipcRenderer.invoke("get-companies"),
  updateMachine: (machine: any) =>
    ipcRenderer.invoke("update-machine", machine),
});

contextBridge.exposeInMainWorld("componentAPI", {
  saveComponent: (componentData: any) =>
    ipcRenderer.invoke("save-component", componentData),
});

contextBridge.exposeInMainWorld("electronAPI", {
  auth: {
    signup: (userData: any) => {
      console.log("Signup called from renderer", userData);
      return ipcRenderer.invoke("signup", userData);
    },
    login: (userData: any) => ipcRenderer.invoke("login", userData),
  },
});

contextBridge.exposeInMainWorld("electron", {
  subscribeStatistics: (callback) =>
    ipcOn("statistics", (stats) => {
      callback(stats);
    }),
  subscribeChangeView: (callback) =>
    ipcOn("changeView", (view) => {
      callback(view);
    }),
  getStaticData: () => ipcInvoke("getStaticData"),
  sendFrameAction: (payload) => ipcSend("sendFrameAction", payload),
} satisfies Window["electron"]);

function ipcInvoke<Key extends keyof EventPayloadMapping>(
  key: Key
): Promise<EventPayloadMapping[Key]> {
  return ipcRenderer.invoke(key);
}

function ipcOn<Key extends keyof EventPayloadMapping>(
  key: Key,
  callback: (payload: EventPayloadMapping[Key]) => void
) {
  const cb = (_: Electron.IpcRendererEvent, payload: any) => callback(payload);
  ipcRenderer.on(key, cb);
  return () => ipcRenderer.off(key, cb);
}

function ipcSend<Key extends keyof EventPayloadMapping>(
  key: Key,
  payload: EventPayloadMapping[Key]
) {
  ipcRenderer.send(key, payload);
}
