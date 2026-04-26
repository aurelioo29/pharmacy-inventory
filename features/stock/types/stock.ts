export type StockStatus = "OUT_OF_STOCK" | "LOW_STOCK" | "SAFE";

export type StockMedicine = {
  id: string;
  code: string;
  name: string;
  minimumStock: number;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
  };
  unit?: {
    id: string;
    name: string;
    symbol?: string | null;
  };
  totalStock: number;
  stockStatus: StockStatus;
};

export type StockResponse = {
  stocks: StockMedicine[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type GetStockParams = {
  search?: string;
  page?: number;
  limit?: number;
  status?: string;
};

export type MedicineBatch = {
  id: string;
  medicineId: string;
  batchNumber: string;
  expiredDate: string;
  initialQuantity: number;
  currentQuantity: number;
  purchasePrice: string;
  sellingPrice: string;
  createdAt: string;
  updatedAt: string;
};

export type StockMovement = {
  id: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  referenceType?: string | null;
  referenceId?: string | null;
  notes?: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    username: string;
  };
  batch?: MedicineBatch;
};

export type StockDetailResponse = {
  medicine: StockMedicine & {
    description?: string | null;
  };
  totalStock: number;
  batches: MedicineBatch[];
  movements: StockMovement[];
};
