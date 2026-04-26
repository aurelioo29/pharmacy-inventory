"use client";

import { Button, Card, Popconfirm, Skeleton, Switch } from "antd";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { useDeleteUnit, useUnit, useUpdateUnit } from "../hooks/user-units";
import UnitInfoTable from "./unit-info-table";

type UnitDetailPageProps = {
  unitId: string;
};

export default function UnitDetailPage({ unitId }: UnitDetailPageProps) {
  const router = useRouter();

  const unitQuery = useUnit(unitId);
  const updateUnit = useUpdateUnit();
  const deleteUnit = useDeleteUnit();

  const unit = unitQuery.data?.data;

  function handleDelete() {
    deleteUnit.mutate(unitId, {
      onSuccess: () => router.push("/master_data/units"),
    });
  }

  function handleToggleStatus(checked: boolean) {
    updateUnit.mutate(
      {
        id: unitId,
        payload: {
          isActive: checked,
        },
      },
      {
        onSuccess: () => unitQuery.refetch(),
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
            onClick={() => router.push("/master_data/units")}
          >
            Back to List
          </Button>

          <Button
            type="text"
            className="!rounded-none !border-none"
            icon={<Pencil size={15} />}
            onClick={() => router.push(`/master_data/units/${unitId}/edit`)}
          >
            Edit
          </Button>

          <Popconfirm
            title="Deactivate unit?"
            description="Satuan akan dinonaktifkan."
            okText="Ya"
            cancelText="Batal"
            onConfirm={handleDelete}
          >
            <Button
              type="text"
              danger
              className="!rounded-none !border-none"
              icon={<Trash2 size={15} />}
              loading={deleteUnit.isPending}
            >
              Delete
            </Button>
          </Popconfirm>

          {unit && (
            <Switch
              checked={unit.isActive}
              checkedChildren="Aktif"
              unCheckedChildren="Nonaktif"
              loading={updateUnit.isPending}
              onChange={handleToggleStatus}
            />
          )}
        </div>
      </Card>

      <Card
        className="!rounded-none !border !border-slate-200 !bg-white"
        styles={{ body: { padding: 16 } }}
      >
        {unitQuery.isLoading || !unit ? (
          <Skeleton active />
        ) : (
          <UnitInfoTable unit={unit} />
        )}
      </Card>
    </div>
  );
}
