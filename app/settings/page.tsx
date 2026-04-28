import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import SettingsPageClient from "@/features/settings/components/settings-page-client";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "settings.view")) {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout
      session={session}
      title="General Settings"
      breadcrumbs={[{ title: "Settings" }, { title: "General Settings" }]}
      description="Kelola konfigurasi umum sistem."
    >
      <SettingsPageClient />
    </DashboardLayout>
  );
}
