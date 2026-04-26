import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import SaleDetailPage from "@/features/sales/components/sale-detail-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

type SaleDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SaleDetailRoute({
  params,
}: SaleDetailRouteProps) {
  const session = await auth();

  if (!session) redirect("/login");

  if (!hasPermission(session, "sales.view")) {
    redirect("/dashboard");
  }

  const { id } = await params;

  return (
    <DashboardLayout
      session={session}
      title="Detail Penjualan"
      breadcrumbs={[
        { title: "Transaksi" },
        { title: "Penjualan Obat", href: "/transactions/sales" },
        { title: "Detail" },
      ]}
      description="Lihat detail transaksi penjualan obat."
    >
      <SaleDetailPage saleId={id} />
    </DashboardLayout>
  );
}
