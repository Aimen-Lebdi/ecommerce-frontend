/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "../../utils/axiosInstance";

// Interface for API query parameters
export interface SubCategoriesQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  keyword?: string;
  fields?: string;
  category?: string; // For filtering by category ID
  [key: string]: any;
}

// Interface for API response structure
export interface SubCategoriesResponse {
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

// Updated fetch subcategories function with query parameters support
export const fetchSubCategoriesAPI = async (
  queryParams: SubCategoriesQueryParams = {}
): Promise<SubCategoriesResponse> => {
  // Build query string from parameters
  const params = new URLSearchParams();

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value.toString());
    }
  });

  const queryString = params.toString();
  const url = queryString
    ? `/api/subcategories?${queryString}`
    : "/api/subcategories";

  const response = await axiosInstance.get(url);
  return response.data;
};

// Add new subcategory
export const createSubCategoryAPI = async (subCategoryData: FormData) => {
  const response = await axiosInstance.post("/api/subcategories", subCategoryData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Update existing subcategory
export const updateSubCategoryAPI = async (id: string, subCategoryData: FormData) => {
  const processedData = new FormData();

  for (const [key, value] of subCategoryData.entries()) {
    console.log(
      `${key}:`,
      value instanceof File ? `File: ${value.name}` : value
    );

    // Handle empty string values by converting to 'null' string for image
    if (key === "image" && value === "null") {
      processedData.append(key, "__NULL__"); // Use a special marker to indicate null
      console.log(`Converting empty ${key} to "__NULL__"`);
    } else {
      processedData.append(key, value);
    }
  }
  const response = await axiosInstance.put(
    `/api/subcategories/${id}`,
    processedData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data.data;
};

export const deleteSubCategoryAPI = async (id: string) => {
  const response = await axiosInstance.delete(`/api/subcategories/${id}`);
  return response.data;
};

// Bulk delete API
export const deleteManySubCategoriesAPI = async (ids: string[]) => {
  const response = await axiosInstance.post("/api/subcategories/bulk-delete", {
    ids,
  });
  return response.data;
};