import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StockMovementsPageClient from "@/features/stock-movements/components/stock-movements-page-client";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function StockMovementsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "stock.movement.view")) {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout
      session={session}
      title="Kartu Stok"
      breadcrumbs={[
        { title: "Stock Obat", href: "/stock" },
        { title: "Kartu Stok" },
      ]}
      description="Lihat riwayat pergerakan stok obat."
    >
      <StockMovementsPageClient />
    </DashboardLayout>
  );
}
