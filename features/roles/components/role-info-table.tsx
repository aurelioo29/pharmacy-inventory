import dayjs from "dayjs";
import type { ReactNode } from "react";
import { Tree } from "antd";
import type { TreeDataNode } from "antd";

import type { Permission, Role } from "../types/role";

type RoleInfoTableProps = {
  role: Role;
};

function formatDate(value?: string | null) {
  return value ? dayjs(value).format("DD-MM-YYYY HH:mm:ss") : "-";
}

function Value({ children }: { children: ReactNode }) {
  return <div className="text-sm text-slate-800">{children || "-"}</div>;
}

function formatModuleName(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function groupPermissions(permissions: Permission[]) {
  return permissions.reduce<Record<string, Permission[]>>(
    (result, permission) => {
      if (!result[permission.module]) {
        result[permission.module] = [];
      }

      result[permission.module].push(permission);
      return result;
    },
    {},
  );
}

function buildPermissionTree(permissions: Permission[]): TreeDataNode[] {
  const groupedPermissions = groupPermissions(permissions);

  return Object.entries(groupedPermissions).map(
    ([module, modulePermissions]) => ({
      title: (
        <span className="text-sm font-bold text-slate-800">
          {formatModuleName(module)}
        </span>
      ),
      key: `module:${module}`,
      selectable: false,
      children: modulePermissions.map((permission) => ({
        title: (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-700">{permission.name}</span>
            <span className="text-xs text-slate-400">{permission.slug}</span>
          </div>
        ),
        key: permission.id,
      })),
    }),
  );
}

function getExpandedKeys(permissions: Permission[]) {
  return Array.from(
    new Set(permissions.map((permission) => `module:${permission.module}`)),
  );
}

function splitTreeIntoColumns(treeData: TreeDataNode[]) {
  const middle = Math.ceil(treeData.length / 2);
  return [treeData.slice(0, middle), treeData.slice(middle)];
}

export default function RoleInfoTable({ role }: RoleInfoTableProps) {
  const permissions = role.permissions.map((item) => item.permission);
  const permissionTree = buildPermissionTree(permissions);
  const permissionTreeColumns = splitTreeIntoColumns(permissionTree);
  const expandedKeys = getExpandedKeys(permissions);
  const checkedKeys = permissions.map((permission) => permission.id);

  const rows: [string, ReactNode][] = [
    ["Name", role.name],
    ["Slug", role.slug],
    ["Description", role.description || "-"],
    [
      "Status",
      <span
        key="status"
        className={
          role.isActive
            ? "font-semibold text-green-600"
            : "font-semibold text-red-600"
        }
      >
        {role.isActive ? "Aktif" : "Nonaktif"}
      </span>,
    ],
    ["Created at", formatDate(role.createdAt)],
    ["Last updated at", formatDate(role.updatedAt)],
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="border border-slate-200">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-1 border-b border-slate-100 last:border-b-0 md:grid-cols-[200px_1fr]"
          >
            <div className="bg-slate-50 px-4 py-3 text-md text-slate-600">
              {label}
            </div>

            <div className="px-4 py-3">
              <Value>{value}</Value>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-slate-200 bg-white">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
          Permissions
        </div>

        <div className="p-4">
          {permissions.length === 0 ? (
            <div className="text-sm text-slate-500">No permissions</div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {permissionTreeColumns.map((treeColumn, index) => (
                <Tree
                  key={index}
                  checkable
                  selectable={false}
                  disabled
                  treeData={treeColumn}
                  expandedKeys={expandedKeys}
                  checkedKeys={checkedKeys}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
