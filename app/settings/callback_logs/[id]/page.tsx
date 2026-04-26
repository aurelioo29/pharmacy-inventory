import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ActivityLogDetailPage from "@/features/activity-logs/components/activity-log-detail-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

type CallbackLogDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CallbackLogDetailPage({
  params,
}: CallbackLogDetailPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "activity_logs.view")) {
    redirect("/dashboard");
  }

  const { id } = await params;

  return (
    <DashboardLayout
      session={session}
      title="Callback Log Detail"
      breadcrumbs={[
        { title: "Settings" },
        { title: "Callback Logs", href: "/settings/callback_logs" },
        { title: "Detail" },
      ]}
    >
      <ActivityLogDetailPage logId={id} />
    </DashboardLayout>
  );
}
