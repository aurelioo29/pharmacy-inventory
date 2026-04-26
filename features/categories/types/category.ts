export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CategoriesPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CategoriesResponse = {
  categories: Category[];
  pagination: CategoriesPagination;
};

export type GetCategoriesParams = {
  search?: string;
  page?: number;
  limit?: number;
  isActive?: boolean | null;
};

export type CreateCategoryPayload = {
  name: string;
  slug: string;
  description?: string | null;
};

export type UpdateCategoryPayload = {
  name?: string;
  slug?: string;
  description?: string | null;
  isActive?: boolean;
};
