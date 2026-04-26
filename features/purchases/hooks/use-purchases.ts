import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { purchaseService } from "../services/purchase-service";
import type {
  CreatePurchasePayload,
  GetPurchasesParams,
} from "../types/purchase";

export const PURCHASES_QUERY_KEY = "purchases";
export const STOCK_QUERY_KEY = "stock";

export function usePurchases(params: GetPurchasesParams) {
  return useQuery({
    queryKey: [PURCHASES_QUERY_KEY, params],
    queryFn: () => purchaseService.getPurchases(params),
  });
}

export function usePurchase(id: string) {
  return useQuery({
    queryKey: [PURCHASES_QUERY_KEY, id],
    queryFn: () => purchaseService.getPurchase(id),
    enabled: Boolean(id),
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePurchasePayload) =>
      purchaseService.createPurchase(payload),
    onSuccess: () => {
      message.success("Pembelian berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: [PURCHASES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [STOCK_QUERY_KEY] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Gagal membuat pembelian");
    },
  });
}

export function useUpdatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        purchaseDate?: string;
        notes?: string | null;
      };
    }) => purchaseService.updatePurchase(id, payload),
    onSuccess: () => {
      message.success("Pembelian berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: [PURCHASES_QUERY_KEY] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Gagal memperbarui pembelian");
    },
  });
}
