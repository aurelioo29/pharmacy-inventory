import { apiFetch } from "@/lib/api-fetch";
import type {
  CreatePurchasePayload,
  GetPurchasesParams,
  Purchase,
  PurchasesResponse,
} from "../types/purchase";

export const purchaseService = {
  getPurchases(params: GetPurchasesParams) {
    return apiFetch<PurchasesResponse>("/api/purchases", {
      params,
    });
  },

  getPurchase(id: string) {
    return apiFetch<Purchase>(`/api/purchases/${id}`);
  },

  createPurchase(payload: CreatePurchasePayload) {
    return apiFetch<Purchase>("/api/purchases", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updatePurchase(
    id: string,
    payload: {
      purchaseDate?: string;
      notes?: string | null;
    },
  ) {
    return apiFetch<Purchase>(`/api/purchases/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
