import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import PurchasesPageClient from "@/features/purchases/components/purchases-page-client";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function PurchasesPage() {
  const session = await auth();

  if (!session) redirect("/login");

  if (!hasPermission(session, "purchases.view")) {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout
      session={session}
      title="Pembelian Obat"
      breadcrumbs={[{ title: "Transaksi" }, { title: "Pembelian Obat" }]}
    >
      <PurchasesPageClient />
    </DashboardLayout>
  );
}
