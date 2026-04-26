import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import MedicineFormPage from "@/features/medicines/components/medicine-form-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

type EditMedicinePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditMedicinePage({
  params,
}: EditMedicinePageProps) {
  const session = await auth();

  if (!session) redirect("/login");

  if (!hasPermission(session, "medicines.update")) {
    redirect("/dashboard");
  }

  const { id } = await params;

  return (
    <DashboardLayout
      session={session}
      title="Edit Obat"
      breadcrumbs={[
        { title: "Master Data" },
        { title: "Obat", href: "/master_data/medicines" },
        { title: "Edit" },
      ]}
    >
      <MedicineFormPage mode="edit" medicineId={id} />
    </DashboardLayout>
  );
}