import { apiFetch } from "@/lib/api-fetch";
import type {
  CreateSalePayload,
  GetSalesParams,
  Sale,
  SalesResponse,
} from "../types/sale";

export const saleService = {
  getSales(params: GetSalesParams) {
    return apiFetch<SalesResponse>("/api/sales", {
      params,
    });
  },

  getSale(id: string) {
    return apiFetch<Sale>(`/api/sales/${id}`);
  },

  createSale(payload: CreateSalePayload) {
    return apiFetch<Sale>("/api/sales", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
