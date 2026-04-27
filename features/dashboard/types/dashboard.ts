export type DashboardSummary = {
  totalMedicines: number;
  totalStock: number;
  lowStockCount: number;
  expiredCount: number;
  expiringSoonCount: number;
  todaySales: number;
  todayPurchases: number;
};

export type DashboardSalesChartItem = {
  date: string;
  total: number;
};

export type DashboardLowStockItem = {
  id: string;
  code: string;
  name: string;
  minimumStock: number;
  totalStock: number;
  unit?: {
    symbol?: string | null;
    name: string;
  } | null;
};

export type DashboardRecentStockMovement = {
  id: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  notes?: string | null;
  createdAt: string;
  medicine: {
    code: string;
    name: string;
  };
  batch: {
    batchNumber: string;
  };
  user: {
    username: string;
  };
};

export type DashboardResponse = {
  summary: DashboardSummary;
  salesChart: DashboardSalesChartItem[];
  lowStock: DashboardLowStockItem[];
  recentStockMovements: DashboardRecentStockMovement[];
};
