import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import SaleFormPage from "@/features/sales/components/sale-form-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function NewSalePage() {
  const session = await auth();

  if (!session) redirect("/login");

  if (!hasPermission(session, "sales.create")) {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout
      session={session}
      title="Penjualan Baru"
      breadcrumbs={[
        { title: "Transaksi" },
        { title: "Penjualan Obat", href: "/transactions/sales" },
        { title: "Baru" },
      ]}
      description="Tambah penjualan obat dan otomatis mengurangi stok."
    >
      <SaleFormPage />
    </DashboardLayout>
  );
}
