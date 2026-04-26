import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import UnitFormPage from "@/features/units/components/unit-form-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function NewUnitPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "units.create")) {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout
      session={session}
      title="Satuan Baru"
      breadcrumbs={[
        { title: "Master Data" },
        { title: "Satuan Obat", href: "/master_data/units" },
        { title: "Baru" },
      ]}
      description="Tambah satuan obat baru."
    >
      <UnitFormPage mode="create" />
    </DashboardLayout>
  );
}
