"use client";

import { Button, Card, Popconfirm, Skeleton, Switch } from "antd";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  useDeleteSupplier,
  useSupplier,
  useUpdateSupplier,
} from "../hooks/use-suppliers";
import SupplierInfoTable from "./supplier-info-table";

type SupplierDetailPageProps = {
  supplierId: string;
};

export default function SupplierDetailPage({
  supplierId,
}: SupplierDetailPageProps) {
  const router = useRouter();

  const supplierQuery = useSupplier(supplierId);
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  const supplier = supplierQuery.data?.data;

  function handleDelete() {
    deleteSupplier.mutate(supplierId, {
      onSuccess: () => router.push("/master_data/suppliers"),
    });
  }

  function handleToggleStatus(checked: boolean) {
    updateSupplier.mutate(
      {
        id: supplierId,
        payload: {
          isActive: checked,
        },
      },
      {
        onSuccess: () => supplierQuery.refetch(),
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
            onClick={() => router.push("/master_data/suppliers")}
          >
            Back to List
          </Button>

          <Button
            type="text"
            className="!rounded-none !border-none"
            icon={<Pencil size={15} />}
            onClick={() =>
              router.push(`/master_data/suppliers/${supplierId}/edit`)
            }
          >
            Edit
          </Button>

          <Popconfirm
            title="Deactivate supplier?"
            description="Supplier akan dinonaktifkan."
            okText="Ya"
            cancelText="Batal"
            onConfirm={handleDelete}
          >
            <Button
              type="text"
              danger
              className="!rounded-none !border-none"
              icon={<Trash2 size={15} />}
              loading={deleteSupplier.isPending}
            >
              Delete
            </Button>
          </Popconfirm>

          {supplier && (
            <Switch
              checked={supplier.isActive}
              checkedChildren="Aktif"
              unCheckedChildren="Nonaktif"
              loading={updateSupplier.isPending}
              onChange={handleToggleStatus}
            />
          )}
        </div>
      </Card>

      <Card
        className="!rounded-none !border !border-slate-200 !bg-white"
        styles={{ body: { padding: 16 } }}
      >
        {supplierQuery.isLoading || !supplier ? (
          <Skeleton active />
        ) : (
          <SupplierInfoTable supplier={supplier} />
        )}
      </Card>
    </div>
  );
}
