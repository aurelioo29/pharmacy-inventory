export type Supplier = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SuppliersPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type SuppliersResponse = {
  suppliers: Supplier[];
  pagination: SuppliersPagination;
};

export type GetSuppliersParams = {
  search?: string;
  page?: number;
  limit?: number;
  isActive?: boolean | null;
};

export type CreateSupplierPayload = {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};

export type UpdateSupplierPayload = {
  name?: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  isActive?: boolean;
};
