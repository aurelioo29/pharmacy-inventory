import { useQuery } from "@tanstack/react-query";
import { stockService } from "../services/stok-service";
import type { GetStockParams } from "../types/stock";

export const STOCK_QUERY_KEY = "stock";

export function useStocks(params: GetStockParams) {
  return useQuery({
    queryKey: [STOCK_QUERY_KEY, params],
    queryFn: () => stockService.getStocks(params),
  });
}

export function useStockDetail(medicineId: string) {
  return useQuery({
    queryKey: [STOCK_QUERY_KEY, medicineId],
    queryFn: () => stockService.getStockDetail(medicineId),
    enabled: Boolean(medicineId),
  });
}
