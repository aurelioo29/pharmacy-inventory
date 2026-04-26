import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import RoleDetailPage from "@/features/roles/components/role-detail-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

type RoleDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RoleDetailRoute({
  params,
}: RoleDetailRouteProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "roles.view")) {
    redirect("/dashboard");
  }

  const { id } = await params;

  return (
    <DashboardLayout
      session={session}
      title="Detail Role"
      breadcrumbs={[
        { title: "Master Data" },
        { title: "Roles & Permissions", href: "/master_data/roles" },
        { title: "Detail" },
      ]}
      description="Lihat detail role dan permission."
    >
      <RoleDetailPage roleId={id} />
    </DashboardLayout>
  );
}
