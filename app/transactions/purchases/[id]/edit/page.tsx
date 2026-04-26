import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import PurchaseFormPage from "@/features/purchases/components/purchase-form-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

type EditPurchasePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPurchasePage({
  params,
}: EditPurchasePageProps) {
  const session = await auth();

  if (!session) redirect("/login");

  if (!hasPermission(session, "purchases.update")) {
    redirect("/dashboard");
  }

  const { id } = await params;

  return (
    <DashboardLayout
      session={session}
      title="Edit Pembelian"
      breadcrumbs={[
        { title: "Transaksi" },
        { title: "Pembelian Obat", href: "/transactions/purchases" },
        { title: "Edit" },
      ]}
    >
      <PurchaseFormPage mode="edit" purchaseId={id} />
    </DashboardLayout>
  );
}
