import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import RoleFormPage from "@/features/roles/components/role-form-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

type EditRolePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditRolePage({ params }: EditRolePageProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "roles.update")) {
    redirect("/dashboard");
  }

  const { id } = await params;

  return (
    <DashboardLayout
      session={session}
      title="Edit Role"
      breadcrumbs={[
        { title: "Master Data" },
        { title: "Roles & Permissions", href: "/master_data/roles" },
        { title: "Edit" },
      ]}
      description="Perbarui role dan permission."
    >
      <RoleFormPage mode="edit" roleId={id} />
    </DashboardLayout>
  );
}
