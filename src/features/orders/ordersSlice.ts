/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/orders/ordersSlice.ts
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  fetchOrdersAPI,
  updateOrderToPaidAPI,
  updateOrderToDeliveredAPI,
  getOrderAPI,
  type OrdersQueryParams,
  type OrdersResponse,
} from "./ordersAPI";

// Define the Order type to match backend response
export interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  cartItems: {
    product: {
      _id: string;
      title: string;
      imageCover?: string;
    };
    quantity: number;
    color?: string;
    price: number;
  }[];
  taxPrice: number;
  shippingAddress: {
    details?: string;
    phone?: string;
    city?: string;
    postalCode?: string;
  };
  shippingPrice: number;
  totalOrderPrice: number;
  paymentMethodType: "card" | "cash";
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// Pagination metadata interface
export interface PaginationMeta {
  currentPage: number;
  limit: number;
  numberOfPages: number;
  nextPage?: number;
  previousPage?: number;
  totalResults: number;
}

// State interface for orders slice
interface OrdersState {
  orders: Order[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  isUpdatingPayment: boolean;
  isUpdatingDelivery: boolean;
  currentQueryParams: OrdersQueryParams;
}

// Initial state
const initialState: OrdersState = {
  orders: [],
  pagination: null,
  loading: false,
  error: null,
  isUpdatingPayment: false,
  isUpdatingDelivery: false,
  currentQueryParams: {},
};

// Async thunk to fetch orders from backend with query parameters
export const fetchOrders = createAsyncThunk<
  { orders: Order[]; pagination: PaginationMeta },
  OrdersQueryParams,
  { rejectValue: { message: string; status?: number } }
>("orders/fetchOrders", async (queryParams, { rejectWithValue }) => {
  try {
    const response: OrdersResponse = await fetchOrdersAPI(queryParams);

    return {
      orders: response.documents,
      pagination: {
        ...response.pagination,
        totalResults: response.result,
      },
    };
  } catch (err: any) {
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message;

    // Handle 404 as a special case - not really an "error" but no results
    if (status === 404) {
      return {
        orders: [],
        pagination: {
          currentPage: 1,
          limit: queryParams.limit || 10,
          numberOfPages: 0,
          totalResults: 0,
        },
      };
    }

    return rejectWithValue({ message, status });
  }
});

// Async thunk to update order payment status
export const updateOrderToPaid = createAsyncThunk<
  Order,
  string,
  { rejectValue: string; state: { orders: OrdersState } }
>(
  "orders/updateOrderToPaid",
  async (id, { rejectWithValue, getState, dispatch }) => {
    try {
      const data = await updateOrderToPaidAPI(id);

      // Refetch orders to maintain consistency
      const state = getState();
      dispatch(fetchOrders(state.orders.currentQueryParams));

      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk to update order delivery status
export const updateOrderToDelivered = createAsyncThunk<
  Order,
  string,
  { rejectValue: string; state: { orders: OrdersState } }
>(
  "orders/updateOrderToDelivered",
  async (id, { rejectWithValue, getState, dispatch }) => {
    try {
      const data = await updateOrderToDeliveredAPI(id);

      // Refetch orders to maintain consistency
      const state = getState();
      dispatch(fetchOrders(state.orders.currentQueryParams));

      return data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk to get specific order
export const getOrder = createAsyncThunk<
  Order,
  string,
  { rejectValue: string }
>("orders/getOrder", async (id, { rejectWithValue }) => {
  try {
    const data = await getOrderAPI(id);
    return data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Slice with reducers and state management
const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Action to update current query parameters
    setQueryParams: (state, action: PayloadAction<OrdersQueryParams>) => {
      state.currentQueryParams = action.payload;
    },
    // Action to reset query parameters
    resetQueryParams: (state) => {
      state.currentQueryParams = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch orders
      .addCase(fetchOrders.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        // Store the query parameters used for this fetch
        state.currentQueryParams = action.meta.arg;
      })
      .addCase(
        fetchOrders.fulfilled,
        (
          state,
          action: PayloadAction<{
            orders: Order[];
            pagination: PaginationMeta;
          }>
        ) => {
          state.loading = false;
          state.orders = action.payload.orders;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "An error occurred";
      })
      // Update order payment status
      .addCase(updateOrderToPaid.pending, (state) => {
        state.isUpdatingPayment = true;
        state.error = null;
      })
      .addCase(updateOrderToPaid.fulfilled, (state) => {
        state.isUpdatingPayment = false;
        // Don't modify orders array here since we refetch
      })
      .addCase(updateOrderToPaid.rejected, (state, action) => {
        state.isUpdatingPayment = false;
        state.error = action.payload || "Failed to update payment status";
      })
      // Update order delivery status
      .addCase(updateOrderToDelivered.pending, (state) => {
        state.isUpdatingDelivery = true;
        state.error = null;
      })
      .addCase(updateOrderToDelivered.fulfilled, (state) => {
        state.isUpdatingDelivery = false;
        // Don't modify orders array here since we refetch
      })
      .addCase(updateOrderToDelivered.rejected, (state, action) => {
        state.isUpdatingDelivery = false;
        state.error = action.payload || "Failed to update delivery status";
      })
      // Get specific order
      .addCase(getOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrder.fulfilled, (state) => {
        state.loading = false;
        // You might want to handle single order differently
      })
      .addCase(getOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch order";
      });
  },
});

export const { clearError, setQueryParams, resetQueryParams } =
  ordersSlice.actions;
export default ordersSlice.reducer;