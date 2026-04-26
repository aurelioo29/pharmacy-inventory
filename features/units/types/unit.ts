export type Unit = {
  id: string;
  name: string;
  symbol?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UnitsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type UnitsResponse = {
  units: Unit[];
  pagination: UnitsPagination;
};

export type GetUnitsParams = {
  search?: string;
  page?: number;
  limit?: number;
  isActive?: boolean | null;
};

export type CreateUnitPayload = {
  name: string;
  symbol?: string | null;
};

export type UpdateUnitPayload = {
  name?: string;
  symbol?: string | null;
  isActive?: boolean;
};
