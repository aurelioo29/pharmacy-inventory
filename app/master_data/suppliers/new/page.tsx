import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import SupplierFormPage from "@/features/suppliers/components/supplier-form-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function NewSupplierPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "suppliers.create")) {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout
      session={session}
      title="Supplier Baru"
      breadcrumbs={[
        { title: "Master Data" },
        { title: "Supplier", href: "/master_data/suppliers" },
        { title: "Baru" },
      ]}
      description="Tambah supplier obat baru."
    >
      <SupplierFormPage mode="create" />
    </DashboardLayout>
  );
}
