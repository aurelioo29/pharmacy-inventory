import { useQuery } from "@tanstack/react-query";
import { stockMovementService } from "../services/stock-movement-service";
import type { GetStockMovementsParams } from "../types/stock-movement";

export const STOCK_MOVEMENTS_QUERY_KEY = "stock-movements";

export function useStockMovements(params: GetStockMovementsParams) {
  return useQuery({
    queryKey: [STOCK_MOVEMENTS_QUERY_KEY, params],
    queryFn: () => stockMovementService.getStockMovements(params),
  });
}

export function useStockMovement(id: string) {
  return useQuery({
    queryKey: [STOCK_MOVEMENTS_QUERY_KEY, id],
    queryFn: () => stockMovementService.getStockMovement(id),
    enabled: Boolean(id),
  });
}
