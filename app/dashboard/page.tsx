import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import DashboardPageClient from "@/features/dashboard/components/dashboard-page-client";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "dashboard.view")) {
    redirect("/login");
  }

  return (
    <DashboardLayout
      session={session}
      title="Dashboard"
      breadcrumbs={[{ title: "Dashboard" }]}
      description="Ringkasan stok, penjualan, pembelian, dan aktivitas terbaru."
    >
      <DashboardPageClient />
    </DashboardLayout>
  );
}
