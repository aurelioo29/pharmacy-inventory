import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import UnitsPageClient from "@/features/units/components/units-page-client";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function UnitsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "units.view")) {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout
      session={session}
      title="Satuan Obat"
      breadcrumbs={[{ title: "Master Data" }, { title: "Satuan Obat" }]}
      description="Kelola satuan data obat."
    >
      <UnitsPageClient />
    </DashboardLayout>
  );
}
