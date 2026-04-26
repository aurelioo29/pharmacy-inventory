"use client";

import { Button, Card, Skeleton, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import InfoTable from "@/components/ui/table/info-table";
import { useSale } from "../hooks/use-sales";
import type { SaleItem } from "../types/sale";

type SaleDetailPageProps = {
  saleId: string;
};

function formatMoney(value?: string | number | null) {
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

export default function SaleDetailPage({ saleId }: SaleDetailPageProps) {
  const router = useRouter();
  const saleQuery = useSale(saleId);

  const sale = saleQuery.data?.data;

  const infoData: [string, React.ReactNode][] = sale
    ? [
        ["Invoice Number", sale.invoiceNumber],
        ["Sale Date", dayjs(sale.saleDate).format("DD-MM-YYYY")],
        ["User", sale.user?.username || "-"],
        [
          "Total Amount",
          <span key="total" className="font-semibold text-blue-600">
            Rp {formatMoney(sale.totalAmount)}
          </span>,
        ],
        ["Paid Amount", `Rp ${formatMoney(sale.paidAmount)}`],
        [
          "Change Amount",
          <span key="change" className="font-semibold text-green-600">
            Rp {formatMoney(sale.changeAmount)}
          </span>,
        ],
        ["Notes", sale.notes || "-"],
        ["Created at", dayjs(sale.createdAt).format("DD-MM-YYYY HH:mm:ss")],
        [
          "Last updated at",
          dayjs(sale.updatedAt).format("DD-MM-YYYY HH:mm:ss"),
        ],
      ]
    : [];

  const columns: ColumnsType<SaleItem> = [
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
      key: "batch",
      render: (_, record) => record.batch?.batchNumber || "-",
    },
    {
      title: "Expired Date",
      key: "expiredDate",
      render: (_, record) =>
        record.batch?.expiredDate
          ? dayjs(record.batch.expiredDate).format("DD-MM-YYYY")
          : "-",
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      align: "right",
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
        <Button
          type="text"
          className="!rounded-none !border-none !px-0"
          icon={<ArrowLeft size={15} />}
          onClick={() => router.push("/transactions/sales")}
        >
          Back to List
        </Button>
      </Card>

      <Card
        className="!rounded-none !border !border-slate-200 !bg-white"
        styles={{ body: { padding: 16 } }}
      >
        {saleQuery.isLoading || !sale ? (
          <Skeleton active />
        ) : (
          <InfoTable data={infoData} />
        )}
      </Card>

      <Card
        title="Sale Items"
        className="!rounded-none !border !border-slate-200 !bg-white"
      >
        <Table<SaleItem>
          rowKey="id"
          size="large"
          columns={columns}
          dataSource={sale?.items || []}
          loading={saleQuery.isLoading}
          pagination={false}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
}
