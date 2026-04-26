"use client";

import { Button, Card, Skeleton } from "antd";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActivityLog } from "../hooks/use-activity-logs";
import ActivityLogInfoTable from "./activity-log-info-table";

type ActivityLogDetailPageProps = {
  logId: string;
};

export default function ActivityLogDetailPage({
  logId,
}: ActivityLogDetailPageProps) {
  const router = useRouter();
  const logQuery = useActivityLog(logId);

  const log = logQuery.data?.data;

  return (
    <div className="flex flex-col gap-5">
      <Card
        className="!rounded-none !border !border-slate-200 !bg-white"
        styles={{ body: { padding: 12 } }}
      >
        <Button
          type="text"
          className="!rounded-none !border-none !px-0"
          icon={<ArrowLeft size={15} />}
          onClick={() => router.push("/settings/callback_logs")}
        >
          Back to List
        </Button>
      </Card>

      <Card
        className="!rounded-none !border !border-slate-200 !bg-white"
        styles={{ body: { padding: 16 } }}
      >
        {logQuery.isLoading || !log ? (
          <Skeleton active />
        ) : (
          <ActivityLogInfoTable log={log} />
        )}
      </Card>
    </div>
  );
}
