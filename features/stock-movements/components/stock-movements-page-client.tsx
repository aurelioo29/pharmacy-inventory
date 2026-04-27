"use client";

import { useMemo, useState } from "react";
import { Card, Table, Tag } from "antd";
import type { MenuProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Search } from "lucide-react";

import FilterActions from "@/components/ui/filters/filter-actions";
import FilterDropdown from "@/components/ui/filters/filter-dropdown";
import FilterField from "@/components/ui/filters/filter-field";
import FilterInput from "@/components/ui/filters/filter-input";
import TableToolbar from "@/components/ui/table/table-toolbar";

import { useStockMovements } from "../hooks/use-stock-movements";
import type { StockMovement, StockMovementType } from "../types/stock-movement";

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

export default function StockMovementsPageClient() {
  const router = useRouter();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<StockMovementType | "">("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>([
    "createdAt",
    "type",
    "medicine",
    "batch",
    "quantity",
    "stockBefore",
    "stockAfter",
    "referenceType",
    "user",
    "notes",
  ]);

  const stockMovementsQuery = useStockMovements({
    search,
    type,
    page,
    limit,
  });

  const stockMovements = stockMovementsQuery.data?.data.stockMovements || [];
  const pagination = stockMovementsQuery.data?.data.pagination;

  const parameterText = useMemo(() => {
    const params: string[] = [];

    if (search) params.push(`keyword: ${search}`);
    if (type) params.push(`type: ${type}`);

    return params.length > 0 ? params.join(", ") : "no search parameters found";
  }, [search, type]);

  const typeLabel = type || "Pilih type";

  const typeItems: MenuProps["items"] = [
    {
      key: "all",
      label: "Semua Type",
      onClick: () => {
        setType("");
        setPage(1);
      },
    },
    {
      key: "IN",
      label: "IN",
      onClick: () => {
        setType("IN");
        setPage(1);
      },
    },
    {
      key: "OUT",
      label: "OUT",
      onClick: () => {
        setType("OUT");
        setPage(1);
      },
    },
    {
      key: "ADJUSTMENT",
      label: "ADJUSTMENT",
      onClick: () => {
        setType("ADJUSTMENT");
        setPage(1);
      },
    },
  ];

  const columnOptions = [
    { key: "createdAt", label: "Date" },
    { key: "type", label: "Type" },
    { key: "medicine", label: "Medicine" },
    { key: "batch", label: "Batch" },
    { key: "quantity", label: "Qty" },
    { key: "stockBefore", label: "Before" },
    { key: "stockAfter", label: "After" },
    { key: "referenceType", label: "Reference" },
    { key: "user", label: "User" },
    { key: "notes", label: "Notes" },
  ];

  function handleSearch() {
    setSearch(searchInput);
    setPage(1);
  }

  function resetFilter() {
    setSearchInput("");
    setSearch("");
    setType("");
    setPage(1);
  }

  function openDetailPage(stockMovement: StockMovement) {
    router.push(`/stock/movements/${stockMovement.id}`);
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

  const allColumns: ColumnsType<StockMovement> = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string, record) => (
        <button
          type="button"
          onClick={() => openDetailPage(record)}
          className="block text-left text-md font-bold text-blue-600 hover:cursor-pointer hover:text-blue-700"
        >
          {dayjs(value).format("DD-MM-YYYY HH:mm:ss")}
        </button>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      align: "center",
      render: (value: StockMovementType) => getMovementTag(value),
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
      render: (value: number, record) => (
        <span
          className={
            record.type === "IN"
              ? "font-bold text-green-600"
              : record.type === "OUT"
                ? "font-bold text-red-600"
                : "font-bold text-orange-600"
          }
        >
          {record.type === "IN" ? "+" : "-"}
          {value}
        </span>
      ),
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
      title: "Reference",
      dataIndex: "referenceType",
      key: "referenceType",
      render: (value?: string | null) => value || "-",
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
              placeholder="Search medicine, batch, reference, notes"
              onChange={setSearchInput}
              onEnter={handleSearch}
            />
          </FilterField>

          <FilterField label="Type" span="">
            <FilterDropdown label={typeLabel} muted={!type} items={typeItems} />
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
            onRefresh={() => stockMovementsQuery.refetch()}
            addText="Add New"
          />
        </div>

        <Table<StockMovement>
          rowKey="id"
          size="large"
          columns={columns}
          dataSource={stockMovements}
          loading={stockMovementsQuery.isLoading}
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
