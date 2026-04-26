import { apiFetch } from "@/lib/api-fetch";
import type {
  CreateUserPayload,
  GetUsersParams,
  Role,
  UpdateUserPayload,
  User,
  UsersResponse,
} from "../types/user";

type RolesDropdownResponse = {
  roles: Role[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export const userService = {
  getUsers(params: GetUsersParams) {
    return apiFetch<UsersResponse>("/api/users", {
      params,
    });
  },

  getUser(id: string) {
    return apiFetch<User>(`/api/users/${id}`);
  },

  createUser(payload: CreateUserPayload) {
    return apiFetch<User>("/api/users", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateUser(id: string, payload: UpdateUserPayload) {
    return apiFetch<User>(`/api/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteUser(id: string) {
    return apiFetch<null>(`/api/users/${id}`, {
      method: "DELETE",
    });
  },

  getRoles() {
    return apiFetch<RolesDropdownResponse>("/api/roles", {
      params: {
        page: 1,
        limit: 100,
        isActive: true,
      },
    });
  },

  resetPassword(id: string, pin: string) {
    return apiFetch<{ defaultPassword: string }>(
      `/api/users/${id}/reset-password`,
      {
        method: "PATCH",
        body: JSON.stringify({ pin }),
      },
    );
  },
};
