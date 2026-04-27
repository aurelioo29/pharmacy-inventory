"use client";

import { Button, Card, Skeleton, Tag } from "antd";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

import InfoTable from "@/components/ui/table/info-table";
import { useStockMovement } from "../hooks/use-stock-movements";
import type { StockMovementType } from "../types/stock-movement";

type StockMovementDetailPageProps = {
  stockMovementId: string;
};

function getMovementTag(type: StockMovementType) {
  if (type === "IN") {
    return (
      <Tag color="green" className="!m-0">
        IN
      </Tag>
    );
  }

  if (type === "OUT") {
    return (
      <Tag color="red" className="!m-0">
        OUT
      </Tag>
    );
  }

  return (
    <Tag color="orange" className="!m-0">
      ADJUSTMENT
    </Tag>
  );
}

export default function StockMovementDetailPage({
  stockMovementId,
}: StockMovementDetailPageProps) {
  const router = useRouter();
  const stockMovementQuery = useStockMovement(stockMovementId);

  const stockMovement = stockMovementQuery.data?.data;

  const infoData: [string, React.ReactNode][] = stockMovement
    ? [
        ["Date", dayjs(stockMovement.createdAt).format("DD-MM-YYYY HH:mm:ss")],
        ["Type", getMovementTag(stockMovement.type)],
        [
          "Medicine",
          `${stockMovement.medicine.code} - ${stockMovement.medicine.name}`,
        ],
        ["Batch Number", stockMovement.batch.batchNumber],
        [
          "Expired Date",
          dayjs(stockMovement.batch.expiredDate).format("DD-MM-YYYY"),
        ],
        [
          "Quantity",
          <span
            key="quantity"
            className={
              stockMovement.type === "IN"
                ? "font-semibold text-green-600"
                : stockMovement.type === "OUT"
                  ? "font-semibold text-red-600"
                  : "font-semibold text-orange-600"
            }
          >
            {stockMovement.type === "IN" ? "+" : "-"}
            {stockMovement.quantity}
          </span>,
        ],
        ["Stock Before", stockMovement.stockBefore],
        ["Stock After", stockMovement.stockAfter],
        ["Reference Type", stockMovement.referenceType || "-"],
        ["Reference ID", stockMovement.referenceId || "-"],
        ["User", stockMovement.user?.username || "-"],
        ["Notes", stockMovement.notes || "-"],
      ]
    : [];

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
          onClick={() => router.push("/stock/movements")}
        >
          Back to List
        </Button>
      </Card>

      <Card
        className="!rounded-none !border !border-slate-200 !bg-white"
        styles={{ body: { padding: 16 } }}
      >
        {stockMovementQuery.isLoading || !stockMovement ? (
          <Skeleton active />
        ) : (
          <InfoTable data={infoData} />
        )}
      </Card>
    </div>
  );
}
