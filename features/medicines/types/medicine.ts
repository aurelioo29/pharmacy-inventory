export type MedicineCategory = {
  id: string;
  name: string;
  slug: string;
};

export type MedicineUnit = {
  id: string;
  name: string;
  symbol?: string | null;
};

export type Medicine = {
  id: string;
  categoryId: string;
  unitId: string;
  code: string;
  name: string;
  description?: string | null;
  minimumStock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: MedicineCategory;
  unit: MedicineUnit;
};

export type MedicinesPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type MedicinesResponse = {
  medicines: Medicine[];
  pagination: MedicinesPagination;
};

export type GetMedicinesParams = {
  search?: string;
  page?: number;
  limit?: number;
  isActive?: boolean | null;
  categoryId?: string;
  unitId?: string;
};

export type CreateMedicinePayload = {
  categoryId: string;
  unitId: string;
  code: string;
  name: string;
  description?: string | null;
  minimumStock: number;
};

export type UpdateMedicinePayload = Partial<CreateMedicinePayload> & {
  isActive?: boolean;
};
