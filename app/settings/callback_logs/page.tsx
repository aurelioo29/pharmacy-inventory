import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import CallbackLogsPageClient from "@/features/activity-logs/components/activity-logs-page-client";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function CallbackLogsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "activity_logs.view")) {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout
      session={session}
      title="Callback Logs"
      breadcrumbs={[{ title: "Settings" }, { title: "Callback Logs" }]}
    >
      <CallbackLogsPageClient />
    </DashboardLayout>
  );
}
