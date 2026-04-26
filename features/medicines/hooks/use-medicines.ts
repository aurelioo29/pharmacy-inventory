import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { medicineService } from "../services/medicine-service";
import type {
  CreateMedicinePayload,
  GetMedicinesParams,
  UpdateMedicinePayload,
} from "../types/medicine";

export const MEDICINES_QUERY_KEY = "medicines";

export function useMedicines(params: GetMedicinesParams) {
  return useQuery({
    queryKey: [MEDICINES_QUERY_KEY, params],
    queryFn: () => medicineService.getMedicines(params),
  });
}

export function useMedicine(id: string) {
  return useQuery({
    queryKey: [MEDICINES_QUERY_KEY, id],
    queryFn: () => medicineService.getMedicine(id),
    enabled: Boolean(id),
  });
}

export function useCreateMedicine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMedicinePayload) =>
      medicineService.createMedicine(payload),
    onSuccess: () => {
      message.success("Obat berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: [MEDICINES_QUERY_KEY] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Gagal membuat obat");
    },
  });
}

export function useUpdateMedicine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateMedicinePayload;
    }) => medicineService.updateMedicine(id, payload),
    onSuccess: () => {
      message.success("Obat berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: [MEDICINES_QUERY_KEY] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Gagal memperbarui obat");
    },
  });
}

export function useDeleteMedicine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => medicineService.deleteMedicine(id),
    onSuccess: () => {
      message.success("Obat berhasil dinonaktifkan");
      queryClient.invalidateQueries({ queryKey: [MEDICINES_QUERY_KEY] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Gagal menonaktifkan obat");
    },
  });
}
