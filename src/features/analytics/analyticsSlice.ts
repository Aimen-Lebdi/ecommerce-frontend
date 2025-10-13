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
  type DashboardCard,
  type TopProductCard,
  type BestOrder,
  type TopCustomer,
  type BestProduct,
  type GrowthRateData,
} from "./analyticsAPI";

// State interface for analytics slice
interface AnalyticsState {
  // Cards data
  revenue: DashboardCard | null;
  customers: DashboardCard | null;
  orders: DashboardCard | null;
  topProduct: TopProductCard | null;
  
  // Tables data
  bestOrders: BestOrder[];
  topCustomers: TopCustomer[];
  bestProducts: BestProduct[];
  
  // Growth rate data
  growthRateData: GrowthRateData[];
  growthRatePeriod: string;
  
  // Loading states
  cardsLoading: boolean;
  tablesLoading: boolean;
  growthRateLoading: boolean;
  dashboardLoading: boolean;
  
  // Error states
  cardsError: string | null;
  tablesError: string | null;
  growthRateError: string | null;
  dashboardError: string | null;
}

// Initial state
const initialState: AnalyticsState = {
  revenue: null,
  customers: null,
  orders: null,
  topProduct: null,
  bestOrders: [],
  topCustomers: [],
  bestProducts: [],
  growthRateData: [],
  growthRatePeriod: "90d",
  cardsLoading: false,
  tablesLoading: false,
  growthRateLoading: false,
  dashboardLoading: false,
  cardsError: null,
  tablesError: null,
  growthRateError: null,
  dashboardError: null,
};

// Async thunk to fetch dashboard cards
export const fetchDashboardCards = createAsyncThunk<
  {
    revenue: DashboardCard;
    customers: DashboardCard;
    orders: DashboardCard;
    topProduct: TopProductCard;
  },
  void,
  { rejectValue: string }
>("analytics/fetchDashboardCards", async (_, { rejectWithValue }) => {
  try {
    const response = await fetchDashboardCardsAPI();
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
  void,
  { rejectValue: string }
>("analytics/fetchDashboardTables", async (_, { rejectWithValue }) => {
  try {
    const response = await fetchDashboardTablesAPI();
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to fetch dashboard tables"
    );
  }
});

// Async thunk to fetch growth rate data
export const fetchGrowthRate = createAsyncThunk<
  {
    period: string;
    chartData: GrowthRateData[];
  },
  7 | 30 | 90,
  { rejectValue: string }
>("analytics/fetchGrowthRate", async (days, { rejectWithValue }) => {
  try {
    const response = await fetchGrowthRateAPI(days);
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
    };
    tables: {
      bestOrders: BestOrder[];
      topCustomers: TopCustomer[];
      bestProducts: BestProduct[];
    };
  },
  void,
  { rejectValue: string }
>("analytics/fetchCompleteDashboard", async (_, { rejectWithValue }) => {
  try {
    const response = await fetchCompleteDashboardAPI();
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to fetch dashboard data"
    );
  }
});

// Slice with reducers and state management
const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    clearAnalyticsError: (state) => {
      state.cardsError = null;
      state.tablesError = null;
      state.growthRateError = null;
      state.dashboardError = null;
    },
    clearAnalyticsData: (state) => {
      state.revenue = null;
      state.customers = null;
      state.orders = null;
      state.topProduct = null;
      state.bestOrders = [];
      state.topCustomers = [];
      state.bestProducts = [];
      state.growthRateData = [];
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
          }>
        ) => {
          state.cardsLoading = false;
          state.revenue = action.payload.revenue;
          state.customers = action.payload.customers;
          state.orders = action.payload.orders;
          state.topProduct = action.payload.topProduct;
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
          // Update tables
          state.bestOrders = action.payload.tables.bestOrders;
          state.topCustomers = action.payload.tables.topCustomers;
          state.bestProducts = action.payload.tables.bestProducts;
        }
      )
      .addCase(fetchCompleteDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError = action.payload || "Failed to fetch dashboard data";
      });
  },
});

export const { clearAnalyticsError, clearAnalyticsData } = analyticsSlice.actions;

export default analyticsSlice.reducer;