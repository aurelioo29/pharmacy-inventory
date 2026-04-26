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

import { useActivityLogs } from "../hooks/use-activity-logs";
import type { ActivityLog } from "../types/activity-log";

export default function ActivityLogsPageClient() {
  const router = useRouter();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>([
    "user",
    "action",
    "resourceType",
    "ipAddress",
    "createdAt",
  ]);

  const logsQuery = useActivityLogs({
    search,
    resourceType,
    action,
    page,
    limit,
  });

  const logs = logsQuery.data?.data.activityLogs || [];
  const pagination = logsQuery.data?.data.pagination;

  const parameterText = useMemo(() => {
    const params: string[] = [];

    if (search) params.push(`keyword: ${search}`);
    if (resourceType) params.push(`resource: ${resourceType}`);
    if (action) params.push(`action: ${action}`);

    return params.length > 0 ? params.join(", ") : "no search parameters found";
  }, [search, resourceType, action]);

  const resourceLabel = resourceType || "Pilih resource";
  const actionLabel = action || "Pilih action";

  const resourceItems: MenuProps["items"] = [
    {
      key: "all",
      label: "Semua Resource",
      onClick: () => {
        setResourceType("");
        setPage(1);
      },
    },
    {
      key: "users",
      label: "users",
      onClick: () => {
        setResourceType("users");
        setPage(1);
      },
    },
    {
      key: "roles",
      label: "roles",
      onClick: () => {
        setResourceType("roles");
        setPage(1);
      },
    },
  ];

  const actionItems: MenuProps["items"] = [
    {
      key: "all",
      label: "Semua Action",
      onClick: () => {
        setAction("");
        setPage(1);
      },
    },
    ...[
      "users.create",
      "users.update",
      "users.deactivate",
      "users.reset_password",
      "roles.create",
      "roles.update",
      "roles.deactivate",
    ].map((item) => ({
      key: item,
      label: item,
      onClick: () => {
        setAction(item);
        setPage(1);
      },
    })),
  ];

  const columnOptions = [
    { key: "user", label: "User" },
    { key: "action", label: "Action" },
    { key: "resourceType", label: "Resource" },
    { key: "resourceId", label: "Resource ID" },
    { key: "ipAddress", label: "IP Address" },
    { key: "createdAt", label: "Created at" },
  ];

  function handleSearch() {
    setSearch(searchInput);
    setPage(1);
  }

  function resetFilter() {
    setSearchInput("");
    setSearch("");
    setResourceType("");
    setAction("");
    setPage(1);
  }

  function openDetailPage(log: ActivityLog) {
    router.push(`/settings/callback_logs/${log.id}`);
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

  const allColumns: ColumnsType<ActivityLog> = [
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <div>
          <button
            type="button"
            onClick={() => openDetailPage(record)}
            className="block text-left text-md font-bold text-blue-600 hover:cursor-pointer hover:text-blue-700"
          >
            {record.user?.username || "system"}
          </button>
          <div className="text-[12px] text-slate-500">
            {record.user?.name || "-"}
          </div>
        </div>
      ),
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (value: string) => <Tag color="blue">{value}</Tag>,
    },
    {
      title: "Resource",
      dataIndex: "resourceType",
      key: "resourceType",
      render: (value: string) => <Tag>{value}</Tag>,
    },
    {
      title: "Resource ID",
      dataIndex: "resourceId",
      key: "resourceId",
      render: (value?: string | null) => (
        <span className="text-xs text-slate-500">{value || "-"}</span>
      ),
    },
    {
      title: "IP Address",
      dataIndex: "ipAddress",
      key: "ipAddress",
      render: (value?: string | null) => value || "-",
    },
    {
      title: "Created at",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
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
          <FilterField label="Keyword" span="">
            <FilterInput
              value={searchInput}
              placeholder="Search user, action, resource, IP"
              onChange={setSearchInput}
              onEnter={handleSearch}
            />
          </FilterField>

          <FilterField label="Resource" span="">
            <FilterDropdown
              label={resourceLabel}
              muted={!resourceType}
              items={resourceItems}
            />
          </FilterField>

          <FilterField label="Action" span="">
            <FilterDropdown
              label={actionLabel}
              muted={!action}
              items={actionItems}
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
            onRefresh={() => logsQuery.refetch()}
            addText="Add New"
          />
        </div>

        <Table<ActivityLog>
          rowKey="id"
          size="large"
          columns={columns}
          dataSource={logs}
          loading={logsQuery.isLoading}
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
