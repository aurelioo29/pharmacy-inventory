"use client";

import { useMemo, useState } from "react";
import { Card, Table, Tag } from "antd";
import type { MenuProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import FilterActions from "@/components/ui/filters/filter-actions";
import FilterDropdown from "@/components/ui/filters/filter-dropdown";
import FilterField from "@/components/ui/filters/filter-field";
import FilterInput from "@/components/ui/filters/filter-input";
import TableToolbar from "@/components/ui/table/table-toolbar";

import { useStocks } from "../hooks/use-stock";
import type { StockMedicine, StockStatus } from "../types/stock";

function getStatusTag(status: StockStatus) {
  if (status === "OUT_OF_STOCK") {
    return <Tag color="red">Out of Stock</Tag>;
  }

  if (status === "LOW_STOCK") {
    return <Tag color="orange">Low Stock</Tag>;
  }

  return <Tag color="green">Safe</Tag>;
}

export default function StockPageClient() {
  const router = useRouter();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>([
    "code",
    "name",
    "category",
    "unit",
    "totalStock",
    "minimumStock",
    "stockStatus",
  ]);

  const stockQuery = useStocks({ search, status, page, limit });

  const stocks = stockQuery.data?.data.stocks || [];
  const pagination = stockQuery.data?.data.pagination;

  const parameterText = useMemo(() => {
    const params: string[] = [];

    if (search) params.push(`keyword: ${search}`);
    if (status) params.push(`status: ${status}`);

    return params.length > 0 ? params.join(", ") : "no search parameters found";
  }, [search, status]);

  const statusLabel =
    status === "OUT_OF_STOCK"
      ? "Out of Stock"
      : status === "LOW_STOCK"
        ? "Low Stock"
        : status === "SAFE"
          ? "Safe"
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
      key: "out",
      label: "Out of Stock",
      onClick: () => {
        setStatus("OUT_OF_STOCK");
        setPage(1);
      },
    },
    {
      key: "low",
      label: "Low Stock",
      onClick: () => {
        setStatus("LOW_STOCK");
        setPage(1);
      },
    },
    {
      key: "safe",
      label: "Safe",
      onClick: () => {
        setStatus("SAFE");
        setPage(1);
      },
    },
  ];

  const columnOptions = [
    { key: "code", label: "Code" },
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "unit", label: "Unit" },
    { key: "totalStock", label: "Total Stock" },
    { key: "minimumStock", label: "Minimum Stock" },
    { key: "stockStatus", label: "Status" },
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

  function openDetailPage(stock: StockMedicine) {
    router.push(`/stock/${stock.id}`);
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

  const allColumns: ColumnsType<StockMedicine> = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (value: string, record) => (
        <button
          type="button"
          onClick={() => openDetailPage(record)}
          className="font-bold text-blue-600 hover:cursor-pointer hover:text-blue-700"
        >
          {value}
        </button>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Category",
      key: "category",
      render: (_, record) => record.category?.name || "-",
    },
    {
      title: "Unit",
      key: "unit",
      render: (_, record) => record.unit?.symbol || record.unit?.name || "-",
    },
    {
      title: "Total Stock",
      dataIndex: "totalStock",
      key: "totalStock",
      align: "right",
      render: (value: number) => (
        <span className="font-bold text-slate-900">{value}</span>
      ),
    },
    {
      title: "Minimum Stock",
      dataIndex: "minimumStock",
      key: "minimumStock",
      align: "right",
    },
    {
      title: "Status",
      dataIndex: "stockStatus",
      key: "stockStatus",
      align: "center",
      render: (value: StockStatus) => getStatusTag(value),
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
              placeholder="Search code or medicine name"
              onChange={setSearchInput}
              onEnter={handleSearch}
            />
          </FilterField>

          <FilterField label="Stock Status" span="">
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
            onRefresh={() => stockQuery.refetch()}
            addText="Add New"
          />
        </div>

        <Table<StockMedicine>
          rowKey="id"
          size="large"
          columns={columns}
          dataSource={stocks}
          loading={stockQuery.isLoading}
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
