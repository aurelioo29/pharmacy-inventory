import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import SupplierFormPage from "@/features/suppliers/components/supplier-form-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

type EditSupplierPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditSupplierPage({
  params,
}: EditSupplierPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "suppliers.update")) {
    redirect("/dashboard");
  }

  const { id } = await params;

  return (
    <DashboardLayout
      session={session}
      title="Edit Supplier"
      breadcrumbs={[
        { title: "Master Data" },
        { title: "Supplier", href: "/master_data/suppliers" },
        { title: "Edit" },
      ]}
    >
      <SupplierFormPage mode="edit" supplierId={id} />
    </DashboardLayout>
  );
}
