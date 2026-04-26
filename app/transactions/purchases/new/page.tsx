import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import PurchaseFormPage from "@/features/purchases/components/purchase-form-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function NewPurchasePage() {
  const session = await auth();

  if (!session) redirect("/login");

  if (!hasPermission(session, "purchases.create")) {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout
      session={session}
      title="Pembelian Baru"
      breadcrumbs={[
        { title: "Transaksi" },
        { title: "Pembelian Obat", href: "/transactions/purchases" },
        { title: "Baru" },
      ]}
    >
      <PurchaseFormPage mode="create" />
    </DashboardLayout>
  );
}
