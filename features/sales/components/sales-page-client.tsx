"use client";

import { useMemo, useState } from "react";
import { Card, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Search } from "lucide-react";

import FilterActions from "@/components/ui/filters/filter-actions";
import FilterField from "@/components/ui/filters/filter-field";
import FilterInput from "@/components/ui/filters/filter-input";
import TableToolbar from "@/components/ui/table/table-toolbar";

import { useSales } from "../hooks/use-sales";
import type { Sale } from "../types/sale";

function formatMoney(value?: string | number | null) {
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

export default function SalesPageClient() {
  const router = useRouter();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>([
    "invoiceNumber",
    "saleDate",
    "totalAmount",
    "paidAmount",
    "changeAmount",
    "user",
    "createdAt",
  ]);

  const salesQuery = useSales({ search, page, limit });

  const sales = salesQuery.data?.data.sales || [];
  const pagination = salesQuery.data?.data.pagination;

  const parameterText = useMemo(() => {
    const params: string[] = [];

    if (search) params.push(`keyword: ${search}`);

    return params.length > 0 ? params.join(", ") : "no search parameters found";
  }, [search]);

  const columnOptions = [
    { key: "invoiceNumber", label: "Invoice Number" },
    { key: "saleDate", label: "Sale Date" },
    { key: "totalAmount", label: "Total Amount" },
    { key: "paidAmount", label: "Paid Amount" },
    { key: "changeAmount", label: "Change Amount" },
    { key: "user", label: "User" },
    { key: "createdAt", label: "Created at" },
  ];

  function handleSearch() {
    setSearch(searchInput);
    setPage(1);
  }

  function resetFilter() {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }

  function openCreatePage() {
    router.push("/transactions/sales/new");
  }

  function openDetailPage(sale: Sale) {
    router.push(`/transactions/sales/${sale.id}`);
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

  const allColumns: ColumnsType<Sale> = [
    {
      title: "Invoice Number",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      render: (_, record) => (
        <button
          type="button"
          onClick={() => openDetailPage(record)}
          className="block text-left text-md font-bold text-blue-600 hover:cursor-pointer hover:text-blue-700"
        >
          {record.invoiceNumber}
        </button>
      ),
    },
    {
      title: "Sale Date",
      dataIndex: "saleDate",
      key: "saleDate",
      render: (value: string) => dayjs(value).format("DD-MM-YYYY"),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "right",
      render: (value: string) => (
        <span className="font-bold text-slate-900">
          Rp {formatMoney(value)}
        </span>
      ),
    },
    {
      title: "Paid Amount",
      dataIndex: "paidAmount",
      key: "paidAmount",
      align: "right",
      render: (value: string) => `Rp ${formatMoney(value)}`,
    },
    {
      title: "Change Amount",
      dataIndex: "changeAmount",
      key: "changeAmount",
      align: "right",
      render: (value: string) => (
        <span className="font-bold text-green-600">
          Rp {formatMoney(value)}
        </span>
      ),
    },
    {
      title: "User",
      key: "user",
      render: (_, record) => record.user?.username || "-",
    },
    {
      title: "Created at",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => dayjs(value).format("DD-MM-YYYY HH:mm:ss"),
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
          <FilterField label="Invoice / User" span="">
            <FilterInput
              value={searchInput}
              placeholder="Search invoice or user"
              onChange={setSearchInput}
              onEnter={handleSearch}
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
            onAdd={openCreatePage}
            onRefresh={() => salesQuery.refetch()}
            addText="Add New"
          />
        </div>

        <Table<Sale>
          rowKey="id"
          size="large"
          columns={columns}
          dataSource={sales}
          loading={salesQuery.isLoading}
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
