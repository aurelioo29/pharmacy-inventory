"use client";

import { Form, Input, Tree } from "antd";
import type { TreeDataNode, TreeProps } from "antd";
import type { Key } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import FormActions from "@/components/ui/form/form-actions";
import FormCard from "@/components/ui/form/form-card";
import FormPageShell from "@/components/ui/form/form-page-shell";
import RequiredLabel from "@/components/ui/required-label";

import {
  useCreateRole,
  usePermissions,
  useRole,
  useUpdateRole,
} from "../hooks/use-roles";
import type {
  CreateRolePayload,
  Permission,
  UpdateRolePayload,
} from "../types/role";

type RoleFormPageProps = {
  mode: "create" | "edit";
  roleId?: string;
};

type RoleFormValues = {
  name: string;
  slug: string;
  description?: string | null;
  permissionIds: string[];
  isActive?: boolean;
};

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
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

function getModuleKeys(permissions: Permission[]) {
  return Array.from(
    new Set(permissions.map((permission) => `module:${permission.module}`)),
  );
}

function splitTreeIntoColumns(treeData: TreeDataNode[]) {
  const middle = Math.ceil(treeData.length / 2);

  return [treeData.slice(0, middle), treeData.slice(middle)];
}

export default function RoleFormPage({ mode, roleId }: RoleFormPageProps) {
  const router = useRouter();
  const [form] = Form.useForm<RoleFormValues>();

  const [expandedKeys, setExpandedKeys] = useState<Key[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<Key[]>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const permissionsQuery = usePermissions();
  const roleQuery = useRole(roleId || "");

  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  const role = roleQuery.data?.data;
  const permissions = useMemo(
    () => permissionsQuery.data?.data ?? [],
    [permissionsQuery.data?.data],
  );

  const permissionTree = useMemo(
    () => buildPermissionTree(permissions),
    [permissions],
  );

  const permissionTreeColumns = useMemo(
    () => splitTreeIntoColumns(permissionTree),
    [permissionTree],
  );

  const moduleKeys = useMemo(() => getModuleKeys(permissions), [permissions]);

  useEffect(() => {
    if (permissions.length === 0) return;

    setExpandedKeys(moduleKeys);
    setAutoExpandParent(true);
  }, [permissions.length, moduleKeys]);

  useEffect(() => {
    if (mode === "edit" && role) {
      const selectedPermissionIds = role.permissions.map(
        (item) => item.permission.id,
      );

      form.setFieldsValue({
        name: role.name,
        slug: role.slug,
        description: role.description || "",
        permissionIds: selectedPermissionIds,
        isActive: role.isActive,
      });

      setCheckedKeys(selectedPermissionIds);
    }

    if (mode === "create") {
      form.setFieldsValue({
        permissionIds: [],
        isActive: true,
      });

      setCheckedKeys([]);
    }
  }, [mode, role, form]);

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const name = event.target.value;

    if (mode === "create") {
      form.setFieldValue("slug", generateSlug(name));
    }
  }

  const handleExpand: TreeProps["onExpand"] = (nextExpandedKeys) => {
    setExpandedKeys(nextExpandedKeys);
    setAutoExpandParent(false);
  };

  const handleCheck: TreeProps["onCheck"] = (nextCheckedKeys) => {
    const keys = Array.isArray(nextCheckedKeys)
      ? nextCheckedKeys
      : nextCheckedKeys.checked;

    const permissionIds = keys
      .map(String)
      .filter((key) => !key.startsWith("module:"));

    setCheckedKeys(keys as Key[]);
    form.setFieldValue("permissionIds", permissionIds);
  };

  function handleFinish(values: RoleFormValues) {
    const permissionIds = checkedKeys
      .map(String)
      .filter((key) => !key.startsWith("module:"));

    const basePayload = {
      name: values.name,
      slug: values.slug,
      description: values.description || null,
      permissionIds,
    };

    if (mode === "create") {
      createRole.mutate(basePayload as CreateRolePayload, {
        onSuccess: () => router.push("/master_data/roles"),
      });

      return;
    }

    if (!roleId) return;

    updateRole.mutate(
      {
        id: roleId,
        payload: {
          ...basePayload,
          isActive: values.isActive,
        } as UpdateRolePayload,
      },
      {
        onSuccess: () => router.push("/master_data/roles"),
      },
    );
  }

  const loading =
    createRole.isPending ||
    updateRole.isPending ||
    roleQuery.isLoading ||
    permissionsQuery.isLoading;

  return (
    <FormPageShell
      backText="Back to Roles"
      onBack={() => router.push("/master_data/roles")}
    >
      <FormCard>
        <Form<RoleFormValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleFinish}
        >
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <Form.Item
              label={<RequiredLabel required>Name</RequiredLabel>}
              name="name"
              rules={[{ required: true, message: "Name wajib diisi" }]}
            >
              <Input
                className="his-form-input"
                placeholder="Contoh: Apoteker"
                onChange={handleNameChange}
              />
            </Form.Item>

            <Form.Item
              label={<RequiredLabel required>Slug</RequiredLabel>}
              name="slug"
              rules={[{ required: true, message: "Slug wajib diisi" }]}
            >
              <Input
                className="his-form-input"
                placeholder="Contoh: apoteker"
              />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              className="md:col-span-2"
            >
              <Input.TextArea
                rows={3}
                className="!rounded-none"
                placeholder="Deskripsi role"
              />
            </Form.Item>

            <Form.Item
              label={<RequiredLabel required>Permissions</RequiredLabel>}
              name="permissionIds"
              rules={[
                {
                  validator: () => {
                    const permissionIds = checkedKeys
                      .map(String)
                      .filter((key) => !key.startsWith("module:"));

                    if (permissionIds.length === 0) {
                      return Promise.reject(
                        new Error("Permission wajib dipilih"),
                      );
                    }

                    return Promise.resolve();
                  },
                },
              ]}
              className="md:col-span-2"
            >
              <div className="border border-slate-200 bg-white p-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {permissionTreeColumns.map((treeColumn, index) => (
                    <Tree
                      key={index}
                      checkable
                      selectable={false}
                      treeData={treeColumn}
                      expandedKeys={expandedKeys}
                      checkedKeys={checkedKeys}
                      autoExpandParent={autoExpandParent}
                      onExpand={handleExpand}
                      onCheck={handleCheck}
                    />
                  ))}
                </div>
              </div>
            </Form.Item>
          </div>

          <FormActions loading={loading} onSave={() => form.submit()} />
        </Form>
      </FormCard>
    </FormPageShell>
  );
}
