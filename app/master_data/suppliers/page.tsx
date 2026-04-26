import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import SuppliersPageClient from "@/features/suppliers/components/suppliers-page-client";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function SuppliersPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "suppliers.view")) {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout
      session={session}
      title="Supplier"
      breadcrumbs={[{ title: "Master Data" }, { title: "Supplier" }]}
      description="Kelola data supplier obat."
    >
      <SuppliersPageClient />
    </DashboardLayout>
  );
}
