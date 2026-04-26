"use client";

import { useMemo, useState } from "react";
import { Card, Table, Tag, message } from "antd";
import type { MenuProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Key } from "react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { Search } from "lucide-react";

import FilterActions from "@/components/ui/filters/filter-actions";
import FilterDropdown from "@/components/ui/filters/filter-dropdown";
import FilterField from "@/components/ui/filters/filter-field";
import FilterInput from "@/components/ui/filters/filter-input";
import TableToolbar from "@/components/ui/table/table-toolbar";

import { useDeleteSupplier, useSuppliers } from "../hooks/use-suppliers";
import type { Supplier } from "../types/supplier";

export default function SuppliersPageClient() {
  const router = useRouter();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>([
    "name",
    "phone",
    "email",
    "address",
    "createdAt",
    "updatedAt",
    "isActive",
  ]);

  const suppliersQuery = useSuppliers({ search, page, limit, isActive });
  const deleteSupplier = useDeleteSupplier();

  const suppliers = suppliersQuery.data?.data.suppliers || [];
  const pagination = suppliersQuery.data?.data.pagination;

  const selectedSuppliers = suppliers.filter((supplier) =>
    selectedRowKeys.includes(supplier.id),
  );

  const parameterText = useMemo(() => {
    const params: string[] = [];

    if (search) params.push(`keyword: ${search}`);
    if (isActive !== null) {
      params.push(`status: ${isActive ? "Aktif" : "Nonaktif"}`);
    }

    return params.length > 0 ? params.join(", ") : "no search parameters found";
  }, [search, isActive]);

  const statusLabel =
    isActive === null ? "Pilih status" : isActive ? "Aktif" : "Nonaktif";

  const statusItems: MenuProps["items"] = [
    {
      key: "all",
      label: "Semua Status",
      onClick: () => {
        setIsActive(null);
        setPage(1);
      },
    },
    {
      key: "active",
      label: "Aktif",
      onClick: () => {
        setIsActive(true);
        setPage(1);
      },
    },
    {
      key: "inactive",
      label: "Nonaktif",
      onClick: () => {
        setIsActive(false);
        setPage(1);
      },
    },
  ];

  const columnOptions = [
    { key: "name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "address", label: "Address" },
    { key: "createdAt", label: "Created at" },
    { key: "updatedAt", label: "Last updated at" },
    { key: "isActive", label: "Status" },
  ];

  function handleSearch() {
    setSearch(searchInput);
    setPage(1);
  }

  function resetFilter() {
    setSearchInput("");
    setSearch("");
    setIsActive(null);
    setPage(1);
  }

  function openCreatePage() {
    router.push("/master_data/suppliers/new");
  }

  function openDetailPage(supplier: Supplier) {
    router.push(`/master_data/suppliers/${supplier.id}`);
  }

  function openEditPage(supplier: Supplier) {
    router.push(`/master_data/suppliers/${supplier.id}/edit`);
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

  const bulkItems: MenuProps["items"] = [
    {
      key: "edit",
      label: "Edit selected",
      disabled: selectedSuppliers.length !== 1,
      onClick: () => {
        if (selectedSuppliers.length !== 1) {
          message.warning("Pilih 1 supplier saja untuk edit.");
          return;
        }

        openEditPage(selectedSuppliers[0]);
      },
    },
    {
      key: "delete",
      label: "Deactivate selected",
      danger: true,
      onClick: () => {
        selectedRowKeys.forEach((id) => deleteSupplier.mutate(String(id)));
        setSelectedRowKeys([]);
      },
    },
  ];

  const allColumns: ColumnsType<Supplier> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (_, record) => (
        <button
          type="button"
          onClick={() => openDetailPage(record)}
          className="block text-left text-md font-bold text-blue-600 hover:cursor-pointer hover:text-blue-700"
        >
          {record.name}
        </button>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (value?: string | null) => value || "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (value?: string | null) => value || "-",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      render: (value?: string | null) => value || "-",
    },
    {
      title: "Created at",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      render: (value: string) => dayjs(value).format("DD-MM-YYYY HH:mm:ss"),
    },
    {
      title: "Last updated at",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (value?: string) =>
        value ? dayjs(value).format("DD-MM-YYYY HH:mm:ss") : "-",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      align: "center",
      render: (value: boolean) =>
        value ? (
          <Tag color="green" className="!m-0">
            Aktif
          </Tag>
        ) : (
          <Tag color="red" className="!m-0">
            Nonaktif
          </Tag>
        ),
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
              placeholder="Search supplier, phone, email, address"
              onChange={setSearchInput}
              onEnter={handleSearch}
            />
          </FilterField>

          <FilterField label="Status" span="">
            <FilterDropdown
              label={statusLabel}
              muted={isActive === null}
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
            selectedCount={selectedRowKeys.length}
            bulkItems={bulkItems}
            columnItems={columnOptions}
            visibleColumnKeys={visibleColumnKeys}
            onToggleColumn={toggleColumn}
            onAdd={openCreatePage}
            onRefresh={() => suppliersQuery.refetch()}
            addText="Add New"
          />
        </div>

        <Table<Supplier>
          rowKey="id"
          size="large"
          columns={columns}
          dataSource={suppliers}
          loading={suppliersQuery.isLoading}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
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
