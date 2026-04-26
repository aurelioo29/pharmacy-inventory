"use client";

import { useMemo, useState } from "react";
import { Card, Space, Table, Tag, message } from "antd";
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

import { useDeleteRole, useRoles } from "../hooks/use-roles";
import type { Role } from "../types/role";

export default function RolesPageClient() {
  const router = useRouter();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>([
    "name",
    "slug",
    "permissions",
    "createdAt",
    "updatedAt",
    "isActive",
  ]);

  const rolesQuery = useRoles({ search, page, limit, isActive });
  const deleteRole = useDeleteRole();

  const roles = rolesQuery.data?.data.roles || [];
  const pagination = rolesQuery.data?.data.pagination;

  const selectedRoles = roles.filter((role) =>
    selectedRowKeys.includes(role.id),
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
    { key: "slug", label: "Slug" },
    { key: "description", label: "Description" },
    { key: "permissions", label: "Permissions" },
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
    router.push("/master_data/roles/new");
  }

  function openDetailPage(role: Role) {
    router.push(`/master_data/roles/${role.id}`);
  }

  function openEditPage(role: Role) {
    router.push(`/master_data/roles/${role.id}/edit`);
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
      disabled: selectedRoles.length !== 1,
      onClick: () => {
        if (selectedRoles.length !== 1) {
          message.warning("Pilih 1 role saja untuk edit.");
          return;
        }

        openEditPage(selectedRoles[0]);
      },
    },
    {
      key: "delete",
      label: "Deactivate selected",
      danger: true,
      onClick: () => {
        selectedRowKeys.forEach((id) => deleteRole.mutate(String(id)));
        setSelectedRowKeys([]);
      },
    },
  ];

  const allColumns: ColumnsType<Role> = [
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
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (value: string) => (
        <span className="text-sm text-slate-700">{value}</span>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (value?: string | null) => value || "-",
    },
    {
      title: "Permissions",
      key: "permissions",
      render: (_, record) => (
        <Space wrap size={[4, 4]}>
          {record.permissions.slice(0, 5).map((item) => (
            <Tag color="blue" key={item.permission.id} className="!m-0">
              {item.permission.slug}
            </Tag>
          ))}

          {record.permissions.length > 5 && (
            <Tag className="!m-0">+{record.permissions.length - 5}</Tag>
          )}
        </Space>
      ),
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
          <FilterField label="Name / Slug" span="">
            <FilterInput
              value={searchInput}
              placeholder="Search name or slug"
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
            onRefresh={() => rolesQuery.refetch()}
            addText="Add New"
          />
        </div>

        <Table<Role>
          rowKey="id"
          size="large"
          columns={columns}
          dataSource={roles}
          loading={rolesQuery.isLoading}
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
