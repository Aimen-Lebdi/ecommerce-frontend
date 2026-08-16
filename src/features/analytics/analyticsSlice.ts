/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  fetchDashboardCardsAPI,
  fetchDashboardTablesAPI,
  fetchGrowthRateAPI,
  fetchCompleteDashboardAPI,
  fetchOrderStatusAPI,
  fetchPaymentMethodsAPI,
  fetchLowStockAPI,
  updateLowStockThresholdAPI,
  fetchSalesByAPI,
  type DateRange,
  type DashboardCard,
  type TopProductCard,
  type BestOrder,
  type TopCustomer,
  type BestProduct,
  type GrowthRateData,
  type OrderStatusBreakdown,
  type PaymentMethodBreakdown,
  type LowStockProduct,
  type SalesByItem,
} from "./analyticsAPI";

// State interface for analytics slice
interface AnalyticsState {
  // Global date range (M1)
  dateRange: DateRange | null;

  // Cards data
  revenue: DashboardCard | null;
  customers: DashboardCard | null;
  orders: DashboardCard | null;
  topProduct: TopProductCard | null;
  aov: DashboardCard | null;
  conversion: DashboardCard | null;
  
  // Tables data
  bestOrders: BestOrder[];
  topCustomers: TopCustomer[];
  bestProducts: BestProduct[];
  
  // Growth rate data
  growthRateData: GrowthRateData[];
  growthRatePeriod: string;
  
  // Order status + payment methods donuts (M3)
  orderStatus: OrderStatusBreakdown | null;
  paymentMethods: PaymentMethodBreakdown | null;
  
  // Low stock (M4)
  lowStock: LowStockProduct[];
  lowStockThreshold: number;
  
  // Sales by category/brand (M5)
  salesBy: SalesByItem[];
  salesByGroupBy: "category" | "brand";
  
  // Loading states
  cardsLoading: boolean;
  tablesLoading: boolean;
  growthRateLoading: boolean;
  dashboardLoading: boolean;
  orderStatusLoading: boolean;
  paymentMethodsLoading: boolean;
  lowStockLoading: boolean;
  salesByLoading: boolean;
  
  // Error states
  cardsError: string | null;
  tablesError: string | null;
  growthRateError: string | null;
  dashboardError: string | null;
  orderStatusError: string | null;
  paymentMethodsError: string | null;
  lowStockError: string | null;
  salesByError: string | null;
}

// Initial state
const initialState: AnalyticsState = {
  dateRange: null,
  revenue: null,
  customers: null,
  orders: null,
  topProduct: null,
  aov: null,
  conversion: null,
  bestOrders: [],
  topCustomers: [],
  bestProducts: [],
  growthRateData: [],
  growthRatePeriod: "90d",
  orderStatus: null,
  paymentMethods: null,
  lowStock: [],
  lowStockThreshold: 10,
  salesBy: [],
  salesByGroupBy: "category",
  cardsLoading: false,
  tablesLoading: false,
  growthRateLoading: false,
  dashboardLoading: false,
  orderStatusLoading: false,
  paymentMethodsLoading: false,
  lowStockLoading: false,
  salesByLoading: false,
  cardsError: null,
  tablesError: null,
  growthRateError: null,
  dashboardError: null,
  orderStatusError: null,
  paymentMethodsError: null,
  lowStockError: null,
  salesByError: null,
};

// Async thunk to fetch dashboard cards
export const fetchDashboardCards = createAsyncThunk<
  {
    revenue: DashboardCard;
    customers: DashboardCard;
    orders: DashboardCard;
    topProduct: TopProductCard;
    aov: DashboardCard;
    conversion: DashboardCard;
  },
  DateRange | undefined,
  { rejectValue: string }
>("analytics/fetchDashboardCards", async (range, { rejectWithValue }) => {
  try {
    const response = await fetchDashboardCardsAPI(range);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to fetch dashboard cards"
    );
  }
});

// Async thunk to fetch dashboard tables
export const fetchDashboardTables = createAsyncThunk<
  {
    bestOrders: BestOrder[];
    topCustomers: TopCustomer[];
    bestProducts: BestProduct[];
  },
  DateRange | undefined,
  { rejectValue: string }
>("analytics/fetchDashboardTables", async (range, { rejectWithValue }) => {
  try {
    const response = await fetchDashboardTablesAPI(range);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to fetch dashboard tables"
    );
  }
});

// Async thunk to fetch growth rate data. A global date range (when set) takes
// precedence over the internal `days` window.
export const fetchGrowthRate = createAsyncThunk<
  {
    period: string;
    chartData: GrowthRateData[];
  },
  { days: 7 | 30 | 90; range?: DateRange },
  { rejectValue: string }
>("analytics/fetchGrowthRate", async ({ days, range }, { rejectWithValue }) => {
  try {
    const response = await fetchGrowthRateAPI(days, range);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to fetch growth rate data"
    );
  }
});

// Async thunk to fetch complete dashboard (cards + tables)
export const fetchCompleteDashboard = createAsyncThunk<
  {
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
  },
  DateRange | undefined,
  { rejectValue: string }
>("analytics/fetchCompleteDashboard", async (range, { rejectWithValue }) => {
  try {
    const response = await fetchCompleteDashboardAPI(range);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to fetch dashboard data"
    );
  }
});

// Async thunk to fetch order status breakdown (M3)
export const fetchOrderStatus = createAsyncThunk<
  OrderStatusBreakdown,
  DateRange | undefined,
  { rejectValue: string }
>("analytics/fetchOrderStatus", async (range, { rejectWithValue }) => {
  try {
    const response = await fetchOrderStatusAPI(range);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to fetch order status"
    );
  }
});

// Async thunk to fetch payment method breakdown (M3)
export const fetchPaymentMethods = createAsyncThunk<
  PaymentMethodBreakdown,
  DateRange | undefined,
  { rejectValue: string }
>("analytics/fetchPaymentMethods", async (range, { rejectWithValue }) => {
  try {
    const response = await fetchPaymentMethodsAPI(range);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to fetch payment methods"
    );
  }
});

// Async thunk to fetch low-stock products + threshold (M4)
export const fetchLowStock = createAsyncThunk<
  { threshold: number; products: LowStockProduct[] },
  void,
  { rejectValue: string }
>("analytics/fetchLowStock", async (_, { rejectWithValue }) => {
  try {
    const response = await fetchLowStockAPI();
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to fetch low stock"
    );
  }
});

// Async thunk to update the low-stock threshold then refetch (M4)
export const saveLowStockThreshold = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("analytics/saveLowStockThreshold", async (threshold, { rejectWithValue, dispatch }) => {
  try {
    const response = await updateLowStockThresholdAPI(threshold);
    dispatch(fetchLowStock());
    return response.data.threshold;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to update low stock threshold"
    );
  }
});

// Async thunk to fetch revenue grouped by category/brand (M5)
export const fetchSalesBy = createAsyncThunk<
  { groupBy: "category" | "brand"; items: SalesByItem[] },
  { groupBy: "category" | "brand"; range?: DateRange },
  { rejectValue: string }
>("analytics/fetchSalesBy", async ({ groupBy, range }, { rejectWithValue }) => {
  try {
    const response = await fetchSalesByAPI(groupBy, range);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to fetch sales by group"
    );
  }
});

// Slice with reducers and state management
const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    setDateRange: (state, action: PayloadAction<DateRange | null>) => {
      state.dateRange = action.payload;
    },
    clearAnalyticsError: (state) => {
      state.cardsError = null;
      state.tablesError = null;
      state.growthRateError = null;
      state.dashboardError = null;
      state.orderStatusError = null;
      state.paymentMethodsError = null;
      state.lowStockError = null;
      state.salesByError = null;
    },
    clearAnalyticsData: (state) => {
      state.revenue = null;
      state.customers = null;
      state.orders = null;
      state.topProduct = null;
      state.aov = null;
      state.conversion = null;
      state.bestOrders = [];
      state.topCustomers = [];
      state.bestProducts = [];
      state.growthRateData = [];
      state.orderStatus = null;
      state.paymentMethods = null;
      state.lowStock = [];
      state.salesBy = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard cards
      .addCase(fetchDashboardCards.pending, (state) => {
        state.cardsLoading = true;
        state.cardsError = null;
      })
      .addCase(
        fetchDashboardCards.fulfilled,
        (
          state,
          action: PayloadAction<{
            revenue: DashboardCard;
            customers: DashboardCard;
            orders: DashboardCard;
            topProduct: TopProductCard;
            aov: DashboardCard;
            conversion: DashboardCard;
          }>
        ) => {
          state.cardsLoading = false;
          state.revenue = action.payload.revenue;
          state.customers = action.payload.customers;
          state.orders = action.payload.orders;
          state.topProduct = action.payload.topProduct;
          state.aov = action.payload.aov;
          state.conversion = action.payload.conversion;
        }
      )
      .addCase(fetchDashboardCards.rejected, (state, action) => {
        state.cardsLoading = false;
        state.cardsError = action.payload || "Failed to fetch dashboard cards";
      })
      // Fetch dashboard tables
      .addCase(fetchDashboardTables.pending, (state) => {
        state.tablesLoading = true;
        state.tablesError = null;
      })
      .addCase(
        fetchDashboardTables.fulfilled,
        (
          state,
          action: PayloadAction<{
            bestOrders: BestOrder[];
            topCustomers: TopCustomer[];
            bestProducts: BestProduct[];
          }>
        ) => {
          state.tablesLoading = false;
          state.bestOrders = action.payload.bestOrders;
          state.topCustomers = action.payload.topCustomers;
          state.bestProducts = action.payload.bestProducts;
        }
      )
      .addCase(fetchDashboardTables.rejected, (state, action) => {
        state.tablesLoading = false;
        state.tablesError = action.payload || "Failed to fetch dashboard tables";
      })
      // Fetch growth rate
      .addCase(fetchGrowthRate.pending, (state) => {
        state.growthRateLoading = true;
        state.growthRateError = null;
      })
      .addCase(
        fetchGrowthRate.fulfilled,
        (
          state,
          action: PayloadAction<{
            period: string;
            chartData: GrowthRateData[];
          }>
        ) => {
          state.growthRateLoading = false;
          state.growthRateData = action.payload.chartData;
          state.growthRatePeriod = action.payload.period;
        }
      )
      .addCase(fetchGrowthRate.rejected, (state, action) => {
        state.growthRateLoading = false;
        state.growthRateError = action.payload || "Failed to fetch growth rate data";
      })
      // Fetch complete dashboard
      .addCase(fetchCompleteDashboard.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(
        fetchCompleteDashboard.fulfilled,
        (
          state,
          action: PayloadAction<{
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
          }>
        ) => {
          state.dashboardLoading = false;
          // Update cards
          state.revenue = action.payload.cards.revenue;
          state.customers = action.payload.cards.customers;
          state.orders = action.payload.cards.orders;
          state.topProduct = action.payload.cards.topProduct;
          state.aov = action.payload.cards.aov;
          state.conversion = action.payload.cards.conversion;
          // Update tables
          state.bestOrders = action.payload.tables.bestOrders;
          state.topCustomers = action.payload.tables.topCustomers;
          state.bestProducts = action.payload.tables.bestProducts;
        }
      )
      .addCase(fetchCompleteDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError = action.payload || "Failed to fetch dashboard data";
      })
      // Fetch order status (M3)
      .addCase(fetchOrderStatus.pending, (state) => {
        state.orderStatusLoading = true;
        state.orderStatusError = null;
      })
      .addCase(fetchOrderStatus.fulfilled, (state, action) => {
        state.orderStatusLoading = false;
        state.orderStatus = action.payload;
      })
      .addCase(fetchOrderStatus.rejected, (state, action) => {
        state.orderStatusLoading = false;
        state.orderStatusError = action.payload || "Failed to fetch order status";
      })
      // Fetch payment methods (M3)
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.paymentMethodsLoading = true;
        state.paymentMethodsError = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.paymentMethodsLoading = false;
        state.paymentMethods = action.payload;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.paymentMethodsLoading = false;
        state.paymentMethodsError = action.payload || "Failed to fetch payment methods";
      })
      // Fetch low stock (M4)
      .addCase(fetchLowStock.pending, (state) => {
        state.lowStockLoading = true;
        state.lowStockError = null;
      })
      .addCase(fetchLowStock.fulfilled, (state, action) => {
        state.lowStockLoading = false;
        state.lowStock = action.payload.products;
        state.lowStockThreshold = action.payload.threshold;
      })
      .addCase(fetchLowStock.rejected, (state, action) => {
        state.lowStockLoading = false;
        state.lowStockError = action.payload || "Failed to fetch low stock";
      })
      // Save low stock threshold (M4)
      .addCase(saveLowStockThreshold.rejected, (state, action) => {
        state.lowStockError = action.payload || "Failed to update low stock threshold";
      })
      // Fetch sales by group (M5)
      .addCase(fetchSalesBy.pending, (state) => {
        state.salesByLoading = true;
        state.salesByError = null;
      })
      .addCase(fetchSalesBy.fulfilled, (state, action) => {
        state.salesByLoading = false;
        state.salesBy = action.payload.items;
        state.salesByGroupBy = action.payload.groupBy;
      })
      .addCase(fetchSalesBy.rejected, (state, action) => {
        state.salesByLoading = false;
        state.salesByError = action.payload || "Failed to fetch sales by group";
      });
  },
});

export const {
  setDateRange,
  clearAnalyticsError,
  clearAnalyticsData,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;