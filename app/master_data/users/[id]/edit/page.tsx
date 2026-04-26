import { auth } from "@/auth";
import DashboardLayout from "@/components/layout/dashboard-layout";
import UserFormPage from "@/features/users/components/user-form-page";
import { redirect } from "next/navigation";

type EditUserPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditUserPage({ params }: EditUserPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <DashboardLayout
      session={session}
      title="Edit User"
      breadcrumbs={[
        { title: "Master Data" },
        { title: "Users", href: "/master_data/users" },
        { title: "Edit" },
      ]}
    >
      <UserFormPage mode="edit" userId={id} />
    </DashboardLayout>
  );
}
