import { app, BrowserWindow, ipcMain } from "electron";
import { isDev, ipcMainOn } from "./util.js";
import { getPreloadPath, getUIPath } from "./pathResolver.js";
import fs from "fs";
import path from "path";
import { Product, Shift, Holiday } from "./types.js";

interface Machine {
  id: string;
  name: string;
  description?: string;
  status?: string;
}

interface Component {
  serialNumber: string;
  name: string;
  type: string;
  status: string;
  machineId: string;
}

interface User {
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
}

const machinesFilePath = path.join(app.getPath("userData"), "machines.json");
const componentsFilePath = path.join(
  app.getPath("userData"),
  "components.json"
);
const productsFilePath = path.join(app.getPath("userData"), "products.json");
const holidaysFilePath = path.join(app.getPath("userData"), "holidays.json");
const shiftsFilePath = path.join(app.getPath("userData"), "shifts.json");

const usersFilePath = path.join(app.getPath("userData"), "users.json");
console.log("MACHINES FILE PATH:", machinesFilePath);
function readMachines() {
  try {
    const data = fs.readFileSync(machinesFilePath, "utf-8");
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

function readProducts(): Product[] {
  try {
    const data = fs.readFileSync(productsFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function saveProducts(products: Product[]) {
  try {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
  } catch (error) {
    console.error("Error saving products:", error);
  }
}

function readHolidays(): Holiday[] {
  try {
    const data = fs.readFileSync(holidaysFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function saveHolidays(holidays: Holiday[]) {
  try {
    fs.writeFileSync(holidaysFilePath, JSON.stringify(holidays, null, 2));
  } catch (error) {
    console.error("Error saving holidays:", error);
  }
}

function readShifts(): Shift[] {
  try {
    const data = fs.readFileSync(shiftsFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function saveShifts(shifts: Shift[]) {
  try {
    fs.writeFileSync(shiftsFilePath, JSON.stringify(shifts, null, 2));
  } catch (error) {
    console.error("Error saving shifts:", error);
  }
}

function readComponents() {
  try {
    const data = fs.readFileSync(componentsFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return []; // if file missing or empty
  }
}
function readCompanydetails() {
  try {
    const data = fs.readFileSync(machinesFilePath, "utf-8");
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

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true, // Important for security
    },
    // disables default system frame (dont do this if you want a proper working menu bar)
    frame: false,
  });
  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(getUIPath());
  }

  ipcMainOn("sendFrameAction", (payload) => {
    switch (payload) {
      case "CLOSE":
        mainWindow.close();
        break;
      case "MAXIMIZE":
        mainWindow.maximize();
        break;
      case "MINIMIZE":
        mainWindow.minimize();
        break;
    }
  });

  handleCloseEvents(mainWindow);
});

function handleCloseEvents(mainWindow: BrowserWindow) {
  let willClose = false;

  mainWindow.on("close", (e) => {
    if (willClose) {
      return;
    }
    e.preventDefault();
    mainWindow.hide();
    if (app.dock) {
      app.dock.hide();
    }
  });

  app.on("before-quit", () => {
    willClose = true;
  });

  mainWindow.on("show", () => {
    willClose = false;
  });
}

ipcMain.handle("save-machine", (event, machine: any) => {
  console.log(machine);

  const machines = readMachines(); // Get the current list of machines
  machines.push(machine); // Add the new machine name
  saveMachines(machines); // Save the updated list back to the JSON file
});

ipcMain.handle("update-machine", (event, updatedMachine) => {
  const machines = readMachines();
  const index = machines.findIndex((m: any) => m.id === updatedMachine.id);

  if (index === -1) {
    throw new Error("Machine not found");
  }

  machines[index] = updatedMachine;
  saveMachines(machines);
});

ipcMain.handle("load-machines", () => {
  const machines = readMachines();
  return machines; // Send the list back
});
ipcMain.handle("get-companies", () => {
  const components = readCompanydetails();
  return components;
});
ipcMain.handle("save-component", (event, componentData) => {
  const components = readComponents();

  // Optional: Check if serial number already exists
  const exists = components.find(
    (c: any) => c.serialNumber === componentData.serialNumber
  );
  if (exists) {
    throw new Error("Component with this serial number already exists");
  }

  components.push(componentData); // Add new component
  saveComponents(components); // Save back to file
});

function readUsers(): User[] {
  try {
    const data = fs.readFileSync(usersFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function saveUsers(users: User[]): void {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Error saving users:", error);
  }
}

ipcMain.handle("signup", (event, userData) => {
  const users = readUsers();

  // Check if username exists
  const usernameExists = users.some(
    (user) => user.username === userData.username
  );
  if (usernameExists) {
    throw new Error("Username already exists");
  }

  // Check if email exists
  const emailExists = users.some((user) => user.email === userData.email);
  if (emailExists) {
    throw new Error("Email already exists");
  }

  const newUser: User = {
    username: userData.username,
    email: userData.email,
    password: userData.password,
    role: userData.role || "user",
  };

  users.push(newUser);
  saveUsers(users);

  return { success: true };
});

// Update login handler
ipcMain.handle("login", (event, credentials) => {
  const users = readUsers();

  // Find user by username or email
  const user = users.find(
    (u) =>
      (u.username === credentials.usernameOrEmail ||
        u.email === credentials.usernameOrEmail) &&
      u.password === credentials.password
  );

  if (!user) {
    throw new Error("Invalid username/email or password");
  }

  return {
    success: true,
    user: {
      username: user.username,
      role: user.role,
    },
  };
});

// Product Handlers
ipcMain.handle("get-products", () => {
  return readProducts();
});

ipcMain.handle("get-product", (event, id: string) => {
  const products = readProducts();
  return products.find((p) => p.id === id);
});

ipcMain.handle("create-product", (event, product: Product) => {
  const products = readProducts();
  const newProduct = { ...product, id: `prod_${Date.now()}` };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
});

ipcMain.handle("update-product", (event, product: Product) => {
  const products = readProducts();
  const index = products.findIndex((p) => p.id === product.id);
  if (index !== -1) {
    products[index] = product;
    saveProducts(products);
    return product;
  }
  return null;
});

ipcMain.handle("delete-product", (event, id: string) => {
  let products = readProducts();
  const initialLength = products.length;
  products = products.filter((p) => p.id !== id);
  if (products.length < initialLength) {
    saveProducts(products);
    return true;
  }
  return false;
});

// Holiday Handlers
ipcMain.handle("get-holidays", () => readHolidays());

ipcMain.handle("save-holiday", (_, holiday: Holiday) => {
  const holidays = readHolidays();
  const index = holidays.findIndex((h) => h.id === holiday.id);
  if (index !== -1) {
    holidays[index] = holiday; // Update existing
  } else {
    holidays.push(holiday); // Add new
  }
  saveHolidays(holidays);
  return holiday;
});

ipcMain.handle("delete-holiday", (_, id: string) => {
  let holidays = readHolidays();
  holidays = holidays.filter((h) => h.id !== id);
  saveHolidays(holidays);
  return true;
});

// Shift Handlers
ipcMain.handle("get-shifts", () => readShifts());

ipcMain.handle("save-shift", (_, shift: Shift) => {
  const shifts = readShifts();
  const index = shifts.findIndex((s) => s.id === shift.id);
  if (index !== -1) {
    shifts[index] = shift; // Update
  } else {
    shifts.push(shift); // Create
  }
  saveShifts(shifts);
  return shift;
});

ipcMain.handle("delete-shift", (event, id: string) => {
  let shifts = readShifts();
  shifts = shifts.filter((s) => s.id !== id);
  saveShifts(shifts);
  return true;
});

// Dashboard Mock Data Generators
function getMockProductionMetrics() {
  const dailyOutput = Math.floor(Math.random() * 1000) + 5000;
  return {
    dailyOutput,
    weeklyOutput: Math.floor(Math.random() * 5000) + dailyOutput * 5,
    target: 6000,
    utilization: Math.random(),
  };
}

function getMockMachineStatus() {
  const machines = [
    "Cutter-01",
    "Welder-01",
    "Press-01",
    "Painter-01",
    "Assembler-01",
    "Cutter-02",
    "Welder-02",
    "Press-02",
    "Painter-02",
    "Assembler-02",
  ];
  const hours = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`); // 8am to 7pm
  return machines.flatMap((machine) =>
    hours.map((hour) => ({
      machine,
      hour,
      utilization: parseFloat(Math.random().toFixed(2)),
    }))
  );
}

function getMockDefectTrends() {
  return Array.from({ length: 30 }, (_, i) => ({
    date: `2023-11-${String(i + 1).padStart(2, "0")}`,
    rate: parseFloat((Math.random() * 0.05).toFixed(3)),
  }));
}

function getMockOrderStatus() {
  return [
    { type: "Completed", value: Math.floor(Math.random() * 50) + 100 },
    { type: "In Progress", value: Math.floor(Math.random() * 20) + 20 },
    { type: "Queued", value: Math.floor(Math.random() * 30) + 40 },
    { type: "On Hold", value: Math.floor(Math.random() * 10) + 5 },
  ];
}

function getMockShiftPerformance() {
  return [
    { shift: "Morning Shift", output: Math.floor(Math.random() * 500) + 2000 },
    { shift: "Evening Shift", output: Math.floor(Math.random() * 500) + 1800 },
    { shift: "Night Shift", output: Math.floor(Math.random() * 500) + 1500 },
  ];
}

function getMockQualityAlerts() {
  const alerts = [
    {
      id: 1,
      machine: "Welder-01",
      code: "Q-102",
      description: "High temperature variation",
      severity: "High",
    },
    {
      id: 2,
      machine: "Cutter-02",
      code: "P-301",
      description: "Blade pressure low",
      severity: "Medium",
    },
    {
      id: 3,
      machine: "Painter-01",
      code: "Q-405",
      description: "Inconsistent coating thickness",
      severity: "High",
    },
    {
      id: 4,
      machine: "Assembler-02",
      code: "M-512",
      description: "Component alignment off",
      severity: "Low",
    },
  ];
  return alerts.filter(() => Math.random() > 0.3); // Randomly return some alerts
}

// Dashboard Handlers
ipcMain.handle("get-production-metrics", async () =>
  getMockProductionMetrics()
);
ipcMain.handle("get-machine-status", async () => getMockMachineStatus());
ipcMain.handle("get-defect-trends", async () => getMockDefectTrends());
ipcMain.handle("get-order-status", async () => getMockOrderStatus());
ipcMain.handle("get-shift-performance", async () => getMockShiftPerformance());
ipcMain.handle("get-quality-alerts", async () => getMockQualityAlerts());

ipcMain.handle("generate-part-number", () => {
  return `PN-${Date.now()}`;
});
