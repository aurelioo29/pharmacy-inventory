import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { supplierService } from "../services/supplier-service";
import type {
  CreateSupplierPayload,
  GetSuppliersParams,
  UpdateSupplierPayload,
} from "../types/supplier";

export const SUPPLIERS_QUERY_KEY = "suppliers";

export function useSuppliers(params: GetSuppliersParams) {
  return useQuery({
    queryKey: [SUPPLIERS_QUERY_KEY, params],
    queryFn: () => supplierService.getSuppliers(params),
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: [SUPPLIERS_QUERY_KEY, id],
    queryFn: () => supplierService.getSupplier(id),
    enabled: Boolean(id),
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSupplierPayload) =>
      supplierService.createSupplier(payload),
    onSuccess: () => {
      message.success("Supplier berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Gagal membuat supplier");
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateSupplierPayload;
    }) => supplierService.updateSupplier(id, payload),
    onSuccess: () => {
      message.success("Supplier berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Gagal memperbarui supplier");
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => supplierService.deleteSupplier(id),
    onSuccess: () => {
      message.success("Supplier berhasil dinonaktifkan");
      queryClient.invalidateQueries({ queryKey: [SUPPLIERS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Gagal menonaktifkan supplier");
    },
  });
}
