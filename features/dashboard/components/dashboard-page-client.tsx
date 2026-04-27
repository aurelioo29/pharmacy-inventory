"use client";

import { Card, Skeleton, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  AlertTriangle,
  Boxes,
  CircleDollarSign,
  PackageSearch,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useDashboard } from "../hooks/use-dashboard";
import type {
  DashboardLowStockItem,
  DashboardRecentStockMovement,
} from "../types/dashboard";

function formatMoney(value?: string | number | null) {
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

function SummaryCard({
  title,
  value,
  icon,
  tone = "blue",
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  tone?: "blue" | "green" | "red" | "orange" | "slate";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-600",
    slate: "bg-slate-100 text-slate-700",
  }[tone];

  return (
    <Card
      className="!rounded-none !border !border-slate-200 !bg-white"
      styles={{ body: { padding: 16 } }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center ${toneClass}`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

function getMovementTag(type: DashboardRecentStockMovement["type"]) {
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

export default function DashboardPageClient() {
  const dashboardQuery = useDashboard();
  const dashboard = dashboardQuery.data?.data;

  const lowStockColumns: ColumnsType<DashboardLowStockItem> = [
    {
      title: "Medicine",
      key: "medicine",
      render: (_, record) => `${record.code} - ${record.name}`,
    },
    {
      title: "Stock",
      dataIndex: "totalStock",
      key: "totalStock",
      align: "right",
      render: (value: number) => (
        <span className="font-bold text-red-600">{value}</span>
      ),
    },
    {
      title: "Minimum",
      dataIndex: "minimumStock",
      key: "minimumStock",
      align: "right",
    },
    {
      title: "Unit",
      key: "unit",
      render: (_, record) => record.unit?.symbol || record.unit?.name || "-",
    },
  ];

  const movementColumns: ColumnsType<DashboardRecentStockMovement> = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => dayjs(value).format("DD-MM-YYYY HH:mm"),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      align: "center",
      render: getMovementTag,
    },
    {
      title: "Medicine",
      key: "medicine",
      render: (_, record) =>
        `${record.medicine.code} - ${record.medicine.name}`,
    },
    {
      title: "Batch",
      key: "batch",
      render: (_, record) => record.batch.batchNumber,
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      align: "right",
    },
  ];

  if (dashboardQuery.isLoading || !dashboard) {
    return <Skeleton active />;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Obat"
          value={dashboard.summary.totalMedicines}
          icon={<PackageSearch size={22} />}
          tone="blue"
        />

        <SummaryCard
          title="Total Stock"
          value={dashboard.summary.totalStock}
          icon={<Boxes size={22} />}
          tone="green"
        />

        <SummaryCard
          title="Stok Rendah"
          value={dashboard.summary.lowStockCount}
          icon={<AlertTriangle size={22} />}
          tone="red"
        />

        <SummaryCard
          title="Expired / Soon"
          value={`${dashboard.summary.expiredCount} / ${dashboard.summary.expiringSoonCount}`}
          icon={<AlertTriangle size={22} />}
          tone="orange"
        />

        <SummaryCard
          title="Sales Hari Ini"
          value={`Rp ${formatMoney(dashboard.summary.todaySales)}`}
          icon={<CircleDollarSign size={22} />}
          tone="green"
        />

        <SummaryCard
          title="Purchase Hari Ini"
          value={`Rp ${formatMoney(dashboard.summary.todayPurchases)}`}
          icon={<ShoppingCart size={22} />}
          tone="blue"
        />
      </div>

      <Card
        title={
          <div className="flex items-center gap-2">
            <TrendingUp size={16} />
            Sales 7 Hari Terakhir
          </div>
        }
        className="!rounded-none !border !border-slate-200 !bg-white"
      >
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboard.salesChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => dayjs(value).format("DD/MM")}
              />
              <YAxis tickFormatter={(value) => `${Number(value) / 1000}k`} />
              <Tooltip
                formatter={(value) => [
                  `Rp ${formatMoney(Number(value))}`,
                  "Sales",
                ]}
                labelFormatter={(label) => dayjs(label).format("DD-MM-YYYY")}
              />
              <Bar dataKey="total" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card
          title="Low Stock"
          className="!rounded-none !border !border-slate-200 !bg-white"
        >
          <Table<DashboardLowStockItem>
            rowKey="id"
            size="large"
            columns={lowStockColumns}
            dataSource={dashboard.lowStock}
            pagination={false}
          />
        </Card>

        <Card
          title="Recent Stock Movement"
          className="!rounded-none !border !border-slate-200 !bg-white"
        >
          <Table<DashboardRecentStockMovement>
            rowKey="id"
            size="large"
            columns={movementColumns}
            dataSource={dashboard.recentStockMovements}
            pagination={false}
            scroll={{ x: 800 }}
          />
        </Card>
      </div>
    </div>
  );
}
