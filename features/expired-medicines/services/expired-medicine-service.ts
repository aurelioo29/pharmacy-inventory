import { apiFetch } from "@/lib/api-fetch";
import type {
  ExpiredMedicinesResponse,
  GetExpiredMedicinesParams,
} from "../types/expired-medicine";

export const expiredMedicineService = {
  getExpiredMedicines(params: GetExpiredMedicinesParams) {
    return apiFetch<ExpiredMedicinesResponse>("/api/expired-medicines", {
      params,
    });
  },
};
