import { apiFetch } from "@/lib/api-fetch";
import type {
  CreateMedicinePayload,
  GetMedicinesParams,
  Medicine,
  MedicinesResponse,
  UpdateMedicinePayload,
} from "../types/medicine";

export const medicineService = {
  getMedicines(params: GetMedicinesParams) {
    return apiFetch<MedicinesResponse>("/api/medicines", {
      params,
    });
  },

  getMedicine(id: string) {
    return apiFetch<Medicine>(`/api/medicines/${id}`);
  },

  createMedicine(payload: CreateMedicinePayload) {
    return apiFetch<Medicine>("/api/medicines", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateMedicine(id: string, payload: UpdateMedicinePayload) {
    return apiFetch<Medicine>(`/api/medicines/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteMedicine(id: string) {
    return apiFetch<null>(`/api/medicines/${id}`, {
      method: "DELETE",
    });
  },
};
