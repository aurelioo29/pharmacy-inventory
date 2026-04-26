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

import { useDeleteMedicine, useMedicines } from "../hooks/use-medicines";
import type { Medicine } from "../types/medicine";

export default function MedicinesPageClient() {
  const router = useRouter();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>([
    "code",
    "name",
    "category",
    "unit",
    "minimumStock",
    "createdAt",
    "updatedAt",
    "isActive",
  ]);

  const medicinesQuery = useMedicines({ search, page, limit, isActive });
  const deleteMedicine = useDeleteMedicine();

  const medicines = medicinesQuery.data?.data.medicines || [];
  const pagination = medicinesQuery.data?.data.pagination;

  const selectedMedicines = medicines.filter((medicine) =>
    selectedRowKeys.includes(medicine.id),
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
    { key: "code", label: "Code" },
    { key: "name", label: "Name" },
    { key: "category", label: "Category" },
    { key: "unit", label: "Unit" },
    { key: "minimumStock", label: "Minimum Stock" },
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
    router.push("/master_data/medicines/new");
  }

  function openDetailPage(medicine: Medicine) {
    router.push(`/master_data/medicines/${medicine.id}`);
  }

  function openEditPage(medicine: Medicine) {
    router.push(`/master_data/medicines/${medicine.id}/edit`);
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
      disabled: selectedMedicines.length !== 1,
      onClick: () => {
        if (selectedMedicines.length !== 1) {
          message.warning("Pilih 1 obat saja untuk edit.");
          return;
        }

        openEditPage(selectedMedicines[0]);
      },
    },
    {
      key: "delete",
      label: "Deactivate selected",
      danger: true,
      onClick: () => {
        selectedRowKeys.forEach((id) => deleteMedicine.mutate(String(id)));
        setSelectedRowKeys([]);
      },
    },
  ];

  const allColumns: ColumnsType<Medicine> = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (_, record) => (
        <button
          type="button"
          onClick={() => openDetailPage(record)}
          className="block text-left text-md font-bold text-blue-600 hover:cursor-pointer hover:text-blue-700"
        >
          {record.code}
        </button>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
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
      title: "Minimum Stock",
      dataIndex: "minimumStock",
      key: "minimumStock",
      align: "right",
    },
    {
      title: "Created at",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => dayjs(value).format("DD-MM-YYYY HH:mm:ss"),
    },
    {
      title: "Last updated at",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (value: string) => dayjs(value).format("DD-MM-YYYY HH:mm:ss"),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
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
          <FilterField label="Code / Name" span="">
            <FilterInput
              value={searchInput}
              placeholder="Search code or medicine name"
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
            onRefresh={() => medicinesQuery.refetch()}
            addText="Add New"
          />
        </div>

        <Table<Medicine>
          rowKey="id"
          size="large"
          columns={columns}
          dataSource={medicines}
          loading={medicinesQuery.isLoading}
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
