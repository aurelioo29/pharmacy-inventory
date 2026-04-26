import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import CategoriesPageClient from "@/features/categories/components/categories-page-client";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function CategoriesPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "categories.view")) {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout
      session={session}
      title="Kategori Obat"
      breadcrumbs={[{ title: "Master Data" }, { title: "Kategori Obat" }]}
      description="Kelola kategori data obat."
    >
      <CategoriesPageClient />
    </DashboardLayout>
  );
}
