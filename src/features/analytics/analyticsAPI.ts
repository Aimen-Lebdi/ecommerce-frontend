import axiosInstance from "../../utils/axiosInstance";

// Interface for dashboard cards data
export interface DashboardCard {
  total: number;
  percentageChange: number;
  trend: "up" | "down" | "neutral";
}

export interface TopProductCard extends DashboardCard {
  productId?: string;
  name: string;
  totalQuantity?: number;
  totalRevenue?: number;
}

export interface DashboardCardsResponse {
  status: string;
  data: {
    revenue: DashboardCard;
    customers: DashboardCard;
    orders: DashboardCard;
    topProduct: TopProductCard;
  };
}

// Interface for dashboard tables
export interface BestOrder {
  id: string;
  customer: string;
  total: string;
  date: string;
}

export interface TopCustomer {
  name: string;
  products: number;
  revenue: string;
}

export interface BestProduct {
  name: string;
  sold: number;
  revenue: string;
}

export interface DashboardTablesResponse {
  status: string;
  data: {
    bestOrders: BestOrder[];
    topCustomers: TopCustomer[];
    bestProducts: BestProduct[];
  };
}

// Interface for growth rate data
export interface GrowthRateData {
  date: string;
  desktop: number;
}

export interface GrowthRateResponse {
  status: string;
  data: {
    period: string;
    chartData: GrowthRateData[];
  };
}

// Interface for complete dashboard
export interface CompleteDashboardResponse {
  status: string;
  data: {
    cards: {
      revenue: DashboardCard;
      customers: DashboardCard;
      orders: DashboardCard;
      topProduct: TopProductCard;
    };
    tables: {
      bestOrders: BestOrder[];
      topCustomers: TopCustomer[];
      bestProducts: BestProduct[];
    };
  };
}

// Fetch dashboard cards (revenue, customers, orders, top product)
export const fetchDashboardCardsAPI = async (): Promise<DashboardCardsResponse> => {
  const response = await axiosInstance.get("/api/v1/analytics/dashboard/cards");
  return response.data;
};

// Fetch dashboard tables (best orders, top customers, best products)
export const fetchDashboardTablesAPI = async (): Promise<DashboardTablesResponse> => {
  const response = await axiosInstance.get("/api/v1/analytics/dashboard/tables");
  return response.data;
};

// Fetch growth rate chart data
export const fetchGrowthRateAPI = async (days: 7 | 30 | 90 = 90): Promise<GrowthRateResponse> => {
  const response = await axiosInstance.get(`/api/v1/analytics/growth-rate?days=${days}`);
  return response.data;
};

// Fetch complete dashboard data (cards + tables)
export const fetchCompleteDashboardAPI = async (): Promise<CompleteDashboardResponse> => {
  const response = await axiosInstance.get("/api/v1/analytics/dashboard");
  return response.data;
};

// Fetch revenue analytics for custom date range
export const fetchRevenueAnalyticsAPI = async (
  startDate?: string,
  endDate?: string
): Promise<{ status: string; data: DashboardCard }> => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  const queryString = params.toString();
  const url = queryString ? `/api/v1/analytics/revenue?${queryString}` : "/api/v1/analytics/revenue";
  
  const response = await axiosInstance.get(url);
  return response.data;
};

// Fetch customers analytics for custom date range
export const fetchCustomersAnalyticsAPI = async (
  startDate?: string,
  endDate?: string
): Promise<{ status: string; data: DashboardCard }> => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  const queryString = params.toString();
  const url = queryString ? `/api/v1/analytics/customers?${queryString}` : "/api/v1/analytics/customers";
  
  const response = await axiosInstance.get(url);
  return response.data;
};

// Fetch orders analytics for custom date range
export const fetchOrdersAnalyticsAPI = async (
  startDate?: string,
  endDate?: string
): Promise<{ status: string; data: DashboardCard }> => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  const queryString = params.toString();
  const url = queryString ? `/api/v1/analytics/orders?${queryString}` : "/api/v1/analytics/orders";
  
  const response = await axiosInstance.get(url);
  return response.data;
};

// Fetch top product analytics for custom date range
export const fetchTopProductAnalyticsAPI = async (
  startDate?: string,
  endDate?: string
): Promise<{ status: string; data: TopProductCard }> => {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  
  const queryString = params.toString();
  const url = queryString ? `/api/v1/analytics/top-product?${queryString}` : "/api/v1/analytics/top-product";
  
  const response = await axiosInstance.get(url);
  return response.data;
};