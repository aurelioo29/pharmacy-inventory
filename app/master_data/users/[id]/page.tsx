import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import UserDetailPage from "@/features/users/components/user-detail-page";
import { redirect } from "next/navigation";

type UserDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function UserDetailRoute({
  params,
}: UserDetailRouteProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <DashboardLayout
      session={session}
      title="Detail User"
      breadcrumbs={[
        { title: "Master Data" },
        { title: "Users", href: "/master_data/users" },
        { title: "Detail" },
      ]}
    >
      <UserDetailPage userId={id} />
    </DashboardLayout>
  );
}
