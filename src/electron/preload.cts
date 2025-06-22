import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("productAPI", {
  getProducts: () => ipcRenderer.invoke("get-products"),
  getProduct: (id: string) => ipcRenderer.invoke("get-product", id),
  createProduct: (product: any) =>
    ipcRenderer.invoke("create-product", product),
  updateProduct: (product: any) =>
    ipcRenderer.invoke("update-product", product),
  deleteProduct: (id: string) => ipcRenderer.invoke("delete-product", id),
  generatePartNumber: () => ipcRenderer.invoke("generate-part-number"),
});

contextBridge.exposeInMainWorld("dashboardAPI", {
  getProductionMetrics: () => ipcRenderer.invoke("get-production-metrics"),
  getMachineStatus: () => ipcRenderer.invoke("get-machine-status"),
  getDefectTrends: () => ipcRenderer.invoke("get-defect-trends"),
  getOrderStatus: () => ipcRenderer.invoke("get-order-status"),
  getShiftPerformance: () => ipcRenderer.invoke("get-shift-performance"),
  getQualityAlerts: () => ipcRenderer.invoke("get-quality-alerts"),
});

contextBridge.exposeInMainWorld("holidayAPI", {
  getHolidays: () => ipcRenderer.invoke("get-holidays"),
  saveHoliday: (holiday: any) => ipcRenderer.invoke("save-holiday", holiday),
  deleteHoliday: (id: string) => ipcRenderer.invoke("delete-holiday", id),
});

contextBridge.exposeInMainWorld("shiftAPI", {
  getShifts: () => ipcRenderer.invoke("get-shifts"),
  saveShift: (shift: any) => ipcRenderer.invoke("save-shift", shift),
  deleteShift: (id: string) => ipcRenderer.invoke("delete-shift", id),
});

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
