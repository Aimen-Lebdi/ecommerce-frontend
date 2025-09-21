/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "../../utils/axiosInstance";

// Interface for API query parameters
export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  keyword?: string;
  fields?: string;
  [key: string]: any;
}

// Interface for API response structure
export interface ProductsResponse {
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

// Updated fetch products function with query parameters support
export const fetchProductsAPI = async (
  queryParams: ProductsQueryParams = {}
): Promise<ProductsResponse> => {
  // Build query string from parameters
  const params = new URLSearchParams();
  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value.toString());
    }
  });

  const queryString = params.toString();
  const url = queryString ? `/api/products?${queryString}` : "/api/products";

  const response = await axiosInstance.get(url);
  return response.data;
};

// Add new product
export const createProductAPI = async (productData: FormData) => {
  const response = await axiosInstance.post("/api/products", productData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// Update existing product
export const updateProductAPI = async (id: string, productData: FormData) => {
  // Log what we're sending for debugging
  console.log("Sending update data for product:", id);

  // Process FormData to handle empty values properly
  const processedData = new FormData();

  for (const [key, value] of productData.entries()) {
    console.log(
      `${key}:`,
      value instanceof File ? `File: ${value.name}` : value
    );

    // Handle empty string values by converting to 'null' string for subcategory and brand
    if ((key === "subCategory" || key === "brand") && value === "") {
      processedData.append(key, "__NULL__"); // Use a special marker to indicate null
      console.log(`Converting empty ${key} to "__NULL__"`);
    } else {
      processedData.append(key, value);
    }
  }

  const response = await axiosInstance.put(
    `/api/products/${id}`,
    processedData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data.data;
};

export const deleteProductAPI = async (id: string) => {
  const response = await axiosInstance.delete(`/api/products/${id}`);
  return response.data;
};

// Bulk delete API
export const deleteManyProductsAPI = async (ids: string[]) => {
  const response = await axiosInstance.post("/api/products/bulk-delete", {
    ids,
  });
  return response.data;
};
