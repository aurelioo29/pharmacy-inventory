import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import MedicineDetailPage from "@/features/medicines/components/medicine-detail-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

type MedicineDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MedicineDetailRoute({
  params,
}: MedicineDetailRouteProps) {
  const session = await auth();

  if (!session) redirect("/login");

  if (!hasPermission(session, "medicines.view")) {
    redirect("/dashboard");
  }

  const { id } = await params;

  return (
    <DashboardLayout
      session={session}
      title="Detail Obat"
      breadcrumbs={[
        { title: "Master Data" },
        { title: "Obat", href: "/master_data/medicines" },
        { title: "Detail" },
      ]}
    >
      <MedicineDetailPage medicineId={id} />
    </DashboardLayout>
  );
}
