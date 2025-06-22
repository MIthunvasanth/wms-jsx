export interface Product {
  id: string;
  name: string;
  partNumber: string;
  processFlow: ProcessStep[];
  priority: "Low" | "Medium" | "High";
}

export interface ProcessStep {
  id: string;
  sequence: number;
  processName: string;
  machineId: string;
  cycleTime: number;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  status: "Active" | "Maintenance" | "Inactive";
}

export interface User {
  username: string;
  email: string;
}

export interface Break {
  id: string;
  name: string;
  duration: number; // in minutes
}

export interface Shift {
  id: string;
  name: string;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  breaks: Break[];
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
}
