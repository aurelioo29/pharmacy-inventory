import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard-service";

export const DASHBOARD_QUERY_KEY = "dashboard";

export function useDashboard() {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY],
    queryFn: () => dashboardService.getDashboard(),
  });
}
