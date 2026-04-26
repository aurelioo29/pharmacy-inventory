"use client";

import { Button, Card, Skeleton, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { ArrowLeft, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

import InfoTable from "@/components/ui/table/info-table";
import { usePurchase } from "../hooks/use-purchases";
import type { PurchaseItem } from "../types/purchase";

type PurchaseDetailPageProps = {
  purchaseId: string;
};

function formatMoney(value?: string | number | null) {
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

export default function PurchaseDetailPage({
  purchaseId,
}: PurchaseDetailPageProps) {
  const router = useRouter();
  const purchaseQuery = usePurchase(purchaseId);

  const purchase = purchaseQuery.data?.data;

  const infoData: [string, React.ReactNode][] = purchase
    ? [
        ["Invoice Number", purchase.invoiceNumber],
        ["Supplier", purchase.supplier?.name || "-"],
        ["Purchase Date", dayjs(purchase.purchaseDate).format("DD-MM-YYYY")],
        ["User", purchase.user?.username || "-"],
        [
          "Total Amount",
          <span key="total" className="font-semibold text-blue-600">
            Rp {formatMoney(purchase.totalAmount)}
          </span>,
        ],
        ["Notes", purchase.notes || "-"],
        ["Created at", dayjs(purchase.createdAt).format("DD-MM-YYYY HH:mm:ss")],
        [
          "Last updated at",
          dayjs(purchase.updatedAt).format("DD-MM-YYYY HH:mm:ss"),
        ],
      ]
    : [];

  const columns: ColumnsType<PurchaseItem> = [
    {
      title: "Medicine",
      key: "medicine",
      render: (_, record) =>
        record.medicine
          ? `${record.medicine.code} - ${record.medicine.name}`
          : "-",
    },
    {
      title: "Batch",
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
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      align: "right",
    },
    {
      title: "Purchase Price",
      dataIndex: "purchasePrice",
      key: "purchasePrice",
      align: "right",
      render: (value: string) => `Rp ${formatMoney(value)}`,
    },
    {
      title: "Selling Price",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      align: "right",
      render: (value: string) => `Rp ${formatMoney(value)}`,
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      key: "subtotal",
      align: "right",
      render: (value: string) => (
        <span className="font-semibold text-slate-900">
          Rp {formatMoney(value)}
        </span>
      ),
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
            onClick={() => router.push("/transactions/purchases")}
          >
            Back to List
          </Button>

          <Button
            type="text"
            className="!rounded-none !border-none"
            icon={<Pencil size={15} />}
            onClick={() =>
              router.push(`/transactions/purchases/${purchaseId}/edit`)
            }
          >
            Edit
          </Button>
        </div>
      </Card>

      <Card
        className="!rounded-none !border !border-slate-200 !bg-white"
        styles={{ body: { padding: 16 } }}
      >
        {purchaseQuery.isLoading || !purchase ? (
          <Skeleton active />
        ) : (
          <InfoTable data={infoData} />
        )}
      </Card>

      <Card
        title="Purchase Items"
        className="!rounded-none !border !border-slate-200 !bg-white"
      >
        <Table<PurchaseItem>
          rowKey="id"
          size="large"
          columns={columns}
          dataSource={purchase?.items || []}
          loading={purchaseQuery.isLoading}
          pagination={false}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
}
