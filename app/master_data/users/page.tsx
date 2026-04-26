import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import UsersPageClient from "@/features/users/components/users-page-client";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardLayout
      session={session}
      title="Users"
      breadcrumbs={[{ title: "Master Data" }, { title: "Users" }]}
    >
      <UsersPageClient />
    </DashboardLayout>
  );
}
