import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { userService } from "../services/user-service";
import type {
  CreateUserPayload,
  GetUsersParams,
  UpdateUserPayload,
} from "../types/user";

export const USERS_QUERY_KEY = "users";
export const ROLES_QUERY_KEY = "roles";

export function useUser(id: string) {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, id],
    queryFn: () => userService.getUser(id),
    enabled: Boolean(id),
  });
}

export function useRoles() {
  return useQuery({
    queryKey: [ROLES_QUERY_KEY],
    queryFn: () => userService.getRoles(),
    select: (response) => ({
      ...response,
      data: response.data.roles,
    }),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserPayload) => userService.createUser(payload),
    onSuccess: () => {
      message.success("User berhasil dibuat");
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Gagal membuat user");
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      userService.updateUser(id, payload),
    onSuccess: () => {
      message.success("User berhasil diperbarui");
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Gagal memperbarui user");
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      message.success("User berhasil dinonaktifkan");
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Gagal menonaktifkan user");
    },
  });
}

export function useUsers(params: GetUsersParams) {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, params],
    queryFn: () => userService.getUsers(params),
  });
}

export function useResetUserPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, pin }: { id: string; pin: string }) =>
      userService.resetPassword(id, pin),
    onSuccess: () => {
      message.success("Password berhasil direset menjadi: password");
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      message.error(error.message || "Gagal reset password");
    },
  });
}
