export type Role = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export type UserRole = {
  role: Role;
};

export type User = {
  id: string;
  name: string;
  username: string;
  email?: string | null;
  birthPlace?: string | null;
  birthDate?: string | null;
  religion?: string | null;
  education?: string | null;
  bloodType?: string | null;
  maritalStatus?: string | null;
  gender?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  roles: UserRole[];
};

export type UsersPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type UsersResponse = {
  users: User[];
  pagination: UsersPagination;
};

export type GetUsersParams = {
  search?: string;
  page?: number;
  limit?: number;
  isActive?: boolean | null;
  gender?: string;
};

export type CreateUserPayload = {
  name: string;
  username: string;
  email?: string | null;
  password: string;
  roleIds: string[];
  birthPlace?: string | null;
  birthDate?: string | null;
  religion?: string | null;
  education?: string | null;
  bloodType?: string | null;
  maritalStatus?: string | null;
  gender?: string | null;
};

export type UpdateUserPayload = {
  name?: string;
  username?: string;
  email?: string | null;
  password?: string;
  isActive?: boolean;
  roleIds?: string[];
  birthPlace?: string | null;
  birthDate?: string | null;
  religion?: string | null;
  education?: string | null;
  bloodType?: string | null;
  maritalStatus?: string | null;
  gender?: string | null;
};
