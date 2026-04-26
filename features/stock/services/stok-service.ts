import { apiFetch } from "@/lib/api-fetch";
import type {
  GetStockParams,
  StockDetailResponse,
  StockResponse,
} from "../types/stock";

export const stockService = {
  getStocks(params: GetStockParams) {
    return apiFetch<StockResponse>("/api/stock", {
      params,
    });
  },

  getStockDetail(medicineId: string) {
    return apiFetch<StockDetailResponse>(`/api/stock/${medicineId}`);
  },
};
