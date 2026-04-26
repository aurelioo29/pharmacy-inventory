import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import RolesPageClient from "@/features/roles/components/role-page-client";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function RolesPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "roles.view")) {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout
      session={session}
      title="Roles & Permissions"
      breadcrumbs={[{ title: "Master Data" }, { title: "Roles & Permissions" }]}
      description="Kelola role dan permission akses sistem."
    >
      <RolesPageClient />
    </DashboardLayout>
  );
}
