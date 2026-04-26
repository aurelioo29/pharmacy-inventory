import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import RoleFormPage from "@/features/roles/components/role-form-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function NewRolePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "roles.create")) {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout
      session={session}
      title="Role Baru"
      breadcrumbs={[
        { title: "Master Data" },
        { title: "Roles & Permissions", href: "/master_data/roles" },
        { title: "Baru" },
      ]}
    >
      <RoleFormPage mode="create" />
    </DashboardLayout>
  );
}
