/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "../../utils/axiosInstance";

// Interface for API query parameters
export interface OrdersQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  keyword?: string;
  fields?: string;
  deliveryStatus?: string;
  paymentStatus?: string;
  paymentMethodType?: string;
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

// Interface for creating cash order
export interface CreateCashOrderData {
  shippingAddress: {
    details: string;
    phone: string;
    dayra: string;
    wilaya: string;
  };
}

// Interface for tracking info
export interface TrackingInfo {
  order: {
    _id: string;
    orderNumber: string;
    deliveryStatus: string;
    trackingNumber?: string;
    isPaid: boolean;
    isDelivered: boolean;
    totalOrderPrice: number;
    statusHistory: Array<{
      status: string;
      timestamp: Date;
      note: string;
      updatedBy: string;
    }>;
  };
  tracking?: any;
}

// Fetch orders function with query parameters support
export const fetchOrdersAPI = async (
  queryParams: OrdersQueryParams = {}
): Promise<OrdersResponse> => {
  const params = new URLSearchParams();

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value.toString());
    }
  });

  const queryString = params.toString();
  const url = queryString ? `/api/v1/orders?${queryString}` : "/api/v1/orders";

  const response = await axiosInstance.get(url);
  return response.data;
};

// Get specific order
export const getOrderAPI = async (id: string) => {
  const response = await axiosInstance.get(`/api/v1/orders/${id}`);
  return response.data;
};

// Create cash order
export const createCashOrderAPI = async (
  cartId: string,
  orderData: CreateCashOrderData
) => {
  const response = await axiosInstance.post(`/api/v1/orders/${cartId}`, orderData);
  return response.data;
};

// Create checkout session (Stripe)
export const createCheckoutSessionAPI = async (
  cartId: string,
  shippingAddress: CreateCashOrderData["shippingAddress"]
) => {
  const response = await axiosInstance.post(
    `/api/v1/orders/checkout-session/${cartId}`,
    { shippingAddress }
  );
  return response.data;
};

// Add this new function
export const getOrderBySessionAPI = async (sessionId: string) => {
  const response = await axiosInstance.get(`/api/v1/orders/session/${sessionId}`);
  return response.data;
};

// Confirm order (Admin/Seller)
export const confirmOrderAPI = async (id: string) => {
  const response = await axiosInstance.put(`/api/v1/orders/${id}/confirm`);
  return response.data;
};

// Confirm card payment order (Admin/Seller)
export const confirmCardOrderAPI = async (id: string) => {
  const response = await axiosInstance.put(`/api/v1/orders/${id}/confirm-card`);
  return response.data;
};

// Ship order (Admin/Seller)
export const shipOrderAPI = async (id: string) => {
  const response = await axiosInstance.post(`/api/v1/orders/${id}/ship`);
  return response.data;
};

// Cancel order
export const cancelOrderAPI = async (id: string, reason?: string) => {
  const response = await axiosInstance.put(`/api/v1/orders/${id}/cancel`, {
    reason,
  });
  return response.data;
};

// Get order tracking
export const getOrderTrackingAPI = async (
  id: string
): Promise<{ status: string; data: TrackingInfo }> => {
  const response = await axiosInstance.get(`/api/v1/orders/${id}/tracking`);
  return response.data;
};

// Simulate delivery (Testing only)
export const simulateDeliveryAPI = async (
  id: string,
  options: { speed?: string; scenario?: string } = {}
) => {
  const response = await axiosInstance.post(
    `/api/v1/orders/${id}/simulate-delivery`,
    options
  );
  return response.data;
};
