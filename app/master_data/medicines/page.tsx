import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import MedicinesPageClient from "@/features/medicines/components/medicines-page-client";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function MedicinesPage() {
  const session = await auth();

  if (!session) redirect("/login");

  if (!hasPermission(session, "medicines.view")) {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout
      session={session}
      title="Obat"
      breadcrumbs={[{ title: "Master Data" }, { title: "Obat" }]}
    >
      <MedicinesPageClient />
    </DashboardLayout>
  );
}
