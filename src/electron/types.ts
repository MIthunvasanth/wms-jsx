export interface Product {
  id?: string;
  productName: string;
  partNumber: string;
  processFlow: ProcessStep[];
  priorityLevel: "Low" | "Medium" | "High";
}

export interface ProcessStep {
  id: string;
  processName: string;
  machineId: string;
  machineName?: string;
  cycleTime: number;
  sequence: number;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  status: "Active" | "Maintenance" | "Inactive";
}
