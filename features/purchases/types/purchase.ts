export type Purchase = {
  id: string;
  supplierId: string;
  userId: string;
  invoiceNumber: string;
  purchaseDate: string;
  totalAmount: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;

  supplier?: {
    id: string;
    name: string;
  };

  user?: {
    id: string;
    name: string;
    username: string;
  };

  items?: PurchaseItem[];
};

export type PurchaseItem = {
  id: string;
  purchaseId: string;
  medicineId: string;
  medicineBatchId?: string | null;
  batchNumber: string;
  expiredDate: string;
  quantity: number;
  purchasePrice: string;
  sellingPrice: string;
  subtotal: string;

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
  } | null;
};

export type PurchasesResponse = {
  purchases: Purchase[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type GetPurchasesParams = {
  search?: string;
  page?: number;
  limit?: number;
  supplierId?: string;
};

export type CreatePurchasePayload = {
  supplierId: string;
  purchaseDate: string;
  notes?: string | null;
  items: {
    medicineId: string;
    batchNumber: string;
    expiredDate: string;
    quantity: number;
    purchasePrice: number;
    sellingPrice: number;
  }[];
};
