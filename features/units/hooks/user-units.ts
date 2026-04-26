import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { unitService } from "../services/unit-service";
import type {
  CreateUnitPayload,
  GetUnitsParams,
  UpdateUnitPayload,
} from "../types/unit";

export const UNITS_QUERY_KEY = "units";

export function useUnits(params: GetUnitsParams) {
  return useQuery({
    queryKey: [UNITS_QUERY_KEY, params],
    queryFn: () => unitService.getUnits(params),
  });
}

export function useUnit(id: string) {
  return useQuery({
    queryKey: [UNITS_QUERY_KEY, id],
    queryFn: () => unitService.getUnit(id),
    enabled: Boolean(id),
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUnitPayload) => unitService.createUnit(payload),
    onSuccess: () => {
      message.success("Satuan berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: [UNITS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Gagal membuat satuan");
    },
  });
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUnitPayload }) =>
      unitService.updateUnit(id, payload),
    onSuccess: () => {
      message.success("Satuan berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: [UNITS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Gagal memperbarui satuan");
    },
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unitService.deleteUnit(id),
    onSuccess: () => {
      message.success("Satuan berhasil dinonaktifkan");
      queryClient.invalidateQueries({ queryKey: [UNITS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Gagal menonaktifkan satuan");
    },
  });
}
