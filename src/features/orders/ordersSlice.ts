/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  fetchOrdersAPI,
  getOrderAPI,
  createCashOrderAPI,
  createCheckoutSessionAPI,
  confirmOrderAPI,
  confirmCardOrderAPI,
  shipOrderAPI,
  cancelOrderAPI,
  getOrderTrackingAPI,
  simulateDeliveryAPI,
  type OrdersQueryParams,
  type OrdersResponse,
  type CreateCashOrderData,
  type TrackingInfo,
  getOrderBySessionAPI,
} from "./ordersAPI";

// Define the Order type to match backend response
export interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    profileImg?: string;
  };
  cartItems: {
    _id: string;
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
    details: string;
    phone: string;
    dayra: string;
    wilaya: string;
  };
  shippingPrice: number;
  totalOrderPrice: number;
  paymentMethodType: "card" | "cash";
  deliveryStatus:
    | "pending"
    | "confirmed"
    | "shipped"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "completed"
    | "failed"
    | "returned"
    | "cancelled";
  paymentStatus:
    | "pending"
    | "authorized"
    | "failed"
    | "confirmed"
    | "refunded"
    | "partially_refunded"
    | "completed";
  trackingNumber?: string;
  codAmount?: number;
  statusHistory: Array<{
    status: string;
    timestamp: Date;
    note: string;
    updatedBy: string;
  }>;
  deliveryAgency?: {
    name: string;
    apiResponse?: any;
  };
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
  currentOrder: Order | null;
  trackingInfo: TrackingInfo | null;
  checkoutSession: any | null;
  pagination: PaginationMeta | null;
  loading: boolean;
  loadingOrder: boolean;
  loadingTracking: boolean;
  error: string | null;
  orderError: string | null;
  isCreatingOrder: boolean;
  isCreatingCheckout: boolean;
  isConfirming: boolean;
  isShipping: boolean;
  isCancelling: boolean;
  isSimulating: boolean;
  currentQueryParams: OrdersQueryParams;
}

// Initial state
const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  trackingInfo: null,
  checkoutSession: null,
  pagination: null,
  loading: false,
  loadingOrder: false,
  loadingTracking: false,
  error: null,
  orderError: null,
  isCreatingOrder: false,
  isCreatingCheckout: false,
  isConfirming: false,
  isShipping: false,
  isCancelling: false,
  isSimulating: false,
  currentQueryParams: {},
};

// Async thunk to fetch orders
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

// Async thunk to get specific order
export const getOrder = createAsyncThunk<
  Order,
  string,
  { rejectValue: string }
>("orders/getOrder", async (id, { rejectWithValue }) => {
  try {
    const data = await getOrderAPI(id);
    console.log(data);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Async thunk to create cash order
export const createCashOrder = createAsyncThunk<
  Order,
  { cartId: string; orderData: CreateCashOrderData },
  { rejectValue: string }
>(
  "orders/createCashOrder",
  async ({ cartId, orderData }, { rejectWithValue }) => {
    try {
      const response = await createCashOrderAPI(cartId, orderData);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ADD this new thunk after getOrder:
export const getOrderBySession = createAsyncThunk<
  Order,
  string,
  { rejectValue: string }
>("orders/getOrderBySession", async (sessionId, { rejectWithValue }) => {
  try {
    const data = await getOrderBySessionAPI(sessionId);
    return data.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// UPDATE createCheckoutSession thunk:
export const createCheckoutSession = createAsyncThunk<
  any,
  { cartId: string; shippingAddress: any },
  { rejectValue: string }
>(
  "orders/createCheckoutSession",
  async ({ cartId, shippingAddress }, { rejectWithValue }) => {
    try {
      const response = await createCheckoutSessionAPI(cartId, shippingAddress);
      return response.session;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk to confirm order
export const confirmOrder = createAsyncThunk<
  Order,
  string,
  { rejectValue: string; state: { orders: OrdersState } }
>(
  "orders/confirmOrder",
  async (id, { rejectWithValue, getState, dispatch }) => {
    try {
      const response = await confirmOrderAPI(id);

      // Refetch orders to maintain consistency
      const state = getState();
      dispatch(fetchOrders(state.orders.currentQueryParams));

      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk to confirm card order
export const confirmCardOrder = createAsyncThunk<
  Order,
  string,
  { rejectValue: string; state: { orders: OrdersState } }
>(
  "orders/confirmCardOrder",
  async (id, { rejectWithValue, getState, dispatch }) => {
    try {
      const response = await confirmCardOrderAPI(id);

      // Refetch orders to maintain consistency
      const state = getState();
      dispatch(fetchOrders(state.orders.currentQueryParams));

      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk to ship order
export const shipOrder = createAsyncThunk<
  any,
  string,
  { rejectValue: string; state: { orders: OrdersState } }
>("orders/shipOrder", async (id, { rejectWithValue, getState, dispatch }) => {
  try {
    const response = await shipOrderAPI(id);

    // Refetch orders to maintain consistency
    const state = getState();
    dispatch(fetchOrders(state.orders.currentQueryParams));

    return response;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Async thunk to cancel order
export const cancelOrder = createAsyncThunk<
  Order,
  { id: string; reason?: string },
  { rejectValue: string; state: { orders: OrdersState } }
>(
  "orders/cancelOrder",
  async ({ id, reason }, { rejectWithValue, getState, dispatch }) => {
    try {
      const response = await cancelOrderAPI(id, reason);

      // Refetch orders to maintain consistency
      const state = getState();
      dispatch(fetchOrders(state.orders.currentQueryParams));

      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk to get order tracking
export const getOrderTracking = createAsyncThunk<
  TrackingInfo,
  string,
  { rejectValue: string }
>("orders/getOrderTracking", async (id, { rejectWithValue }) => {
  try {
    const response = await getOrderTrackingAPI(id);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Async thunk to simulate delivery
export const simulateDelivery = createAsyncThunk<
  any,
  { id: string; speed?: string; scenario?: string },
  { rejectValue: string }
>(
  "orders/simulateDelivery",
  async ({ id, speed, scenario }, { rejectWithValue }) => {
    try {
      const response = await simulateDeliveryAPI(id, { speed, scenario });
      return response;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Slice with reducers and state management
const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.orderError = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.orderError = null;
    },
    clearTrackingInfo: (state) => {
      state.trackingInfo = null;
    },
    clearCheckoutSession: (state) => {
      state.checkoutSession = null;
    },
    setQueryParams: (state, action: PayloadAction<OrdersQueryParams>) => {
      state.currentQueryParams = action.payload;
    },
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
        state.currentQueryParams = action.meta.arg;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "An error occurred";
      })
      // Get specific order
      .addCase(getOrder.pending, (state) => {
        state.loadingOrder = true;
        state.orderError = null;
      })
      .addCase(getOrder.fulfilled, (state, action) => {
        state.loadingOrder = false;
        console.log(action);
        state.currentOrder = action.payload;
      })
      .addCase(getOrder.rejected, (state, action) => {
        state.loadingOrder = false;
        state.orderError = action.payload || "Failed to fetch order";
      })
      // Create cash order
      .addCase(createCashOrder.pending, (state) => {
        state.isCreatingOrder = true;
        state.error = null;
      })
      .addCase(createCashOrder.fulfilled, (state, action) => {
        state.isCreatingOrder = false;
        state.currentOrder = action.payload;
      })
      .addCase(createCashOrder.rejected, (state, action) => {
        state.isCreatingOrder = false;
        state.error = action.payload || "Failed to create order";
      })
      // Create checkout session
      .addCase(createCheckoutSession.pending, (state) => {
        state.isCreatingCheckout = true;
        state.error = null;
      })
      .addCase(createCheckoutSession.fulfilled, (state, action) => {
        state.isCreatingCheckout = false;
        state.checkoutSession = action.payload;
      })
      .addCase(createCheckoutSession.rejected, (state, action) => {
        state.isCreatingCheckout = false;
        state.error = action.payload || "Failed to create checkout session";
      })
      // Confirm order
      .addCase(confirmOrder.pending, (state) => {
        state.isConfirming = true;
        state.error = null;
      })
      .addCase(confirmOrder.fulfilled, (state) => {
        state.isConfirming = false;
      })
      .addCase(confirmOrder.rejected, (state, action) => {
        state.isConfirming = false;
        state.error = action.payload || "Failed to confirm order";
      })
      // Confirm card order
      .addCase(confirmCardOrder.pending, (state) => {
        state.isConfirming = true;
        state.error = null;
      })
      .addCase(confirmCardOrder.fulfilled, (state) => {
        state.isConfirming = false;
      })
      .addCase(confirmCardOrder.rejected, (state, action) => {
        state.isConfirming = false;
        state.error = action.payload || "Failed to confirm card order";
      })
      // Ship order
      .addCase(shipOrder.pending, (state) => {
        state.isShipping = true;
        state.error = null;
      })
      .addCase(shipOrder.fulfilled, (state) => {
        state.isShipping = false;
      })
      .addCase(shipOrder.rejected, (state, action) => {
        state.isShipping = false;
        state.error = action.payload || "Failed to ship order";
      })
      // Cancel order
      .addCase(cancelOrder.pending, (state) => {
        state.isCancelling = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state) => {
        state.isCancelling = false;
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isCancelling = false;
        state.error = action.payload || "Failed to cancel order";
      })
      // Get order tracking
      .addCase(getOrderTracking.pending, (state) => {
        state.loadingTracking = true;
        state.error = null;
      })
      .addCase(getOrderTracking.fulfilled, (state, action) => {
        state.loadingTracking = false;
        state.trackingInfo = action.payload;
      })
      .addCase(getOrderTracking.rejected, (state, action) => {
        state.loadingTracking = false;
        state.error = action.payload || "Failed to get tracking info";
      })
      // Simulate delivery
      .addCase(simulateDelivery.pending, (state) => {
        state.isSimulating = true;
        state.error = null;
      })
      .addCase(simulateDelivery.fulfilled, (state) => {
        state.isSimulating = false;
      })
      .addCase(simulateDelivery.rejected, (state, action) => {
        state.isSimulating = false;
        state.error = action.payload || "Failed to simulate delivery";
      });
  },
});

export const {
  clearError,
  clearCurrentOrder,
  clearTrackingInfo,
  clearCheckoutSession,
  setQueryParams,
  resetQueryParams,
} = ordersSlice.actions;

export default ordersSlice.reducer;
