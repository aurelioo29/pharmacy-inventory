import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { roleService } from "../services/role-service";
import type {
  CreateRolePayload,
  GetRolesParams,
  UpdateRolePayload,
} from "../types/role";

export const ROLES_QUERY_KEY = "roles";
export const PERMISSIONS_QUERY_KEY = "permissions";

export function useRoles(params: GetRolesParams) {
  return useQuery({
    queryKey: [ROLES_QUERY_KEY, params],
    queryFn: () => roleService.getRoles(params),
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: [ROLES_QUERY_KEY, id],
    queryFn: () => roleService.getRole(id),
    enabled: Boolean(id),
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: [PERMISSIONS_QUERY_KEY],
    queryFn: () => roleService.getPermissions(),
    select: (response) => ({
      ...response,
      data: response.data.permissions,
    }),
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRolePayload) => roleService.createRole(payload),
    onSuccess: () => {
      message.success("Role berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Gagal membuat role");
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) =>
      roleService.updateRole(id, payload),
    onSuccess: () => {
      message.success("Role berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Gagal memperbarui role");
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => roleService.deleteRole(id),
    onSuccess: () => {
      message.success("Role berhasil dinonaktifkan");
      queryClient.invalidateQueries({ queryKey: [ROLES_QUERY_KEY] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Gagal menonaktifkan role");
    },
  });
}
