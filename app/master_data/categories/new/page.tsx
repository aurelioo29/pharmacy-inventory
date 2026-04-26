import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import CategoryFormPage from "@/features/categories/components/category-form-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function NewCategoryPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "categories.create")) {
    redirect("/dashboard");
  }

  return (
    <DashboardLayout
      session={session}
      title="Kategori Baru"
      breadcrumbs={[
        { title: "Master Data" },
        { title: "Kategori Obat", href: "/master_data/categories" },
        { title: "Baru" },
      ]}
      description="Tambah kategori obat baru."
    >
      <CategoryFormPage mode="create" />
    </DashboardLayout>
  );
}
