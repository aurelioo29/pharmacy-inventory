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

import { useDeleteUser, useUsers } from "../hooks/use-users";
import type { User } from "../types/user";

export default function UsersPageClient() {
  const router = useRouter();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [gender, setGender] = useState<string>("");

  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>([
    "name",
    "roles",
    "gender",
    "createdAt",
    "updatedAt",
    "isActive",
  ]);

  const usersQuery = useUsers({ search, page, limit, isActive, gender });
  const deleteUser = useDeleteUser();

  const users = usersQuery.data?.data.users || [];
  const pagination = usersQuery.data?.data.pagination;

  const selectedUsers = users.filter((user) =>
    selectedRowKeys.includes(user.id),
  );

  const parameterText = useMemo(() => {
    const params: string[] = [];

    if (search) params.push(`keyword: ${search}`);
    if (isActive !== null) {
      params.push(`status: ${isActive ? "Aktif" : "Nonaktif"}`);
    }
    if (gender) params.push(`gender: ${gender}`);

    return params.length > 0 ? params.join(", ") : "no search parameters found";
  }, [search, isActive, gender]);

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

  const genderLabel = gender || "Pilih gender";

  const genderItems: MenuProps["items"] = [
    {
      key: "all",
      label: "Semua Gender",
      onClick: () => {
        setGender("");
        setPage(1);
      },
    },
    {
      key: "male",
      label: "Laki-laki",
      onClick: () => {
        setGender("Laki-laki");
        setPage(1);
      },
    },
    {
      key: "female",
      label: "Perempuan",
      onClick: () => {
        setGender("Perempuan");
        setPage(1);
      },
    },
  ];

  const columnOptions = [
    { key: "name", label: "Name / Username" },
    { key: "roles", label: "Role" },
    { key: "birthPlace", label: "Birth Place" },
    { key: "birthDate", label: "Birth Date" },
    { key: "religion", label: "Religion" },
    { key: "education", label: "Education" },
    { key: "bloodType", label: "Blood Type" },
    { key: "maritalStatus", label: "Marital Status" },
    { key: "gender", label: "Gender" },
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
    setGender("");
    setPage(1);
  }

  function openCreatePage() {
    router.push("/master_data/users/new");
  }

  function openDetailPage(user: User) {
    router.push(`/master_data/users/${user.id}`);
  }

  function openEditPage(user: User) {
    router.push(`/master_data/users/${user.id}/edit`);
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
      disabled: selectedUsers.length !== 1,
      onClick: () => {
        if (selectedUsers.length !== 1) {
          message.warning("Pilih 1 user saja untuk edit.");
          return;
        }

        openEditPage(selectedUsers[0]);
      },
    },
    {
      key: "delete",
      label: "Deactivate selected",
      danger: true,
      onClick: () => {
        selectedRowKeys.forEach((id) => deleteUser.mutate(String(id)));
        setSelectedRowKeys([]);
      },
    },
  ];

  const allColumns: ColumnsType<User> = [
    {
      title: "Username",
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (_, record) => (
        <div>
          <button
            type="button"
            onClick={() => openDetailPage(record)}
            className="block text-left text-md font-bold text-blue-600 hover:text-blue-700 hover:cursor-pointer"
          >
            {record.username}
          </button>
        </div>
      ),
    },
    {
      title: "Role",
      key: "roles",
      render: (_, record) => (
        <Space wrap size={[4, 4]}>
          {record.roles.map((item) => (
            <Tag color="blue" key={item.role.id} className="!m-0">
              {item.role.name}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: "Birth Place",
      dataIndex: "birthPlace",
      key: "birthPlace",
      render: (value?: string | null) => value || "-",
    },
    {
      title: "Birth Date",
      dataIndex: "birthDate",
      key: "birthDate",
      render: (value?: string | null) =>
        value ? dayjs(value).format("DD-MM-YYYY") : "-",
    },
    {
      title: "Religion",
      dataIndex: "religion",
      key: "religion",
      render: (value?: string | null) => value || "-",
    },
    {
      title: "Education",
      dataIndex: "education",
      key: "education",
      render: (value?: string | null) => value || "-",
    },
    {
      title: "Blood Type",
      dataIndex: "bloodType",
      key: "bloodType",
      render: (value?: string | null) => value || "-",
    },
    {
      title: "Marital Status",
      dataIndex: "maritalStatus",
      key: "maritalStatus",
      render: (value?: string | null) => value || "-",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
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
          <FilterField label="Name / Username" span="">
            <FilterInput
              value={searchInput}
              placeholder="Search name or username"
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

          <FilterField label="Gender" span="">
            <FilterDropdown
              label={genderLabel}
              muted={!gender}
              items={genderItems}
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
            onRefresh={() => usersQuery.refetch()}
            addText="Add New"
          />
        </div>

        <Table<User>
          rowKey="id"
          size="large"
          columns={columns}
          dataSource={users}
          loading={usersQuery.isLoading}
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
