// src/features/categories/categoriesAPI.ts
import axiosInstance from "../../utils/axiosInstance";

export const fetchCategoriesAPI = async () => {
  const response = await axiosInstance.get("/api/categories");
  return response.data.documents;
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
  return response.data.data; // Based on your backend response structure
};

export const deleteCategoryAPI = async (id: string) => {
  const response = await axiosInstance.delete(`/api/categories/${id}`);
  return response.data;
};

// ✅ ADD THIS: Bulk delete API
export const deleteManyCategoriesAPI = async (ids: string[]) => {
  const response = await axiosInstance.post('/api/categories/bulk-delete', { ids });
  return response.data;
};