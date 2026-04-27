"use client";

import { useMemo, useState } from "react";
import { Card, Table, Tag } from "antd";
import type { MenuProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { Search } from "lucide-react";

import FilterActions from "@/components/ui/filters/filter-actions";
import FilterDropdown from "@/components/ui/filters/filter-dropdown";
import FilterField from "@/components/ui/filters/filter-field";
import FilterInput from "@/components/ui/filters/filter-input";
import TableToolbar from "@/components/ui/table/table-toolbar";

import { useExpiredMedicines } from "../hooks/use-expired-medicines";
import type {
  ExpiredMedicine,
  ExpiredMedicineStatus,
} from "../types/expired-medicine";

function getStatusTag(status: ExpiredMedicineStatus) {
  if (status === "EXPIRED") {
    return (
      <Tag color="red" className="!m-0">
        EXPIRED
      </Tag>
    );
  }

  return (
    <Tag color="orange" className="!m-0">
      EXPIRING SOON
    </Tag>
  );
}

function formatMoney(value?: string | number | null) {
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

export default function ExpiredMedicinesPageClient() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ExpiredMedicineStatus | "">("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>([
    "medicine",
    "batchNumber",
    "expiredDate",
    "daysLeft",
    "currentQuantity",
    "unit",
    "purchasePrice",
    "sellingPrice",
    "status",
  ]);

  const expiredMedicinesQuery = useExpiredMedicines({
    search,
    status,
    page,
    limit,
    thresholdDays: 30,
  });

  const expiredMedicines =
    expiredMedicinesQuery.data?.data.expiredMedicines || [];
  const pagination = expiredMedicinesQuery.data?.data.pagination;

  const parameterText = useMemo(() => {
    const params: string[] = [];

    if (search) params.push(`keyword: ${search}`);
    if (status) params.push(`status: ${status}`);

    return params.length > 0 ? params.join(", ") : "no search parameters found";
  }, [search, status]);

  const statusLabel =
    status === "EXPIRED"
      ? "Expired"
      : status === "EXPIRING_SOON"
        ? "Expiring Soon"
        : "Pilih status";

  const statusItems: MenuProps["items"] = [
    {
      key: "all",
      label: "Semua Status",
      onClick: () => {
        setStatus("");
        setPage(1);
      },
    },
    {
      key: "expired",
      label: "Expired",
      onClick: () => {
        setStatus("EXPIRED");
        setPage(1);
      },
    },
    {
      key: "soon",
      label: "Expiring Soon",
      onClick: () => {
        setStatus("EXPIRING_SOON");
        setPage(1);
      },
    },
  ];

  const columnOptions = [
    { key: "medicine", label: "Medicine" },
    { key: "batchNumber", label: "Batch" },
    { key: "expiredDate", label: "Expired Date" },
    { key: "daysLeft", label: "Days Left" },
    { key: "currentQuantity", label: "Current Qty" },
    { key: "unit", label: "Unit" },
    { key: "purchasePrice", label: "Purchase Price" },
    { key: "sellingPrice", label: "Selling Price" },
    { key: "status", label: "Status" },
  ];

  function handleSearch() {
    setSearch(searchInput);
    setPage(1);
  }

  function resetFilter() {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setPage(1);
  }

  function toggleColumn(key: string) {
    setVisibleColumnKeys((current) => {
      if (current.includes(key)) {
        if (current.length === 1) return current;
        return current.filter((item) => item !== key);
      }

      return [...current, key];
    });
  }

  const allColumns: ColumnsType<ExpiredMedicine> = [
    {
      title: "Medicine",
      key: "medicine",
      render: (_, record) =>
        `${record.medicine.code} - ${record.medicine.name}`,
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
      title: "Days Left",
      dataIndex: "daysLeft",
      key: "daysLeft",
      align: "right",
      render: (value: number) => {
        if (value < 0) {
          return (
            <span className="font-bold text-red-600">
              {Math.abs(value)} days ago
            </span>
          );
        }

        return <span className="font-bold text-orange-600">{value} days</span>;
      },
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
      title: "Unit",
      key: "unit",
      render: (_, record) =>
        record.medicine.unit?.symbol || record.medicine.unit?.name || "-",
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (value: ExpiredMedicineStatus) => getStatusTag(value),
    },
  ];

  const columns = allColumns.filter((column) =>
    visibleColumnKeys.includes(String(column.key)),
  );

  return (
    <div className="flex flex-col gap-5">
      <Card
        className="!rounded-none !border !border-slate-200 !bg-white"
        styles={{ body: { padding: 16 } }}
      >
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <FilterField label="Keyword" span="">
            <FilterInput
              value={searchInput}
              placeholder="Search medicine or batch"
              onChange={setSearchInput}
              onEnter={handleSearch}
            />
          </FilterField>

          <FilterField label="Status" span="">
            <FilterDropdown
              label={statusLabel}
              muted={!status}
              items={statusItems}
            />
          </FilterField>

          <FilterActions
            span="md:col-span-3"
            onSearch={handleSearch}
            onReset={resetFilter}
          />
        </div>
      </Card>

      <Card
        className="!rounded-none !border !border-slate-200 !bg-white"
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="text-md italic text-slate-700">
            <Search size={13} className="mr-1 inline" />
            Parameter: {parameterText}
          </div>

          <TableToolbar
            selectedCount={0}
            bulkItems={[]}
            columnItems={columnOptions}
            visibleColumnKeys={visibleColumnKeys}
            onToggleColumn={toggleColumn}
            onRefresh={() => expiredMedicinesQuery.refetch()}
            addText="Add New"
          />
        </div>

        <Table<ExpiredMedicine>
          rowKey="id"
          size="large"
          columns={columns}
          dataSource={expiredMedicines}
          loading={expiredMedicinesQuery.isLoading}
          pagination={{
            current: page,
            pageSize: limit,
            total: pagination?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: [10, 25, 50, 100],
            showTotal: (total, range) =>
              `showing ${range[0]} to ${range[1]} of ${total} items`,
            onChange: (nextPage, nextLimit) => {
              setPage(nextPage);
              setLimit(nextLimit);
            },
          }}
        />
      </Card>
    </div>
  );
}
