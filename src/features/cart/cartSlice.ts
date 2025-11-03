/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  addProductToCartAPI,
  getLoggedUserCartAPI,
  removeCartItemAPI,
  clearCartAPI,
  updateCartItemQuantityAPI,
  applyCouponAPI,
  type CartItem,
  type CartResponse,
} from "./cartAPI";

// Interface for cart state
interface CartState {
  cartId: string | null; // ADD THIS LINE
  cartItems: CartItem[];
  numOfCartItems: number;
  totalCartPrice: number;
  totalPriceAfterDiscount?: number;
  loading: boolean;
  error: string | null;
  isAddingToCart: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
  appliedCoupon: {
    code: string;
    discount: number;
  } | null;
}
export interface CartIdInfo {
  cartId: string;
}
// Initial state
const initialState: CartState = {
  cartId: null, // ADD THIS LINE

  cartItems: [],
  numOfCartItems: 0,
  totalCartPrice: 0,
  totalPriceAfterDiscount: undefined,
  loading: false,
  error: null,
  isAddingToCart: false,
  isUpdating: false,
  isRemoving: false,
  appliedCoupon: null,
};

// Async thunk to add product to cart
export const addProductToCart = createAsyncThunk<
  CartResponse,
  { productId: string; color: string },
  { rejectValue: string }
>(
  "cart/addProductToCart",
  async (productData, { rejectWithValue, dispatch }) => {
    try {
      const data = await addProductToCartAPI(productData);
      // Fetch updated cart after adding
      dispatch(fetchCart());
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to add product to cart"
      );
    }
  }
);

// Async thunk to fetch cart
export const fetchCart = createAsyncThunk<
  CartResponse,
  void,
  { rejectValue: string }
>("cart/fetchCart", async (_, { rejectWithValue }) => {
  try {
    const data = await getLoggedUserCartAPI();
    return data;
  } catch (err: any) {
    // Handle 404 as empty cart
    if (err.response?.status === 404) {
      return {
        status: "success",
        numOfCartItems: 0,
        data: {
          _id: "",
          cartItems: [],
          totalCartPrice: 0,
          user: "",
          createdAt: "",
          updatedAt: "",
        },
      };
    }
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to fetch cart"
    );
  }
});

// Async thunk to remove cart item
export const removeCartItem = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("cart/removeCartItem", async (itemId, { rejectWithValue, dispatch }) => {
  try {
    await removeCartItemAPI(itemId);
    // Fetch updated cart after removing
    dispatch(fetchCart());
    return itemId;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to remove item"
    );
  }
});

// Async thunk to clear cart
export const clearCart = createAsyncThunk<void, void, { rejectValue: string }>(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      await clearCartAPI();
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Failed to clear cart"
      );
    }
  }
);

// Async thunk to update cart item quantity
export const updateCartItemQuantity = createAsyncThunk<
  CartResponse,
  { itemId: string; quantity: number },
  { rejectValue: string }
>(
  "cart/updateCartItemQuantity",
  async ({ itemId, quantity }, { rejectWithValue, dispatch }) => {
    try {
      const data = await updateCartItemQuantityAPI(itemId, quantity);
      // Fetch updated cart after updating
      dispatch(fetchCart());
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to update quantity"
      );
    }
  }
);

// Async thunk to apply coupon
export const applyCoupon = createAsyncThunk<
  CartResponse,
  string,
  { rejectValue: string }
>("cart/applyCoupon", async (couponCode, { rejectWithValue, dispatch }) => {
  try {
    const data = await applyCouponAPI(couponCode);
    // Fetch updated cart after applying coupon
    dispatch(fetchCart());
    return data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Invalid or expired coupon"
    );
  }
});

// Cart slice
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAppliedCoupon: (state) => {
      state.appliedCoupon = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add product to cart
      .addCase(addProductToCart.pending, (state) => {
        state.isAddingToCart = true;
        state.error = null;
      })
      .addCase(addProductToCart.fulfilled, (state) => {
        state.isAddingToCart = false;
      })
      .addCase(addProductToCart.rejected, (state, action) => {
        state.isAddingToCart = false;
        state.error = action.payload || "Failed to add product to cart";
      })
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCart.fulfilled,
        (state, action: PayloadAction<CartResponse>) => {
          state.loading = false;
          state.cartItems = action.payload.data.cartItems || [];
          state.numOfCartItems = action.payload.numOfCartItems || 0;
          state.totalCartPrice = action.payload.data.totalCartPrice || 0;
          state.totalPriceAfterDiscount =
            action.payload.data.totalPriceAfterDiscount;
          state.cartId = action.payload.data._id; // Store cart ID
        }
      )
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch cart";
      })
      // Remove cart item
      .addCase(removeCartItem.pending, (state) => {
        state.isRemoving = true;
        state.error = null;
      })
      .addCase(removeCartItem.fulfilled, (state) => {
        state.isRemoving = false;
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.isRemoving = false;
        state.error = action.payload || "Failed to remove item";
      })
      // Clear cart
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.loading = false;
        state.cartItems = [];
        state.numOfCartItems = 0;
        state.totalCartPrice = 0;
        state.totalPriceAfterDiscount = undefined;
        state.appliedCoupon = null;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to clear cart";
      })
      // Update cart item quantity
      .addCase(updateCartItemQuantity.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state) => {
        state.isUpdating = false;
      })
      .addCase(updateCartItemQuantity.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || "Failed to update quantity";
      })
      // Apply coupon
      .addCase(applyCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.loading = false;
        // Update applied coupon info if needed
        if (action.payload.data.totalPriceAfterDiscount) {
          state.appliedCoupon = {
            code: action.meta.arg,
            discount:
              state.totalCartPrice -
              action.payload.data.totalPriceAfterDiscount,
          };
        }
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to apply coupon";
      });
  },
});

export const { clearError, clearAppliedCoupon } = cartSlice.actions;

export default cartSlice.reducer;

// Selector to get cart ID
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const selectCartId = (_state: { cart: CartState }): string | null => {
  // You'll need to store cart ID in state when fetching cart
  // For now, return null - we'll get it from the cart response
  return null;
};
