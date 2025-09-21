/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "../../utils/axiosInstance";

// Interface for API query parameters
export interface BrandsQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  keyword?: string;
  fields?: string;
  [key: string]: any;
}

// Interface for API response structure
export interface BrandsResponse {
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

// Updated fetch brands function with query parameters support
export const fetchBrandsAPI = async (
  queryParams: BrandsQueryParams = {}
): Promise<BrandsResponse> => {
  // Build query string from parameters
  const params = new URLSearchParams();

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value.toString());
    }
  });

  const queryString = params.toString();
  const url = queryString
    ? `/api/brands?${queryString}`
    : "/api/brands";

  const response = await axiosInstance.get(url);
  return response.data;
};

// Add new brand
export const createBrandAPI = async (brandData: FormData) => {
  const response = await axiosInstance.post("/api/brands", brandData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Update existing brand
export const updateBrandAPI = async (id: string, brandData: FormData) => {
  const response = await axiosInstance.put(
    `/api/brands/${id}`,
    brandData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data.data;
};

export const deleteBrandAPI = async (id: string) => {
  const response = await axiosInstance.delete(`/api/brands/${id}`);
  return response.data;
};

// Bulk delete API
export const deleteManyBrandsAPI = async (ids: string[]) => {
  const response = await axiosInstance.post("/api/brands/bulk-delete", {
    ids,
  });
  return response.data;
};