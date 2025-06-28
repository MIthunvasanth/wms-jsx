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
  status: "idle" | "working" | "maintenance" | "offline";
  units: number;
  processIds: string[];
  companyId: string;
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

interface Company {
  id: string;
  name: string;
  address: string;
  gst: string;
  dailyHours: number;
}

interface Order {
  id: string;
  companyId: string;
  productName: string;
  partNumber: string;
  processName: string;
  machineId: string;
  machineName: string;
  startDate: string;
  endDate: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  units: number;
  createdAt: string;
  updatedAt: string;
}

interface Process {
  id: string;
  name: string;
  description?: string;
  machineIds: string[];
}

const machinesFilePath = path.join(app.getPath("userData"), "machines.json");
const componentsFilePath = path.join(
  app.getPath("userData"),
  "components.json"
);
const productsFilePath = path.join(app.getPath("userData"), "products.json");
const holidaysFilePath = path.join(app.getPath("userData"), "holidays.json");
const shiftsFilePath = path.join(app.getPath("userData"), "shifts.json");
const companiesFilePath = path.join(app.getPath("userData"), "companies.json");
const ordersFilePath = path.join(app.getPath("userData"), "orders.json");
const processesFilePath = path.join(app.getPath("userData"), "processes.json");

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

  // Initialize sample data
  initializeSampleData();

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

function initializeSampleData() {
  // Initialize sample processes if none exist
  const processes = readProcesses();
  if (processes.length === 0) {
    const sampleProcesses = [
      {
        id: "process_1",
        name: "Welding",
        description: "Metal welding process",
        machineIds: [],
      },
      {
        id: "process_2",
        name: "Cutting",
        description: "Metal cutting process",
        machineIds: [],
      },
      {
        id: "process_3",
        name: "Assembly",
        description: "Product assembly process",
        machineIds: [],
      },
    ];
    saveProcesses(sampleProcesses);
  }

  // Update existing machines with new structure
  const machines = readMachines();
  if (machines.length > 0) {
    const updatedMachines = machines.map((machine: any) => ({
      ...machine,
      status: machine.status || "idle",
      units: machine.units || 1,
      processIds: machine.processIds || [],
      companyId: machine.companyId || "default",
    }));
    saveMachines(updatedMachines);
  }
}

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

// Company Handlers
ipcMain.handle("get-companies-list", () => readCompanies());

ipcMain.handle("create-company", (event, company: Omit<Company, "id">) => {
  const companies = readCompanies();
  const newCompany = { ...company, id: `comp_${Date.now()}` };
  companies.push(newCompany);
  saveCompanies(companies);
  return newCompany;
});

ipcMain.handle("update-company", (event, company: Company) => {
  const companies = readCompanies();
  const index = companies.findIndex((c) => c.id === company.id);
  if (index !== -1) {
    companies[index] = company;
    saveCompanies(companies);
    return company;
  }
  return null;
});

ipcMain.handle("delete-company", (event, id: string) => {
  let companies = readCompanies();
  const initialLength = companies.length;
  companies = companies.filter((c) => c.id !== id);
  if (companies.length < initialLength) {
    saveCompanies(companies);
    return true;
  }
  return false;
});

// Dashboard Real Data Generators
function getRealProductionMetrics() {
  const orders = readOrders();
  const companies = readCompanies();

  // Calculate daily output (orders completed today)
  const today = new Date().toISOString().split("T")[0];
  const dailyOutput = orders.filter(
    (order) => order.status === "completed" && order.endDate === today
  ).length;

  // Calculate weekly output (orders completed this week)
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  const weeklyOutput = orders.filter((order) => {
    if (order.status !== "completed") return false;
    const orderDate = new Date(order.endDate);
    return orderDate >= weekStart && orderDate <= weekEnd;
  }).length;

  // Calculate target (average daily orders from last week)
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(weekStart);
  lastWeekEnd.setDate(lastWeekStart.getDate() + 6);

  const lastWeekOrders = orders.filter((order) => {
    if (order.status !== "completed") return false;
    const orderDate = new Date(order.endDate);
    return orderDate >= lastWeekStart && orderDate <= lastWeekEnd;
  }).length;

  const target = Math.ceil(lastWeekOrders / 7);

  // Calculate utilization (working machines / total machines)
  const machines = readMachines();
  const workingMachines = machines.filter(
    (m: Machine) => m.status === "working"
  ).length;
  const utilization =
    machines.length > 0 ? workingMachines / machines.length : 0;

  return {
    dailyOutput,
    weeklyOutput,
    target: target || 10, // Default target if no historical data
    utilization,
  };
}

function getRealMachineStatus() {
  const machines = readMachines();
  const orders = readOrders();

  // Generate hourly utilization for each machine
  const hours = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`); // 8am to 7pm
  const machineStatus: Array<{
    machine: string;
    hour: string;
    utilization: number;
  }> = [];

  machines.forEach((machine: Machine) => {
    // Get orders for this machine
    const machineOrders = orders.filter(
      (order) =>
        order.machineId === machine.id &&
        order.status !== "completed" &&
        order.status !== "cancelled"
    );

    hours.forEach((hour) => {
      // Calculate utilization based on machine status and orders
      let utilization = 0;
      if (machine.status === "working") {
        utilization =
          machineOrders.length > 0
            ? 0.8 + Math.random() * 0.2
            : 0.3 + Math.random() * 0.4;
      } else if (machine.status === "idle") {
        utilization = 0.1 + Math.random() * 0.2;
      } else if (machine.status === "maintenance") {
        utilization = 0;
      } else if (machine.status === "offline") {
        utilization = 0;
      }

      machineStatus.push({
        machine: machine.name,
        hour,
        utilization: parseFloat(utilization.toFixed(2)),
      });
    });
  });

  return machineStatus;
}

function getRealDefectTrends() {
  // For now, generate realistic defect trends based on production volume
  const orders = readOrders();
  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  );

  // Generate last 30 days of defect data
  const defectTrends = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Calculate orders completed on this date
    const ordersOnDate = completedOrders.filter(
      (order) => order.endDate === dateStr
    ).length;

    // Generate realistic defect rate (0.5% to 3% based on production volume)
    const baseRate = 0.01; // 1% base rate
    const volumeFactor = Math.min(ordersOnDate / 10, 1); // Higher volume = higher defect rate
    const defectRate =
      baseRate + volumeFactor * 0.02 + (Math.random() - 0.5) * 0.01;

    defectTrends.push({
      date: dateStr,
      rate: parseFloat(defectRate.toFixed(4)),
    });
  }

  return defectTrends;
}

function getRealOrderStatus() {
  const orders = readOrders();

  const statusCounts = {
    Completed: 0,
    "In Progress": 0,
    Pending: 0,
    Cancelled: 0,
  };

  orders.forEach((order) => {
    switch (order.status) {
      case "completed":
        statusCounts["Completed"]++;
        break;
      case "in-progress":
        statusCounts["In Progress"]++;
        break;
      case "pending":
        statusCounts["Pending"]++;
        break;
      case "cancelled":
        statusCounts["Cancelled"]++;
        break;
    }
  });

  return Object.entries(statusCounts).map(([type, value]) => ({ type, value }));
}

function getRealShiftPerformance() {
  const orders = readOrders();
  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  );

  // Calculate output by shift (simplified - assuming 8-hour shifts)
  const morningShift = completedOrders.filter((order) => {
    const orderDate = new Date(order.endDate);
    const hour = orderDate.getHours();
    return hour >= 6 && hour < 14;
  }).length;

  const eveningShift = completedOrders.filter((order) => {
    const orderDate = new Date(order.endDate);
    const hour = orderDate.getHours();
    return hour >= 14 && hour < 22;
  }).length;

  const nightShift = completedOrders.filter((order) => {
    const orderDate = new Date(order.endDate);
    const hour = orderDate.getHours();
    return hour >= 22 || hour < 6;
  }).length;

  return [
    { shift: "Morning Shift", output: morningShift },
    { shift: "Evening Shift", output: eveningShift },
    { shift: "Night Shift", output: nightShift },
  ];
}

function getRealQualityAlerts() {
  const machines = readMachines();
  const orders = readOrders();

  const alerts: Array<{
    id: number;
    machine: string;
    code: string;
    description: string;
    severity: string;
  }> = [];

  // Generate alerts based on machine status and order patterns
  machines.forEach((machine: Machine) => {
    const machineOrders = orders.filter(
      (order) =>
        order.machineId === machine.id &&
        order.status !== "completed" &&
        order.status !== "cancelled"
    );

    // Generate alerts based on machine status
    if (machine.status === "maintenance") {
      alerts.push({
        id: alerts.length + 1,
        machine: machine.name,
        code: "M-001",
        description: "Scheduled maintenance in progress",
        severity: "Medium",
      });
    }

    if (machine.status === "offline") {
      alerts.push({
        id: alerts.length + 1,
        machine: machine.name,
        code: "O-001",
        description: "Machine offline - requires attention",
        severity: "High",
      });
    }

    // Generate quality alerts based on order patterns
    if (machineOrders.length > 5) {
      alerts.push({
        id: alerts.length + 1,
        machine: machine.name,
        code: "Q-001",
        description: "High order volume - monitor quality",
        severity: "Medium",
      });
    }
  });

  // Limit to 5 most recent alerts
  return alerts.slice(0, 5);
}

function getCompanyOrderStats() {
  const companies = readCompanies();
  const orders = readOrders();

  return companies.map((company) => {
    const companyOrders = orders.filter(
      (order) => order.companyId === company.id
    );
    const completedOrders = companyOrders.filter(
      (order) => order.status === "completed"
    );
    const pendingOrders = companyOrders.filter(
      (order) => order.status === "pending"
    );
    const inProgressOrders = companyOrders.filter(
      (order) => order.status === "in-progress"
    );

    return {
      companyId: company.id,
      companyName: company.name,
      totalOrders: companyOrders.length,
      completedOrders: completedOrders.length,
      pendingOrders: pendingOrders.length,
      inProgressOrders: inProgressOrders.length,
      completionRate:
        companyOrders.length > 0
          ? (completedOrders.length / companyOrders.length) * 100
          : 0,
    };
  });
}

function getHolidayStats() {
  const holidays = readHolidays();
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Get holidays for current month
  const currentMonthHolidays = holidays.filter((holiday) => {
    const holidayDate = new Date(holiday.date);
    return (
      holidayDate.getMonth() === currentMonth &&
      holidayDate.getFullYear() === currentYear
    );
  });

  // Get upcoming holidays (next 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const upcomingHolidays = holidays.filter((holiday) => {
    const holidayDate = new Date(holiday.date);
    return holidayDate >= today && holidayDate <= thirtyDaysFromNow;
  });

  return {
    currentMonthHolidays: currentMonthHolidays.length,
    upcomingHolidays: upcomingHolidays.length,
    totalHolidays: holidays.length,
    nextHoliday: upcomingHolidays.length > 0 ? upcomingHolidays[0] : null,
  };
}

// Dashboard Handlers
ipcMain.handle("get-production-metrics", async () =>
  getRealProductionMetrics()
);
ipcMain.handle("get-machine-status", async () => getRealMachineStatus());
ipcMain.handle("get-defect-trends", async () => getRealDefectTrends());
ipcMain.handle("get-order-status", async () => getRealOrderStatus());
ipcMain.handle("get-shift-performance", async () => getRealShiftPerformance());
ipcMain.handle("get-quality-alerts", async () => getRealQualityAlerts());

ipcMain.handle("get-company-order-stats", async () => getCompanyOrderStats());
ipcMain.handle("get-holiday-stats", async () => getHolidayStats());

ipcMain.handle("generate-part-number", () => {
  return `PN-${Date.now()}`;
});

function readCompanies(): Company[] {
  try {
    const data = fs.readFileSync(companiesFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function saveCompanies(companies: Company[]) {
  try {
    fs.writeFileSync(companiesFilePath, JSON.stringify(companies, null, 2));
  } catch (error) {
    console.error("Error saving companies:", error);
  }
}

function readOrders(): Order[] {
  try {
    const data = fs.readFileSync(ordersFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function saveOrders(orders: Order[]) {
  try {
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2));
  } catch (error) {
    console.error("Error saving orders:", error);
  }
}

function readProcesses(): Process[] {
  try {
    const data = fs.readFileSync(processesFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function saveProcesses(processes: Process[]) {
  try {
    fs.writeFileSync(processesFilePath, JSON.stringify(processes, null, 2));
  } catch (error) {
    console.error("Error saving processes:", error);
  }
}

// Order Handlers
ipcMain.handle("get-orders", (event, companyId?: string) => {
  const orders = readOrders();
  if (companyId) {
    return orders.filter((order) => order.companyId === companyId);
  }
  return orders;
});

ipcMain.handle("get-order", (event, id: string) => {
  const orders = readOrders();
  return orders.find((order) => order.id === id);
});

ipcMain.handle(
  "create-order",
  (event, orderData: Omit<Order, "id" | "createdAt" | "updatedAt">) => {
    const orders = readOrders();
    const machines = readMachines();

    // Check for machine conflicts
    const conflictingOrders = orders.filter(
      (order) =>
        order.machineId === orderData.machineId &&
        order.status !== "completed" &&
        order.status !== "cancelled" &&
        new Date(orderData.startDate) <= new Date(order.endDate) &&
        new Date(orderData.endDate) >= new Date(order.startDate)
    );

    if (conflictingOrders.length > 0) {
      const conflicts = conflictingOrders.map((order) => ({
        orderId: order.id,
        productName: order.productName,
        startDate: order.startDate,
        endDate: order.endDate,
        machineName: order.machineName,
        status: order.status,
      }));

      return {
        success: false,
        type: "MACHINE_CONFLICT",
        message:
          "Machine is already assigned to other orders during this period",
        conflicts,
        newOrderData: orderData,
      };
    }

    // Update machine status to working
    const machineIndex = machines.findIndex(
      (m: Machine) => m.id === orderData.machineId
    );
    if (machineIndex !== -1) {
      machines[machineIndex].status = "working";
      saveMachines(machines);
    }

    const newOrder: Order = {
      ...orderData,
      id: `order_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.push(newOrder);
    saveOrders(orders);
    return { success: true, order: newOrder };
  }
);

ipcMain.handle("update-order", (event, orderData: Order) => {
  const orders = readOrders();
  const machines = readMachines();
  const index = orders.findIndex((order) => order.id === orderData.id);

  if (index === -1) {
    throw new Error("Order not found");
  }

  // Check for machine conflicts (excluding current order)
  const conflictingOrders = orders.filter(
    (order) =>
      order.id !== orderData.id &&
      order.machineId === orderData.machineId &&
      order.status !== "completed" &&
      order.status !== "cancelled" &&
      new Date(orderData.startDate) <= new Date(order.endDate) &&
      new Date(orderData.endDate) >= new Date(order.startDate)
  );

  if (conflictingOrders.length > 0) {
    const conflicts = conflictingOrders.map((order) => ({
      orderId: order.id,
      productName: order.productName,
      startDate: order.startDate,
      endDate: order.endDate,
      machineName: order.machineName,
    }));

    throw new Error(
      JSON.stringify({
        type: "MACHINE_CONFLICT",
        message:
          "Machine is already assigned to other orders during this period",
        conflicts,
      })
    );
  }

  // Update machine status if machine changed
  const oldOrder = orders[index];
  if (oldOrder.machineId !== orderData.machineId) {
    // Set old machine to idle if no other orders
    const oldMachineOrders = orders.filter(
      (order) =>
        order.machineId === oldOrder.machineId &&
        order.status !== "completed" &&
        order.status !== "cancelled" &&
        order.id !== orderData.id
    );

    if (oldMachineOrders.length === 0) {
      const oldMachineIndex = machines.findIndex(
        (m: Machine) => m.id === oldOrder.machineId
      );
      if (oldMachineIndex !== -1) {
        machines[oldMachineIndex].status = "idle";
      }
    }

    // Set new machine to working
    const newMachineIndex = machines.findIndex(
      (m: Machine) => m.id === orderData.machineId
    );
    if (newMachineIndex !== -1) {
      machines[newMachineIndex].status = "working";
    }

    saveMachines(machines);
  }

  orders[index] = {
    ...orderData,
    updatedAt: new Date().toISOString(),
  };
  saveOrders(orders);
  return orders[index];
});

ipcMain.handle("delete-order", (event, id: string) => {
  const orders = readOrders();
  const machines = readMachines();
  const orderIndex = orders.findIndex((order) => order.id === id);

  if (orderIndex === -1) {
    return false;
  }

  const order = orders[orderIndex];

  // Set machine to idle if no other orders
  const otherOrders = orders.filter(
    (o) =>
      o.machineId === order.machineId &&
      o.status !== "completed" &&
      o.status !== "cancelled" &&
      o.id !== id
  );

  if (otherOrders.length === 0) {
    const machineIndex = machines.findIndex(
      (m: Machine) => m.id === order.machineId
    );
    if (machineIndex !== -1) {
      machines[machineIndex].status = "idle";
      saveMachines(machines);
    }
  }

  orders.splice(orderIndex, 1);
  saveOrders(orders);
  return true;
});

// Process Handlers
ipcMain.handle("get-processes", () => {
  return readProcesses();
});

ipcMain.handle("get-process", (event, id: string) => {
  const processes = readProcesses();
  return processes.find((process) => process.id === id);
});

ipcMain.handle("create-process", (event, processData: Omit<Process, "id">) => {
  const processes = readProcesses();
  const newProcess = { ...processData, id: `process_${Date.now()}` };
  processes.push(newProcess);
  saveProcesses(processes);
  return newProcess;
});

ipcMain.handle("update-process", (event, processData: Process) => {
  const processes = readProcesses();
  const index = processes.findIndex((process) => process.id === processData.id);
  if (index !== -1) {
    processes[index] = processData;
    saveProcesses(processes);
    return processData;
  }
  return null;
});

ipcMain.handle("delete-process", (event, id: string) => {
  let processes = readProcesses();
  const initialLength = processes.length;
  processes = processes.filter((process) => process.id !== id);
  if (processes.length < initialLength) {
    saveProcesses(processes);
    return true;
  }
  return false;
});

// Get machines by process
ipcMain.handle("get-machines-by-process", (event, processId: string) => {
  const processes = readProcesses();
  const machines = readMachines();
  const process = processes.find((p) => p.id === processId);

  if (!process) {
    return [];
  }

  return machines.filter((machine: Machine) =>
    process.machineIds.includes(machine.id)
  );
});

// Get available machines for a company
ipcMain.handle("get-company-machines", (event, companyId: string) => {
  const machines = readMachines();
  return machines.filter((machine: Machine) => machine.companyId === companyId);
});

ipcMain.handle(
  "resolve-conflict-and-create-order",
  (event, { newOrderData, conflictResolutions }) => {
    const orders = readOrders();
    const machines = readMachines();

    // Update conflicting orders with new end dates
    conflictResolutions.forEach(
      (resolution: { orderId: string; newEndDate: string }) => {
        const orderIndex = orders.findIndex(
          (order) => order.id === resolution.orderId
        );
        if (orderIndex !== -1) {
          orders[orderIndex].endDate = resolution.newEndDate;
          orders[orderIndex].updatedAt = new Date().toISOString();
        }
      }
    );

    // Save updated orders
    saveOrders(orders);

    // Update machine status to working
    const machineIndex = machines.findIndex(
      (m: Machine) => m.id === newOrderData.machineId
    );
    if (machineIndex !== -1) {
      machines[machineIndex].status = "working";
      saveMachines(machines);
    }

    // Create the new order
    const newOrder: Order = {
      ...newOrderData,
      id: `order_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.push(newOrder);
    saveOrders(orders);
    return { success: true, order: newOrder };
  }
);

function getMachineStatusDistribution() {
  const machines = readMachines();
  const statusCounts = {
    working: 0,
    idle: 0,
    maintenance: 0,
    offline: 0,
  };

  machines.forEach((machine: Machine) => {
    switch (machine.status) {
      case "working":
        statusCounts.working++;
        break;
      case "idle":
        statusCounts.idle++;
        break;
      case "maintenance":
        statusCounts.maintenance++;
        break;
      case "offline":
        statusCounts.offline++;
        break;
    }
  });

  return Object.entries(statusCounts).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count,
    color:
      status === "working"
        ? "#10b981"
        : status === "idle"
        ? "#3b82f6"
        : status === "maintenance"
        ? "#f59e0b"
        : "#ef4444",
  }));
}

ipcMain.handle("get-machine-status-distribution", async () =>
  getMachineStatusDistribution()
);

function getProcessStats() {
  const processes = readProcesses();
  const orders = readOrders();
  const machines = readMachines();

  return processes.map((process) => {
    // Count orders using this process
    const processOrders = orders.filter(
      (order) => order.processName === process.name
    );

    // Count machines that can handle this process
    const processMachines = machines.filter((machine: Machine) =>
      machine.processIds.includes(process.id)
    );

    return {
      processName: process.name,
      orderCount: processOrders.length,
      machineCount: processMachines.length,
      completedOrders: processOrders.filter(
        (order) => order.status === "completed"
      ).length,
      inProgressOrders: processOrders.filter(
        (order) => order.status === "in-progress"
      ).length,
      pendingOrders: processOrders.filter((order) => order.status === "pending")
        .length,
    };
  });
}

ipcMain.handle("get-process-stats", async () => getProcessStats());
