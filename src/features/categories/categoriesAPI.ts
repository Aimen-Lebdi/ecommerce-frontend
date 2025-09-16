/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "../../utils/axiosInstance";

// Interface for API query parameters
export interface CategoriesQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  keyword?: string;
  fields?: string;
  [key: string]: any;
}

// Interface for API response structure
export interface CategoriesResponse {
  result: number;
  pagination: {
    currentPage: number;
    limit: number;
    numberOfPages: number;
    nextPage?: number;
    previousPage?: number;
  };
  documents: any[];
}

// Updated fetch categories function with query parameters support
export const fetchCategoriesAPI = async (
  queryParams: CategoriesQueryParams = {}
): Promise<CategoriesResponse> => {
  // Build query string from parameters
  const params = new URLSearchParams();

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value.toString());
    }
  });

  const queryString = params.toString();
  const url = queryString
    ? `/api/categories?${queryString}`
    : "/api/categories";

  const response = await axiosInstance.get(url);
  return response.data;
};

// Add new category
export const createCategoryAPI = async (categoryData: FormData) => {
  const response = await axiosInstance.post("/api/categories", categoryData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Update existing category
export const updateCategoryAPI = async (id: string, categoryData: FormData) => {
  const response = await axiosInstance.put(
    `/api/categories/${id}`,
    categoryData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data.data;
};

export const deleteCategoryAPI = async (id: string) => {
  const response = await axiosInstance.delete(`/api/categories/${id}`);
  return response.data;
};

// Bulk delete API
export const deleteManyCategoriesAPI = async (ids: string[]) => {
  const response = await axiosInstance.post("/api/categories/bulk-delete", {
    ids,
  });
  return response.data;
};
