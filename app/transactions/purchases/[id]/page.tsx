import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import PurchaseDetailPage from "@/features/purchases/components/purchase-detail-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

type PurchaseDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PurchaseDetailRoute({
  params,
}: PurchaseDetailRouteProps) {
  const session = await auth();

  if (!session) redirect("/login");

  if (!hasPermission(session, "purchases.view")) {
    redirect("/dashboard");
  }

  const { id } = await params;

  return (
    <DashboardLayout
      session={session}
      title="Detail Pembelian"
      breadcrumbs={[
        { title: "Transaksi" },
        { title: "Pembelian Obat", href: "/transactions/purchases" },
        { title: "Detail" },
      ]}
    >
      <PurchaseDetailPage purchaseId={id} />
    </DashboardLayout>
  );
}
