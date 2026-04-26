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

import { usePurchases } from "../hooks/use-purchases";
import type { Purchase } from "../types/purchase";

function formatMoney(value?: string | number | null) {
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

export default function PurchasesPageClient() {
  const router = useRouter();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>([
    "invoiceNumber",
    "supplier",
    "purchaseDate",
    "totalAmount",
    "user",
    "createdAt",
  ]);

  const purchasesQuery = usePurchases({
    search,
    page,
    limit,
  });

  const purchases = purchasesQuery.data?.data.purchases || [];
  const pagination = purchasesQuery.data?.data.pagination;

  const parameterText = useMemo(() => {
    const params: string[] = [];

    if (search) params.push(`keyword: ${search}`);

    return params.length > 0 ? params.join(", ") : "no search parameters found";
  }, [search]);

  const columnOptions = [
    { key: "invoiceNumber", label: "Invoice Number" },
    { key: "supplier", label: "Supplier" },
    { key: "purchaseDate", label: "Purchase Date" },
    { key: "totalAmount", label: "Total Amount" },
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
    router.push("/transactions/purchases/new");
  }

  function openDetailPage(purchase: Purchase) {
    router.push(`/transactions/purchases/${purchase.id}`);
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

  const allColumns: ColumnsType<Purchase> = [
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
      title: "Supplier",
      key: "supplier",
      render: (_, record) => record.supplier?.name || "-",
    },
    {
      title: "Purchase Date",
      dataIndex: "purchaseDate",
      key: "purchaseDate",
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
          <FilterField label="Invoice / Supplier" span="">
            <FilterInput
              value={searchInput}
              placeholder="Search invoice or supplier"
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
            onRefresh={() => purchasesQuery.refetch()}
            addText="Add New"
          />
        </div>

        <Table<Purchase>
          rowKey="id"
          size="large"
          columns={columns}
          dataSource={purchases}
          loading={purchasesQuery.isLoading}
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
