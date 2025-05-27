import { app, BrowserWindow, Menu,ipcMain } from 'electron';
import { ipcMainHandle, ipcMainOn, isDev } from './util.js';
import { getPreloadPath, getUIPath } from './pathResolver.js';
import fs from 'fs';
import path from 'path';


const machinesFilePath = path.join(app.getPath('userData'), 'machines.json');
const componentsFilePath = path.join(app.getPath('userData'), 'components.json');
console.log('MACHINES FILE PATH:', machinesFilePath);
function readMachines() {
  try {
    const data = fs.readFileSync(machinesFilePath, 'utf-8');
    return JSON.parse(data); 
  } catch (error) {
    return [];
  }
}

// Function to save machines to the JSON file
function saveMachines(machines: any) {
  try {
    fs.writeFileSync(machinesFilePath, JSON.stringify(machines, null, 2));
  } catch (error) {
    console.error("Error saving machines:", error);
  }
}

function readComponents() {
  try {
    const data = fs.readFileSync(componentsFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return []; // if file missing or empty
  }
}
function readCompanydetails() {
  try {
    const data = fs.readFileSync(machinesFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return []; // if file missing or empty
  }
}
// Function to save components
function saveComponents(components: any[]) {
  try {
    fs.writeFileSync(componentsFilePath, JSON.stringify(components, null, 2));
  } catch (error) {
    console.error("Error saving components:", error);
  }
}

app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(), 
      contextIsolation: true,     // Important for security
    },
    // disables default system frame (dont do this if you want a proper working menu bar)
    frame: false,
  });
  if (isDev()) {
    mainWindow.loadURL('http://localhost:5123');
  } else {
    mainWindow.loadFile(getUIPath());
  }





  ipcMainOn('sendFrameAction', (payload) => {
    switch (payload) {
      case 'CLOSE':
        mainWindow.close();
        break;
      case 'MAXIMIZE':
        mainWindow.maximize();
        break;
      case 'MINIMIZE':
        mainWindow.minimize();
        break;
    }
  });

  handleCloseEvents(mainWindow);
  
});

function handleCloseEvents(mainWindow: BrowserWindow) {
  let willClose = false;

  mainWindow.on('close', (e) => {
    if (willClose) {
      return;
    }
    e.preventDefault();
    mainWindow.hide();
    if (app.dock) {
      app.dock.hide();
    }
  });

  app.on('before-quit', () => {
    willClose = true;
  });

  mainWindow.on('show', () => {
    willClose = false;
  });
}

  ipcMain.handle('save-machine', (event, machine:any) => {
    console.log(machine);
    
    const machines = readMachines(); // Get the current list of machines
    machines.push(machine); // Add the new machine name
    saveMachines(machines); // Save the updated list back to the JSON file
  });
  
  ipcMain.handle('update-machine', (event, updatedMachine) => {
    const machines = readMachines();
    const index = machines.findIndex((m: any) => m.id === updatedMachine.id);
    
    if (index === -1) {
      throw new Error('Machine not found');
    }
  
    machines[index] = updatedMachine;
    saveMachines(machines);
  });
  
  ipcMain.handle('load-machines', () => {
    const machines = readMachines();
    return machines; // Send the list back
  });
  ipcMain.handle('get-companies', () => {
    const components = readCompanydetails();
    return components;
  });
  ipcMain.handle('save-component', (event, componentData) => {
    const components = readComponents();
  
    // Optional: Check if serial number already exists
    const exists = components.find((c:any) => c.serialNumber === componentData.serialNumber);
    if (exists) {
      throw new Error('Component with this serial number already exists');
    }
  
    components.push(componentData); // Add new component
    saveComponents(components);     // Save back to file
  });
