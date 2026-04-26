import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import SalesPageClient from "@/features/sales/components/sales-page-client";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function SalesPage() {
  const session = await auth();

  if (!session) redirect("/login");

  if (!hasPermission(session, "sales.view")) {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout
      session={session}
      title="Penjualan Obat"
      breadcrumbs={[{ title: "Transaksi" }, { title: "Penjualan Obat" }]}
      description="Kelola transaksi penjualan obat dan pengurangan stok FIFO."
    >
      <SalesPageClient />
    </DashboardLayout>
  );
}
