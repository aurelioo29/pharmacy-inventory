export type Permission = {
  id: string;
  name: string;
  slug: string;
  module: string;
  action: string;
};

export type RolePermission = {
  permission: Permission;
};

export type Role = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: RolePermission[];
};

export type RolesPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type RolesResponse = {
  roles: Role[];
  pagination: RolesPagination;
};

export type PermissionsResponse = {
  permissions: Permission[];
};

export type GetRolesParams = {
  search?: string;
  page?: number;
  limit?: number;
  isActive?: boolean | null;
};

export type CreateRolePayload = {
  name: string;
  slug: string;
  description?: string | null;
  permissionIds: string[];
};

export type UpdateRolePayload = {
  name?: string;
  slug?: string;
  description?: string | null;
  isActive?: boolean;
  permissionIds?: string[];
};
