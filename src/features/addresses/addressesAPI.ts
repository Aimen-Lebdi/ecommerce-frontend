import axiosInstance from "../../utils/axiosInstance";

// Interface for a saved address
export interface Address {
  _id: string;
  label: string;
  wilaya: string;
  dayra: string;
  baladiya: string;
  isDefault: boolean;
}

// Interface for the addresses API response
export interface AddressResponse {
  status: string;
  results?: number;
  data: Address[];
  message?: string;
}

// Get logged user addresses
export const fetchAddressesAPI = async (): Promise<AddressResponse> => {
  const response = await axiosInstance.get("/api/addresses");
  return response.data;
};

// Add a new address to the user's address book
export const addAddressAPI = async (addressData: {
  label: string;
  wilaya: string;
  dayra: string;
  baladiya: string;
}): Promise<AddressResponse> => {
  const response = await axiosInstance.post("/api/addresses", addressData);
  return response.data;
};

// Update an existing address
export const updateAddressAPI = async (
  addressId: string,
  addressData: {
    label?: string;
    wilaya?: string;
    dayra?: string;
    baladiya?: string;
    isDefault?: boolean;
  }
): Promise<AddressResponse> => {
  const response = await axiosInstance.put(
    `/api/addresses/${addressId}`,
    addressData
  );
  return response.data;
};

// Set an address as the user's default
export const setDefaultAddressAPI = async (
  addressId: string
): Promise<AddressResponse> => {
  const response = await axiosInstance.patch(
    `/api/addresses/${addressId}/default`
  );
  return response.data;
};

// Remove an address from the user's address book
export const removeAddressAPI = async (
  addressId: string
): Promise<AddressResponse> => {
  const response = await axiosInstance.delete(`/api/addresses/${addressId}`);
  return response.data;
};
