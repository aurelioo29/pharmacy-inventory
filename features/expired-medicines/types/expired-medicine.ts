export type ExpiredMedicineStatus = "EXPIRED" | "EXPIRING_SOON";

export type ExpiredMedicine = {
  id: string;
  medicineId: string;
  batchNumber: string;
  expiredDate: string;
  currentQuantity: number;
  initialQuantity: number;
  purchasePrice: string;
  sellingPrice: string;
  daysLeft: number;
  status: ExpiredMedicineStatus;
  createdAt: string;
  updatedAt: string;

  medicine: {
    id: string;
    code: string;
    name: string;
    minimumStock: number;
    category?: {
      id: string;
      name: string;
    } | null;
    unit?: {
      id: string;
      name: string;
      symbol?: string | null;
    } | null;
  };
};

export type ExpiredMedicinesPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ExpiredMedicinesResponse = {
  expiredMedicines: ExpiredMedicine[];
  pagination: ExpiredMedicinesPagination;
};

export type GetExpiredMedicinesParams = {
  search?: string;
  page?: number;
  limit?: number;
  status?: ExpiredMedicineStatus | "";
  thresholdDays?: number;
};