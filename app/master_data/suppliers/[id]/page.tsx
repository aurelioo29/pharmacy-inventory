import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import SupplierDetailPage from "@/features/suppliers/components/supplier-detail-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

type SupplierDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SupplierDetailRoute({
  params,
}: SupplierDetailRouteProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "suppliers.view")) {
    redirect("/dashboard");
  }

  const { id } = await params;

  return (
    <DashboardLayout
      session={session}
      title="Detail Supplier"
      breadcrumbs={[
        { title: "Master Data" },
        { title: "Supplier", href: "/master_data/suppliers" },
        { title: "Detail" },
      ]}
    >
      <SupplierDetailPage supplierId={id} />
    </DashboardLayout>
  );
}
