import { apiFetch } from "@/lib/api-fetch";
import type {
  ActivityLog,
  ActivityLogsResponse,
  GetActivityLogsParams,
} from "../types/activity-log";

export const activityLogService = {
  getActivityLogs(params: GetActivityLogsParams) {
    return apiFetch<ActivityLogsResponse>("/api/activity-logs", {
      params,
    });
  },

  getActivityLog(id: string) {
    return apiFetch<ActivityLog>(`/api/activity-logs/${id}`);
  },
};
