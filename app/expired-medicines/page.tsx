import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import ExpiredMedicinesPageClient from "@/features/expired-medicines/components/expired-medicines-page-client";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function ExpiredMedicinesPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "expired_medicines.view")) {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout
      session={session}
      title="Kadaluarsa Obat"
      breadcrumbs={[{ title: "Kadaluarsa Obat" }]}
      description="Pantau batch obat yang sudah kadaluarsa atau akan segera kadaluarsa."
    >
      <ExpiredMedicinesPageClient />
    </DashboardLayout>
  );
}
