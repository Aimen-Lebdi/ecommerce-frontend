import axiosInstance from "../../utils/axiosInstance";

// Interface for a saved phone number
export interface Phone {
  _id: string;
  label: string;
  phone: string;
  isDefault: boolean;
}

// Interface for the phones API response
export interface PhoneResponse {
  status: string;
  results?: number;
  data: Phone[];
  message?: string;
}

// Get logged user phones
export const fetchPhonesAPI = async (): Promise<PhoneResponse> => {
  const response = await axiosInstance.get("/api/phones");
  return response.data;
};

// Add a new phone number to the user's phone list
export const addPhoneAPI = async (phoneData: {
  phone: string;
  label: string;
}): Promise<PhoneResponse> => {
  const response = await axiosInstance.post("/api/phones", phoneData);
  return response.data;
};

// Update an existing phone number
export const updatePhoneAPI = async (
  phoneId: string,
  phoneData: { phone?: string; label?: string; isDefault?: boolean }
): Promise<PhoneResponse> => {
  const response = await axiosInstance.put(`/api/phones/${phoneId}`, phoneData);
  return response.data;
};

// Set a phone number as the user's default
export const setDefaultPhoneAPI = async (
  phoneId: string
): Promise<PhoneResponse> => {
  const response = await axiosInstance.patch(`/api/phones/${phoneId}/default`);
  return response.data;
};

// Remove a phone number from the user's phone list
export const removePhoneAPI = async (
  phoneId: string
): Promise<PhoneResponse> => {
  const response = await axiosInstance.delete(`/api/phones/${phoneId}`);
  return response.data;
};
