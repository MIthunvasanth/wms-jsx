import { contextBridge, ipcRenderer } from 'electron'; // Correct import

// Expose 'machineAPI' to the renderer process
console.log('Preload script loaded');
contextBridge.exposeInMainWorld('machineAPI', {
  saveMachine: (machine:any) => ipcRenderer.invoke('save-machine',machine),
  loadMachines: () => ipcRenderer.invoke('load-machines'), 
  getCompanies: () => ipcRenderer.invoke('get-companies'),
});

contextBridge.exposeInMainWorld('componentAPI', {
  saveComponent: (componentData:any) => ipcRenderer.invoke('save-component', componentData),
});


// Expose 'electron' API for other purposes
contextBridge.exposeInMainWorld('electron', {
  subscribeStatistics: (callback) =>
    ipcOn('statistics', (stats) => {
      callback(stats);
    }),
  subscribeChangeView: (callback) =>
    ipcOn('changeView', (view) => {
      callback(view);
    }),
  getStaticData: () => ipcInvoke('getStaticData'),
  sendFrameAction: (payload) => ipcSend('sendFrameAction', payload),
} satisfies Window['electron']);

// IPC utility functions
function ipcInvoke<Key extends keyof EventPayloadMapping>(
  key: Key
): Promise<EventPayloadMapping[Key]> {
  return ipcRenderer.invoke(key); // Corrected to use ipcRenderer directly
}

function ipcOn<Key extends keyof EventPayloadMapping>(
  key: Key,
  callback: (payload: EventPayloadMapping[Key]) => void
) {
  const cb = (_: Electron.IpcRendererEvent, payload: any) => callback(payload);
  ipcRenderer.on(key, cb);
  return () => ipcRenderer.off(key, cb); // Corrected to use ipcRenderer directly
}

function ipcSend<Key extends keyof EventPayloadMapping>(
  key: Key,
  payload: EventPayloadMapping[Key]
) {
  ipcRenderer.send(key, payload); // Corrected to use ipcRenderer directly
}
