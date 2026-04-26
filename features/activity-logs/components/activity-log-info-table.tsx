import dayjs from "dayjs";
import type { ReactNode } from "react";
import type { ActivityLog } from "../types/activity-log";

type ActivityLogInfoTableProps = {
  log: ActivityLog;
};

function formatDate(value?: string | null) {
  return value ? dayjs(value).format("DD-MM-YYYY HH:mm:ss") : "-";
}

function formatJson(value: unknown) {
  if (!value) return "-";
  return JSON.stringify(value, null, 2);
}

function JsonBox({ value }: { value: unknown }) {
  return (
    <pre className="m-0 max-h-[360px] overflow-auto whitespace-pre-wrap break-all bg-white p-4 text-xs leading-relaxed text-slate-700">
      {formatJson(value)}
    </pre>
  );
}

export default function ActivityLogInfoTable({
  log,
}: ActivityLogInfoTableProps) {
  const rows: [string, ReactNode][] = [
    ["User", log.user ? `${log.user.username} - ${log.user.name}` : "System"],
    ["Action", log.action],
    ["Resource Type", log.resourceType],
    ["Resource ID", log.resourceId || "-"],
    ["IP Address", log.ipAddress || "-"],
    ["Created at", formatDate(log.createdAt)],
    ["Old Data", <JsonBox key="old-data" value={log.oldData} />],
    ["New Data", <JsonBox key="new-data" value={log.newData} />],
  ];

  return (
    <div className="border border-slate-200 bg-white">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="grid grid-cols-1 border-b border-slate-100 last:border-b-0 md:grid-cols-[200px_1fr]"
        >
          <div className="bg-slate-50 px-4 py-3 text-md text-slate-600">
            {label}
          </div>

          <div className="px-4 py-3 text-sm text-slate-800">{value}</div>
        </div>
      ))}
    </div>
  );
}
