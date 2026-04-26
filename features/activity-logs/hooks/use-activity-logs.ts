import { useQuery } from "@tanstack/react-query";
import { activityLogService } from "../services/activity-log-service";
import type { GetActivityLogsParams } from "../types/activity-log";

export const ACTIVITY_LOGS_QUERY_KEY = "activity-logs";

export function useActivityLogs(params: GetActivityLogsParams) {
  return useQuery({
    queryKey: [ACTIVITY_LOGS_QUERY_KEY, params],
    queryFn: () => activityLogService.getActivityLogs(params),
  });
}

export function useActivityLog(id: string) {
  return useQuery({
    queryKey: [ACTIVITY_LOGS_QUERY_KEY, id],
    queryFn: () => activityLogService.getActivityLog(id),
    enabled: Boolean(id),
  });
}
