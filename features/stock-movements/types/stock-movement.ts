export type StockMovementType = "IN" | "OUT" | "ADJUSTMENT";

export type StockMovement = {
  id: string;
  medicineId: string;
  medicineBatchId: string;
  userId: string;

  type: StockMovementType;
  quantity: number;
  stockBefore: number;
  stockAfter: number;

  referenceType?: string | null;
  referenceId?: string | null;
  notes?: string | null;
  createdAt: string;

  medicine: {
    id: string;
    code: string;
    name: string;
  };

  batch: {
    id: string;
    batchNumber: string;
    expiredDate: string;
  };

  user: {
    id: string;
    name: string;
    username: string;
  };
};

export type StockMovementsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type StockMovementsResponse = {
  stockMovements: StockMovement[];
  pagination: StockMovementsPagination;
};

export type GetStockMovementsParams = {
  search?: string;
  page?: number;
  limit?: number;
  type?: StockMovementType | "";
};
