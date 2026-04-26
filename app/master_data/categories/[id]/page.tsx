import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import CategoryDetailPage from "@/features/categories/components/category-detail-page";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

type CategoryDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function CategoryDetailRoute({
  params,
}: CategoryDetailRouteProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!hasPermission(session, "categories.view")) {
    redirect("/dashboard");
  }

  const { id } = await params;

  return (
    <DashboardLayout
      session={session}
      title="Detail Kategori"
      breadcrumbs={[
        { title: "Master Data" },
        { title: "Kategori Obat", href: "/master_data/categories" },
        { title: "Detail" },
      ]}
      description="Lihat detail kategori obat."
    >
      <CategoryDetailPage categoryId={id} />
    </DashboardLayout>
  );
}
