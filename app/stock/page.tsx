import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import StockPageClient from "@/features/stock/components/stock-page-client";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function StockPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "stock.view")) {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout
      session={session}
      title="Stock Obat"
      breadcrumbs={[{ title: "Stock Obat" }]}
      description="Lihat jumlah stok obat berdasarkan batch."
    >
      <StockPageClient />
    </DashboardLayout>
  );
}
