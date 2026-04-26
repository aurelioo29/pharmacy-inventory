import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StockDetailPage from "@/features/stock/components/stock-detail-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

type StockDetailRouteProps = {
  params: Promise<{
    medicineId: string;
  }>;
};

export default async function StockDetailRoute({
  params,
}: StockDetailRouteProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "stock.view")) {
    redirect("/dashboard");
  }

  const { medicineId } = await params;

  return (
    <DashboardLayout
      session={session}
      title="Detail Stock"
      breadcrumbs={[
        { title: "Stock Obat", href: "/stock" },
        { title: "Detail" },
      ]}
    >
      <StockDetailPage medicineId={medicineId} />
    </DashboardLayout>
  );
}
