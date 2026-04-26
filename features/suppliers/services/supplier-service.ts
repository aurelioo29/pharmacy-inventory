import { apiFetch } from "@/lib/api-fetch";
import type {
  CreateSupplierPayload,
  GetSuppliersParams,
  Supplier,
  SuppliersResponse,
  UpdateSupplierPayload,
} from "../types/supplier";

export const supplierService = {
  getSuppliers(params: GetSuppliersParams) {
    return apiFetch<SuppliersResponse>("/api/suppliers", { params });
  },

  getSupplier(id: string) {
    return apiFetch<Supplier>(`/api/suppliers/${id}`);
  },

  createSupplier(payload: CreateSupplierPayload) {
    return apiFetch<Supplier>("/api/suppliers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateSupplier(id: string, payload: UpdateSupplierPayload) {
    return apiFetch<Supplier>(`/api/suppliers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteSupplier(id: string) {
    return apiFetch<null>(`/api/suppliers/${id}`, {
      method: "DELETE",
    });
  },
};
