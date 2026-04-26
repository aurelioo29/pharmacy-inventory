import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { STOCK_QUERY_KEY } from "@/features/stock/hooks/use-stock";
import { saleService } from "../services/sale-service";
import type { CreateSalePayload, GetSalesParams } from "../types/sale";

export const SALES_QUERY_KEY = "sales";

export function useSales(params: GetSalesParams) {
  return useQuery({
    queryKey: [SALES_QUERY_KEY, params],
    queryFn: () => saleService.getSales(params),
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: [SALES_QUERY_KEY, id],
    queryFn: () => saleService.getSale(id),
    enabled: Boolean(id),
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSalePayload) => saleService.createSale(payload),
    onSuccess: () => {
      message.success("Penjualan berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: [SALES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [STOCK_QUERY_KEY] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Gagal membuat penjualan");
    },
  });
}
