"use client";

import { Button, Card, Popconfirm, Skeleton, Switch } from "antd";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { useDeleteRole, useRole, useUpdateRole } from "../hooks/use-roles";
import RoleInfoTable from "./role-info-table";

type RoleDetailPageProps = {
  roleId: string;
};

export default function RoleDetailPage({ roleId }: RoleDetailPageProps) {
  const router = useRouter();

  const roleQuery = useRole(roleId);
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const role = roleQuery.data?.data;

  function handleDelete() {
    deleteRole.mutate(roleId, {
      onSuccess: () => router.push("/master_data/roles"),
    });
  }

  function handleToggleStatus(checked: boolean) {
    updateRole.mutate(
      {
        id: roleId,
        payload: {
          isActive: checked,
        },
      },
      {
        onSuccess: () => roleQuery.refetch(),
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
          <Button
            type="text"
            className="!rounded-none !border-none !px-0"
            icon={<ArrowLeft size={15} />}
            onClick={() => router.push("/master_data/roles")}
          >
            Back to List
          </Button>

          <Button
            type="text"
            className="!rounded-none !border-none"
            icon={<Pencil size={15} />}
            onClick={() => router.push(`/master_data/roles/${roleId}/edit`)}
          >
            Edit
          </Button>

          <Popconfirm
            title="Deactivate role?"
            description="Role akan dinonaktifkan."
            okText="Ya"
            cancelText="Batal"
            onConfirm={handleDelete}
          >
            <Button
              type="text"
              danger
              className="!rounded-none !border-none"
              icon={<Trash2 size={15} />}
              loading={deleteRole.isPending}
            >
              Delete
            </Button>
          </Popconfirm>

          {role && (
            <Switch
              checked={role.isActive}
              checkedChildren="Aktif"
              unCheckedChildren="Nonaktif"
              loading={updateRole.isPending}
              onChange={handleToggleStatus}
            />
          )}
        </div>
      </Card>

      <Card
        className="!rounded-none !border !border-slate-200 !bg-white"
        styles={{ body: { padding: 16 } }}
      >
        {roleQuery.isLoading || !role ? (
          <Skeleton active />
        ) : (
          <RoleInfoTable role={role} />
        )}
      </Card>
    </div>
  );
}
