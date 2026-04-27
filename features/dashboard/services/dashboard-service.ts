import { apiFetch } from "@/lib/api-fetch";
import type { DashboardResponse } from "../types/dashboard";

export const dashboardService = {
  getDashboard() {
    return apiFetch<DashboardResponse>("/api/dashboard");
  },
};
