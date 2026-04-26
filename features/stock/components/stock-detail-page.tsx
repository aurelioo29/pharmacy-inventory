"use client";

import { Button, Card, Skeleton, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import InfoTable from "@/components/ui/table/info-table";
import StockAdjustmentModal from "@/features/stock-adjustments/components/stock-adjustment-modal";

import { useStockDetail } from "../hooks/use-stock";
import type { MedicineBatch, StockMovement } from "../types/stock";

type StockDetailPageProps = {
  medicineId: string;
};

export default function StockDetailPage({ medicineId }: StockDetailPageProps) {
  const router = useRouter();
  const stockQuery = useStockDetail(medicineId);
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);

  const data = stockQuery.data?.data;

  const stockInfoData: [string, React.ReactNode][] = data
    ? [
        ["Code", data.medicine.code],
        ["Medicine", data.medicine.name],
        [
          "Total Stock",
          <span
            key="total-stock"
            className={
              data.totalStock <= data.medicine.minimumStock
                ? "font-semibold text-red-600"
                : "font-semibold text-green-600"
            }
          >
            {data.totalStock}
          </span>,
        ],
        ["Minimum Stock", data.medicine.minimumStock],
      ]
    : [];

  const batchColumns: ColumnsType<MedicineBatch> = [
    {
      title: "Batch Number",
      dataIndex: "batchNumber",
      key: "batchNumber",
    },
    {
      title: "Expired Date",
      dataIndex: "expiredDate",
      key: "expiredDate",
      render: (value: string) => dayjs(value).format("DD-MM-YYYY"),
    },
    {
      title: "Initial Qty",
      dataIndex: "initialQuantity",
      key: "initialQuantity",
      align: "right",
    },
    {
      title: "Current Qty",
      dataIndex: "currentQuantity",
      key: "currentQuantity",
      align: "right",
      render: (value: number) => (
        <span className="font-bold text-slate-900">{value}</span>
      ),
    },
    {
      title: "Purchase Price",
      dataIndex: "purchasePrice",
      key: "purchasePrice",
      align: "right",
    },
    {
      title: "Selling Price",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      align: "right",
    },
  ];

  const movementColumns: ColumnsType<StockMovement> = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => dayjs(value).format("DD-MM-YYYY HH:mm:ss"),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (value: string) => {
        const color =
          value === "IN" ? "green" : value === "OUT" ? "red" : "orange";

        return <Tag color={color}>{value}</Tag>;
      },
    },
    {
      title: "Batch",
      key: "batch",
      render: (_, record) => record.batch?.batchNumber || "-",
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      align: "right",
    },
    {
      title: "Before",
      dataIndex: "stockBefore",
      key: "stockBefore",
      align: "right",
    },
    {
      title: "After",
      dataIndex: "stockAfter",
      key: "stockAfter",
      align: "right",
    },
    {
      title: "User",
      key: "user",
      render: (_, record) => record.user?.username || "-",
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (value?: string | null) => value || "-",
    },
  ];

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
            onClick={() => router.push("/stock")}
          >
            Back to List
          </Button>

          <Button
            type="text"
            className="!rounded-none !border-none"
            icon={<SlidersHorizontal size={15} />}
            onClick={() => setAdjustmentOpen(true)}
          >
            Adjustment
          </Button>
        </div>
      </Card>

      <Card
        className="!rounded-none !border !border-slate-200 !bg-white"
        styles={{ body: { padding: 16 } }}
      >
        {stockQuery.isLoading || !data ? (
          <Skeleton active />
        ) : (
          <InfoTable data={stockInfoData} />
        )}
      </Card>

      <Card
        title="Batches"
        className="!rounded-none !border !border-slate-200 !bg-white"
      >
        <Table<MedicineBatch>
          rowKey="id"
          size="large"
          columns={batchColumns}
          dataSource={data?.batches || []}
          loading={stockQuery.isLoading}
          pagination={false}
        />
      </Card>

      <Card
        title="Stock Movements"
        className="!rounded-none !border !border-slate-200 !bg-white"
      >
        <Table<StockMovement>
          rowKey="id"
          size="large"
          columns={movementColumns}
          dataSource={data?.movements || []}
          loading={stockQuery.isLoading}
          pagination={false}
        />
      </Card>

      {data && (
        <StockAdjustmentModal
          open={adjustmentOpen}
          medicineId={medicineId}
          batches={data.batches}
          onClose={() => setAdjustmentOpen(false)}
          onSuccess={() => {
            setAdjustmentOpen(false);
            stockQuery.refetch();
          }}
        />
      )}
    </div>
  );
}
