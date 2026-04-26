import { apiFetch } from "@/lib/api-fetch";
import type {
  CreateUnitPayload,
  GetUnitsParams,
  Unit,
  UnitsResponse,
  UpdateUnitPayload,
} from "../types/unit";

export const unitService = {
  getUnits(params: GetUnitsParams) {
    return apiFetch<UnitsResponse>("/api/units", { params });
  },

  getUnit(id: string) {
    return apiFetch<Unit>(`/api/units/${id}`);
  },

  createUnit(payload: CreateUnitPayload) {
    return apiFetch<Unit>("/api/units", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateUnit(id: string, payload: UpdateUnitPayload) {
    return apiFetch<Unit>(`/api/units/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteUnit(id: string) {
    return apiFetch<null>(`/api/units/${id}`, {
      method: "DELETE",
    });
  },
};
