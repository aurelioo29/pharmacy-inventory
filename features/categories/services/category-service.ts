import { apiFetch } from "@/lib/api-fetch";
import type {
  CategoriesResponse,
  Category,
  CreateCategoryPayload,
  GetCategoriesParams,
  UpdateCategoryPayload,
} from "../types/category";

export const categoryService = {
  getCategories(params: GetCategoriesParams) {
    return apiFetch<CategoriesResponse>("/api/categories", {
      params,
    });
  },

  getCategory(id: string) {
    return apiFetch<Category>(`/api/categories/${id}`);
  },

  createCategory(payload: CreateCategoryPayload) {
    return apiFetch<Category>("/api/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  updateCategory(id: string, payload: UpdateCategoryPayload) {
    return apiFetch<Category>(`/api/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  deleteCategory(id: string) {
    return apiFetch<null>(`/api/categories/${id}`, {
      method: "DELETE",
    });
  },
};
