import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import UnitDetailPage from "@/features/units/components/unit-detail-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

type UnitDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UnitDetailRoute({
  params,
}: UnitDetailRouteProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "units.view")) {
    redirect("/dashboard");
  }

  const { id } = await params;

  return (
    <DashboardLayout
      session={session}
      title="Detail Satuan"
      breadcrumbs={[
        { title: "Master Data" },
        { title: "Satuan Obat", href: "/master_data/units" },
        { title: "Detail" },
      ]}
    >
      <UnitDetailPage unitId={id} />
    </DashboardLayout>
  );
}
