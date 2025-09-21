/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "../../utils/axiosInstance";

// Interface for API query parameters
export interface OrdersQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  keyword?: string;
  fields?: string;
  [key: string]: any;
}

// Interface for API response structure
export interface OrdersResponse {
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

// Fetch orders function with query parameters support
export const fetchOrdersAPI = async (
  queryParams: OrdersQueryParams = {}
): Promise<OrdersResponse> => {
  // Build query string from parameters
  const params = new URLSearchParams();

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value.toString());
    }
  });

  const queryString = params.toString();
  const url = queryString
    ? `/api/orders?${queryString}`
    : "/api/orders";

  const response = await axiosInstance.get(url);
  return response.data;
};

// Update order payment status to paid
export const updateOrderToPaidAPI = async (id: string) => {
  const response = await axiosInstance.put(`/api/orders/${id}/pay`);
  return response.data;
};

// Update order delivery status
export const updateOrderToDeliveredAPI = async (id: string) => {
  const response = await axiosInstance.put(`/api/orders/${id}/deliver`);
  return response.data;
};

// Get specific order
export const getOrderAPI = async (id: string) => {
  const response = await axiosInstance.get(`/api/orders/${id}`);
  return response.data;
};