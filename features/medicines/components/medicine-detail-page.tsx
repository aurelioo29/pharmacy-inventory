"use client";

import { Button, Card, Popconfirm, Skeleton, Switch } from "antd";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  useDeleteMedicine,
  useMedicine,
  useUpdateMedicine,
} from "../hooks/use-medicines";
import MedicineInfoTable from "./medicine-info-table";

type MedicineDetailPageProps = {
  medicineId: string;
};

export default function MedicineDetailPage({
  medicineId,
}: MedicineDetailPageProps) {
  const router = useRouter();

  const medicineQuery = useMedicine(medicineId);
  const updateMedicine = useUpdateMedicine();
  const deleteMedicine = useDeleteMedicine();

  const medicine = medicineQuery.data?.data;

  function handleDelete() {
    deleteMedicine.mutate(medicineId, {
      onSuccess: () => router.push("/master_data/medicines"),
    });
  }

  function handleToggleStatus(checked: boolean) {
    updateMedicine.mutate(
      {
        id: medicineId,
        payload: {
          isActive: checked,
        },
      },
      {
        onSuccess: () => medicineQuery.refetch(),
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
            onClick={() => router.push("/master_data/medicines")}
          >
            Back to List
          </Button>

          <Button
            type="text"
            className="!rounded-none !border-none"
            icon={<Pencil size={15} />}
            onClick={() =>
              router.push(`/master_data/medicines/${medicineId}/edit`)
            }
          >
            Edit
          </Button>

          <Popconfirm
            title="Deactivate medicine?"
            description="Obat akan dinonaktifkan."
            okText="Ya"
            cancelText="Batal"
            onConfirm={handleDelete}
          >
            <Button
              type="text"
              danger
              className="!rounded-none !border-none"
              icon={<Trash2 size={15} />}
              loading={deleteMedicine.isPending}
            >
              Delete
            </Button>
          </Popconfirm>

          {medicine && (
            <Switch
              checked={medicine.isActive}
              checkedChildren="Aktif"
              unCheckedChildren="Nonaktif"
              loading={updateMedicine.isPending}
              onChange={handleToggleStatus}
            />
          )}
        </div>
      </Card>

      <Card
        className="!rounded-none !border !border-slate-200 !bg-white"
        styles={{ body: { padding: 16 } }}
      >
        {medicineQuery.isLoading || !medicine ? (
          <Skeleton active />
        ) : (
          <MedicineInfoTable medicine={medicine} />
        )}
      </Card>
    </div>
  );
}
