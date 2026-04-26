import { apiFetch } from "@/lib/api-fetch";
import type { CreateStockAdjustmentPayload } from "../types/stock-adjustment";

export const stockAdjustmentService = {
  createAdjustment(payload: CreateStockAdjustmentPayload) {
    return apiFetch("/api/stock-adjustments", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
