/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "../../utils/axiosInstance";

// Interface for API query parameters
export interface UsersQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  keyword?: string;
  fields?: string;
  role?: string;
  status?: string;
  [key: string]: any;
}

// Interface for API response structure
export interface UsersResponse {
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

// Updated fetch users function with query parameters support
export const fetchUsersAPI = async (
  queryParams: UsersQueryParams = {}
): Promise<UsersResponse> => {
  // Build query string from parameters
  const params = new URLSearchParams();

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value.toString());
    }
  });

  const queryString = params.toString();
  const url = queryString ? `/api/users?${queryString}` : "/api/users";

  const response = await axiosInstance.get(url);
  return response.data;
};

// Add new user
export const createUserAPI = async (userData: FormData) => {
  const response = await axiosInstance.post("/api/users", userData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};

// Update existing user
export const updateUserAPI = async (id: string, userData: FormData) => {
  const processedData = new FormData();

  for (const [key, value] of userData.entries()) {
    console.log(
      `${key}:`,
      value instanceof File ? `File: ${value.name}` : value
    );

    // Handle empty string values by converting to 'null' string for image
    if (key === "image" && value === "") {
      processedData.append(key, "__NULL__"); // Use a special marker to indicate null
      console.log(`Converting empty ${key} to "__NULL__"`);
    } else {
      processedData.append(key, value);
    }
  }
  const response = await axiosInstance.put(`/api/users/${id}`, processedData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};

// Delete user
export const deleteUserAPI = async (id: string) => {
  const response = await axiosInstance.delete(`/api/users/${id}`);
  return response.data;
};

// Bulk delete API
export const deleteManyUsersAPI = async (ids: string[]) => {
  const response = await axiosInstance.post("/api/users/bulk-delete", {
    ids,
  });
  return response.data;
};

// Update user password
export const updateUserPasswordAPI = async (
  id: string,
  passwordData: {
    currentPassword: string;
    password: string;
    passwordConfirm: string;
  }
) => {
  const response = await axiosInstance.put(
    `/api/users/changePassword/${id}`,
    passwordData
  );
  return response.data.data;
};
