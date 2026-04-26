import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { STOCK_QUERY_KEY } from "@/features/stock/hooks/use-stock";
import { stockAdjustmentService } from "../services/stock-adjustment-service";
import type { CreateStockAdjustmentPayload } from "../types/stock-adjustment";

export function useCreateStockAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStockAdjustmentPayload) =>
      stockAdjustmentService.createAdjustment(payload),
    onSuccess: () => {
      message.success("Stock adjustment berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: [STOCK_QUERY_KEY] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Gagal membuat stock adjustment");
    },
  });
}
