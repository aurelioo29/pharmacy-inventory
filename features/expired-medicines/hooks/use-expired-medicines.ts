import { useQuery } from "@tanstack/react-query";
import { expiredMedicineService } from "../services/expired-medicine-service";
import type { GetExpiredMedicinesParams } from "../types/expired-medicine";

export const EXPIRED_MEDICINES_QUERY_KEY = "expired-medicines";

export function useExpiredMedicines(params: GetExpiredMedicinesParams) {
  return useQuery({
    queryKey: [EXPIRED_MEDICINES_QUERY_KEY, params],
    queryFn: () => expiredMedicineService.getExpiredMedicines(params),
  });
}
