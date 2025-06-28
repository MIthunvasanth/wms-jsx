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
  getCompanyOrderStats: () => ipcRenderer.invoke("get-company-order-stats"),
  getHolidayStats: () => ipcRenderer.invoke("get-holiday-stats"),
  getMachineStatusDistribution: () =>
    ipcRenderer.invoke("get-machine-status-distribution"),
  getProcessStats: () => ipcRenderer.invoke("get-process-stats"),
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

contextBridge.exposeInMainWorld("companyAPI", {
  getCompanies: () => ipcRenderer.invoke("get-companies-list"),
  createCompany: (company: any) =>
    ipcRenderer.invoke("create-company", company),
  updateCompany: (company: any) =>
    ipcRenderer.invoke("update-company", company),
  deleteCompany: (id: string) => ipcRenderer.invoke("delete-company", id),
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

contextBridge.exposeInMainWorld("orderAPI", {
  getOrders: (companyId?: string) =>
    ipcRenderer.invoke("get-orders", companyId),
  getOrder: (id: string) => ipcRenderer.invoke("get-order", id),
  createOrder: (orderData: any) =>
    ipcRenderer.invoke("create-order", orderData),
  updateOrder: (orderData: any) =>
    ipcRenderer.invoke("update-order", orderData),
  deleteOrder: (id: string) => ipcRenderer.invoke("delete-order", id),
  resolveConflictAndCreateOrder: (data: any) =>
    ipcRenderer.invoke("resolve-conflict-and-create-order", data),
});

contextBridge.exposeInMainWorld("processAPI", {
  getProcesses: () => ipcRenderer.invoke("get-processes"),
  getProcess: (id: string) => ipcRenderer.invoke("get-process", id),
  createProcess: (processData: any) =>
    ipcRenderer.invoke("create-process", processData),
  updateProcess: (processData: any) =>
    ipcRenderer.invoke("update-process", processData),
  deleteProcess: (id: string) => ipcRenderer.invoke("delete-process", id),
  getMachinesByProcess: (processId: string) =>
    ipcRenderer.invoke("get-machines-by-process", processId),
  getCompanyMachines: (companyId: string) =>
    ipcRenderer.invoke("get-company-machines", companyId),
});

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
