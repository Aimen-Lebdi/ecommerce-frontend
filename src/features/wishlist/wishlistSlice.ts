/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  addProductToWishlistAPI,
  getLoggedUserWishlistAPI,
  removeProductFromWishlistAPI,
  type WishlistProduct,
  type WishlistResponse,
} from "./wishlistAPI";

// Interface for wishlist state
interface WishlistState {
  wishlistItems: WishlistProduct[];
  numOfWishlistItems: number;
  loading: boolean;
  error: string | null;
  isAddingToWishlist: boolean;
  isRemoving: boolean;
}

// Initial state
const initialState: WishlistState = {
  wishlistItems: [],
  numOfWishlistItems: 0,
  loading: false,
  error: null,
  isAddingToWishlist: false,
  isRemoving: false,
};

// Async thunk to add product to wishlist
export const addProductToWishlist = createAsyncThunk<
  WishlistResponse,
  string,
  { rejectValue: string }
>(
  "wishlist/addProductToWishlist",
  async (productId, { rejectWithValue, dispatch }) => {
    try {
      const data = await addProductToWishlistAPI(productId);
      // Fetch updated wishlist after adding
      dispatch(fetchWishlist());
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to add product to wishlist"
      );
    }
  }
);

// Async thunk to fetch wishlist
export const fetchWishlist = createAsyncThunk<
  WishlistResponse,
  void,
  { rejectValue: string }
>("wishlist/fetchWishlist", async (_, { rejectWithValue }) => {
  try {
    const data = await getLoggedUserWishlistAPI();
    return data;
  } catch (err: any) {
    // Handle 404 as empty wishlist
    if (err.response?.status === 404) {
      return {
        status: "success",
        results: 0,
        data: [],
      };
    }
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to fetch wishlist"
    );
  }
});

// Async thunk to remove product from wishlist
export const removeProductFromWishlist = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "wishlist/removeProductFromWishlist",
  async (productId, { rejectWithValue, dispatch }) => {
    try {
      await removeProductFromWishlistAPI(productId);
      // Fetch updated wishlist after removing
      dispatch(fetchWishlist());
      return productId;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
          err.message ||
          "Failed to remove product from wishlist"
      );
    }
  }
);

// Wishlist slice
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add product to wishlist
      .addCase(addProductToWishlist.pending, (state) => {
        state.isAddingToWishlist = true;
        state.error = null;
      })
      .addCase(addProductToWishlist.fulfilled, (state) => {
        state.isAddingToWishlist = false;
      })
      .addCase(addProductToWishlist.rejected, (state, action) => {
        state.isAddingToWishlist = false;
        state.error = action.payload || "Failed to add product to wishlist";
      })
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchWishlist.fulfilled,
        (state, action: PayloadAction<WishlistResponse>) => {
          state.loading = false;
          state.wishlistItems = action.payload.data || [];
          state.numOfWishlistItems = action.payload.results || 0;
        }
      )
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch wishlist";
      })
      // Remove product from wishlist
      .addCase(removeProductFromWishlist.pending, (state) => {
        state.isRemoving = true;
        state.error = null;
      })
      .addCase(removeProductFromWishlist.fulfilled, (state) => {
        state.isRemoving = false;
      })
      .addCase(removeProductFromWishlist.rejected, (state, action) => {
        state.isRemoving = false;
        state.error =
          action.payload || "Failed to remove product from wishlist";
      });
  },
});

export const { clearError } = wishlistSlice.actions;

export default wishlistSlice.reducer;
