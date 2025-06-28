type Statistics = {
  cpuUsage: number;
  ramUsage: number;
  storageUsage: number;
};

type StaticData = {
  totalStorage: number;
  cpuModel: string;
  totalMemoryGB: number;
};

type View = "CPU" | "RAM" | "STORAGE";

type FrameWindowAction = "CLOSE" | "MAXIMIZE" | "MINIMIZE";

type EventPayloadMapping = {
  statistics: Statistics;
  getStaticData: StaticData;
  changeView: View;
  sendFrameAction: FrameWindowAction;
};

type UnsubscribeFunction = () => void;

type MachineStatistic = any;
type Machine = any;
type Product = any;
type FrameAction = any;

interface Window {
  electron: {
    subscribeStatistics: (
      callback: (statistics: Statistics) => void
    ) => UnsubscribeFunction;
    getStaticData: () => Promise<StaticData>;
    subscribeChangeView: (
      callback: (view: View) => void
    ) => UnsubscribeFunction;
    sendFrameAction: (payload: FrameWindowAction) => void;
  };
  productAPI: {
    getProducts: () => Promise<Product[]>;
    getProduct: (id: string) => Promise<Product | undefined>;
    createProduct: (product: Omit<Product, "id">) => Promise<Product>;
    updateProduct: (product: Product) => Promise<Product | null>;
    deleteProduct: (id: string) => Promise<boolean>;
    generatePartNumber: () => Promise<string>;
  };
  machineAPI: {
    saveMachine: (machine: any) => Promise<void>;
    updateMachine: (machine: any) => Promise<void>;
    loadMachines: () => Promise<any[]>;
    getCompanies: () => Promise<any[]>;
  };
  companyAPI: {
    getCompanies: () => Promise<any[]>;
    createCompany: (company: any) => Promise<any>;
    updateCompany: (company: any) => Promise<any>;
    deleteCompany: (id: string) => Promise<boolean>;
  };
  componentAPI: {
    saveComponent: (componentData: any) => Promise<void>;
  };
  electronAPI: {
    auth: {
      signup: (userData: any) => Promise<any>;
      login: (userData: any) => Promise<any>;
    };
    subscribeStatistics: (
      callback: (stats: MachineStatistic[]) => void
    ) => () => void;
    subscribeChangeView: (callback: (view: View) => void) => () => void;
    getStaticData: () => Promise<{ machines: Machine[] }>;
    sendFrameAction: (payload: FrameAction) => void;
  };
}
