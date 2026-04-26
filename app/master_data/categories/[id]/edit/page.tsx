import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import CategoryFormPage from "@/features/categories/components/category-form-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

type EditCategoryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "categories.update")) {
    redirect("/dashboard");
  }

  const { id } = await params;

  return (
    <DashboardLayout
      session={session}
      title="Edit Kategori"
      breadcrumbs={[
        { title: "Master Data" },
        { title: "Kategori Obat", href: "/master_data/categories" },
        { title: "Edit" },
      ]}
      description="Perbarui data kategori obat."
    >
      <CategoryFormPage mode="edit" categoryId={id} />
    </DashboardLayout>
  );
}
