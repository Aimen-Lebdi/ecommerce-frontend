import axiosInstance from "../../utils/axiosInstance";

// Global date-range model (M1). Dates are "YYYY-MM-DD" strings (UTC).
export interface DateRange {
  startDate?: string;
  endDate?: string;
}

// Build a query string from a date range ("" when empty)
export const buildDateRangeParams = (range?: DateRange): string => {
  if (!range) return "";
  const params = new URLSearchParams();
  if (range.startDate) params.append("startDate", range.startDate);
  if (range.endDate) params.append("endDate", range.endDate);
  return params.toString();
};

// Format a Date as a UTC "YYYY-MM-DD" string (matches backend UTC semantics)
export const toDateString = (date: Date): string => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export type DateRangePreset = "today" | "7d" | "30d" | "90d" | "custom";

// Compute a date range for a preset (excluding "custom")
export const getPresetRange = (
  preset: Exclude<DateRangePreset, "custom">
): DateRange => {
  const end = new Date();
  const start = new Date();
  if (preset === "today") {
    const today = toDateString(end);
    return { startDate: today, endDate: today };
  }
  const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
  start.setUTCDate(start.getUTCDate() - (days - 1));
  return { startDate: toDateString(start), endDate: toDateString(end) };
};

// Interface for dashboard cards data
export interface DashboardCard {
  total: number;
  // null when the previous period had no data to compare against
  percentageChange: number | null;
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
    aov: DashboardCard;
    conversion: DashboardCard;
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

// M3: Order status breakdown (4 buckets)
export interface StatusBucket {
  key: "inProgress" | "completed" | "failedReturned" | "cancelled";
  count: number;
  revenue: number;
}

export interface OrderStatusBreakdown {
  totalOrders: number;
  buckets: StatusBucket[];
}

// M3: Payment method breakdown (card vs cash)
export interface PaymentMethodItem {
  key: "card" | "cash";
  count: number;
  revenue: number;
}

export interface PaymentMethodBreakdown {
  card: PaymentMethodItem;
  cash: PaymentMethodItem;
}

// M4: Low-stock products
export interface LowStockProduct {
  id: string;
  name: string;
  quantity: number;
  sold: number;
  price: number;
  category: string | null;
}

export interface LowStockResponse {
  status: string;
  data: {
    threshold: number;
    products: LowStockProduct[];
  };
}

// M5: Sales by category/brand
export interface SalesByItem {
  id: string | null;
  name: string;
  revenue: number;
  sold: number;
}

export interface SalesByResponse {
  status: string;
  data: {
    groupBy: "category" | "brand";
    items: SalesByItem[];
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
      aov: DashboardCard;
      conversion: DashboardCard;
    };
    tables: {
      bestOrders: BestOrder[];
      topCustomers: TopCustomer[];
      bestProducts: BestProduct[];
    };
  };
}

// Fetch dashboard cards (revenue, customers, orders, top product, aov, conversion)
export const fetchDashboardCardsAPI = async (
  range?: DateRange
): Promise<DashboardCardsResponse> => {
  const qs = buildDateRangeParams(range);
  const response = await axiosInstance.get(
    `/api/v1/analytics/dashboard/cards${qs ? `?${qs}` : ""}`
  );
  return response.data;
};

// Fetch dashboard tables (best orders, top customers, best products)
export const fetchDashboardTablesAPI = async (
  range?: DateRange
): Promise<DashboardTablesResponse> => {
  const qs = buildDateRangeParams(range);
  const response = await axiosInstance.get(
    `/api/v1/analytics/dashboard/tables${qs ? `?${qs}` : ""}`
  );
  return response.data;
};

// Fetch growth rate chart data. When a custom range is provided it takes
// precedence over the rolling `days` window.
export const fetchGrowthRateAPI = async (
  days: 7 | 30 | 90 = 90,
  range?: DateRange
): Promise<GrowthRateResponse> => {
  const params = new URLSearchParams();
  if (range?.startDate && range?.endDate) {
    params.append("startDate", range.startDate);
    params.append("endDate", range.endDate);
  } else {
    params.append("days", String(days));
  }
  const response = await axiosInstance.get(
    `/api/v1/analytics/growth-rate?${params.toString()}`
  );
  return response.data;
};

// Fetch complete dashboard data (cards + tables)
export const fetchCompleteDashboardAPI = async (
  range?: DateRange
): Promise<CompleteDashboardResponse> => {
  const qs = buildDateRangeParams(range);
  const response = await axiosInstance.get(
    `/api/v1/analytics/dashboard${qs ? `?${qs}` : ""}`
  );
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

// Fetch order status breakdown (M3)
export const fetchOrderStatusAPI = async (
  range?: DateRange
): Promise<{ status: string; data: OrderStatusBreakdown }> => {
  const qs = buildDateRangeParams(range);
  const response = await axiosInstance.get(
    `/api/v1/analytics/order-status${qs ? `?${qs}` : ""}`
  );
  return response.data;
};

// Fetch payment method breakdown (M3)
export const fetchPaymentMethodsAPI = async (
  range?: DateRange
): Promise<{ status: string; data: PaymentMethodBreakdown }> => {
  const qs = buildDateRangeParams(range);
  const response = await axiosInstance.get(
    `/api/v1/analytics/payment-methods${qs ? `?${qs}` : ""}`
  );
  return response.data;
};

// Fetch low-stock products + current threshold (M4)
export const fetchLowStockAPI = async (): Promise<LowStockResponse> => {
  const response = await axiosInstance.get("/api/v1/analytics/low-stock");
  return response.data;
};

// Update the low-stock threshold (M4)
export const updateLowStockThresholdAPI = async (
  threshold: number
): Promise<{ status: string; data: { threshold: number } }> => {
  const response = await axiosInstance.put(
    "/api/v1/analytics/settings/low-stock-threshold",
    { threshold }
  );
  return response.data;
};

// Fetch revenue grouped by category/brand (M5)
export const fetchSalesByAPI = async (
  groupBy: "category" | "brand",
  range?: DateRange
): Promise<SalesByResponse> => {
  const params = new URLSearchParams({ groupBy });
  if (range?.startDate) params.append("startDate", range.startDate);
  if (range?.endDate) params.append("endDate", range.endDate);
  const response = await axiosInstance.get(
    `/api/v1/analytics/sales-by?${params.toString()}`
  );
  return response.data;
};