export type ActivityLogUser = {
  id: string;
  name: string;
  username: string;
};

export type ActivityLog = {
  id: string;
  userId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  oldData?: unknown;
  newData?: unknown;
  ipAddress?: string | null;
  createdAt: string;
  user?: ActivityLogUser | null;
};

export type ActivityLogsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ActivityLogsResponse = {
  activityLogs: ActivityLog[];
  pagination: ActivityLogsPagination;
};

export type GetActivityLogsParams = {
  search?: string;
  page?: number;
  limit?: number;
  resourceType?: string;
  action?: string;
};
