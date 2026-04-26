export type Sale = {
  id: string;
  userId: string;
  invoiceNumber: string;
  saleDate: string;
  totalAmount: string;
  paidAmount: string;
  changeAmount: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;

  user?: {
    id: string;
    name: string;
    username: string;
  };

  items?: SaleItem[];
};

export type SaleItem = {
  id: string;
  saleId: string;
  medicineId: string;
  medicineBatchId: string;
  quantity: number;
  sellingPrice: string;
  subtotal: string;
  createdAt: string;
  updatedAt: string;

  medicine?: {
    id: string;
    code: string;
    name: string;
  };

  batch?: {
    id: string;
    batchNumber: string;
    expiredDate: string;
    initialQuantity: number;
    currentQuantity: number;
    purchasePrice: string;
    sellingPrice: string;
  };
};

export type SalesResponse = {
  sales: Sale[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type GetSalesParams = {
  search?: string;
  page?: number;
  limit?: number;
};

export type CreateSalePayload = {
  saleDate: string;
  paidAmount: number;
  notes?: string | null;
  items: {
    medicineId: string;
    quantity: number;
  }[];
};
