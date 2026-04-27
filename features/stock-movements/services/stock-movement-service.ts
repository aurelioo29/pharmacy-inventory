import { apiFetch } from "@/lib/api-fetch";
import type {
  GetStockMovementsParams,
  StockMovement,
  StockMovementsResponse,
} from "../types/stock-movement";

export const stockMovementService = {
  getStockMovements(params: GetStockMovementsParams) {
    return apiFetch<StockMovementsResponse>("/api/stock-movements", {
      params,
    });
  },

  getStockMovement(id: string) {
    return apiFetch<StockMovement>(`/api/stock-movements/${id}`);
  },
};
