import { apiFetch } from "@/lib/api-fetch";
import type {
  CreateRolePayload,
  GetRolesParams,
  PermissionsResponse,
  Role,
  RolesResponse,
  UpdateRolePayload,
} from "../types/role";

export const roleService = {
  getRoles(params: GetRolesParams) {
    return apiFetch<RolesResponse>("/api/roles", {
      params,
    });
  },

  getRole(id: string) {
    return apiFetch<Role>(`/api/roles/${id}`);
  },

  createRole(payload: CreateRolePayload) {
    return apiFetch<Role>("/api/roles", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateRole(id: string, payload: UpdateRolePayload) {
    return apiFetch<Role>(`/api/roles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteRole(id: string) {
    return apiFetch<null>(`/api/roles/${id}`, {
      method: "DELETE",
    });
  },

  getPermissions() {
    return apiFetch<PermissionsResponse>("/api/permissions");
  },
};
