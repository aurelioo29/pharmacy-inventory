"use client";

import { Button, Card, Popconfirm, Skeleton, Switch } from "antd";
import { ArrowLeft, KeyRound, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  useDeleteUser,
  useResetUserPassword,
  useUpdateUser,
  useUser,
} from "../hooks/use-users";
import ResetPasswordModal from "./reset-password-modal";
import UserInfoTable from "./user-info-table";

type UserDetailPageProps = {
  userId: string;
};

export default function UserDetailPage({ userId }: UserDetailPageProps) {
  const router = useRouter();

  const userQuery = useUser(userId);
  const deleteUser = useDeleteUser();
  const updateUser = useUpdateUser();
  const resetPassword = useResetUserPassword();

  const [resetOpen, setResetOpen] = useState(false);

  const user = userQuery.data?.data;

  function handleDelete() {
    deleteUser.mutate(userId, {
      onSuccess: () => router.push("/master_data/users"),
    });
  }

  function handleResetPassword(pin: string) {
    resetPassword.mutate(
      { id: userId, pin },
      {
        onSuccess: () => setResetOpen(false),
      },
    );
  }

  function handleToggleStatus(checked: boolean) {
    updateUser.mutate(
      {
        id: userId,
        payload: {
          isActive: checked,
        },
      },
      {
        onSuccess: () => {
          userQuery.refetch();
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Card
        className="!rounded-none !border !border-slate-200 !bg-white"
        styles={{ body: { padding: 12 } }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="text"
              className="!rounded-none !border-none !px-0"
              icon={<ArrowLeft size={15} />}
              onClick={() => router.push("/master_data/users")}
            >
              Back to List
            </Button>

            <Button
              type="text"
              className="!rounded-none !border-none"
              icon={<Pencil size={15} />}
              onClick={() => router.push(`/master_data/users/${userId}/edit`)}
            >
              Edit
            </Button>

            <Button
              type="text"
              className="!rounded-none !border-none !text-orange-500"
              icon={<KeyRound size={15} />}
              onClick={() => setResetOpen(true)}
            >
              Reset Password
            </Button>

            <Popconfirm
              title="Deactivate user?"
              description="User akan dinonaktifkan."
              okText="Ya"
              cancelText="Batal"
              onConfirm={handleDelete}
            >
              <Button
                type="text"
                danger
                className="!rounded-none !border-none"
                icon={<Trash2 size={15} />}
                loading={deleteUser.isPending}
              >
                Delete
              </Button>
            </Popconfirm>
          </div>

          {user && (
            <Switch
              checked={user.isActive}
              checkedChildren="Aktif"
              unCheckedChildren="Nonaktif"
              loading={updateUser.isPending}
              onChange={handleToggleStatus}
            />
          )}
        </div>
      </Card>

      <Card
        className="!rounded-none !border !border-slate-200 !bg-white"
        styles={{ body: { padding: 16 } }}
      >
        {userQuery.isLoading || !user ? (
          <Skeleton active />
        ) : (
          <UserInfoTable user={user} />
        )}
      </Card>

      <ResetPasswordModal
        open={resetOpen}
        loading={resetPassword.isPending}
        onClose={() => setResetOpen(false)}
        onSubmit={handleResetPassword}
      />
    </div>
  );
}
