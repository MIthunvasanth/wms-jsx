import { app, BrowserWindow, ipcMain } from "electron";
import { isDev, ipcMainOn } from "./util.js";
import { getPreloadPath, getUIPath } from "./pathResolver.js";
import fs from "fs";
import path from "path";
import { Product } from "./types.js";

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

ipcMain.handle("generate-part-number", () => {
  return `PN-${Date.now()}`;
});
