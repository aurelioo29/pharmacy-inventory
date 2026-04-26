import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import UserFormPage from "@/features/users/components/user-form-page";
import { redirect } from "next/navigation";

export default async function NewUserPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <DashboardLayout
      session={session}
      title="User Baru"
      breadcrumbs={[
        { title: "Master Data" },
        { title: "Users", href: "/master_data/users" },
        { title: "Baru" },
      ]}
    >
      <UserFormPage mode="create" />
    </DashboardLayout>
  );
}
