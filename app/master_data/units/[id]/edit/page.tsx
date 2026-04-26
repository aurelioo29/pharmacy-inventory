import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import UnitFormPage from "@/features/units/components/unit-form-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

type EditUnitPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditUnitPage({ params }: EditUnitPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "units.update")) {
    redirect("/dashboard");
  }

  const { id } = await params;

  return (
    <DashboardLayout
      session={session}
      title="Edit Satuan"
      breadcrumbs={[
        { title: "Master Data" },
        { title: "Satuan Obat", href: "/master_data/units" },
        { title: "Edit" },
      ]}
    >
      <UnitFormPage mode="edit" unitId={id} />
    </DashboardLayout>
  );
}
