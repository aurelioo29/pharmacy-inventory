import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import MedicineFormPage from "@/features/medicines/components/medicine-form-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function NewMedicinePage() {
  const session = await auth();

  if (!session) redirect("/login");

  if (!hasPermission(session, "medicines.create")) {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout
      session={session}
      title="Obat Baru"
      breadcrumbs={[
        { title: "Master Data" },
        { title: "Obat", href: "/master_data/medicines" },
        { title: "Baru" },
      ]}
    >
      <MedicineFormPage mode="create" />
    </DashboardLayout>
  );
}
