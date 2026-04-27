import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StockMovementDetailPage from "@/features/stock-movements/components/stock-movement-detail-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

type StockMovementDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StockMovementDetailRoute({
  params,
}: StockMovementDetailRouteProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "stock.movement.view")) {
    redirect("/dashboard");
  }

  const { id } = await params;

  return (
    <DashboardLayout
      session={session}
      title="Detail Kartu Stok"
      breadcrumbs={[
        { title: "Stock Obat", href: "/stock" },
        { title: "Kartu Stok", href: "/stock/movements" },
        { title: "Detail" },
      ]}
      description="Lihat detail pergerakan stok obat."
    >
      <StockMovementDetailPage stockMovementId={id} />
    </DashboardLayout>
  );
}
