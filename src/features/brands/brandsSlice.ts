/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/brands/brandsSlice.ts
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  fetchBrandsAPI,
  createBrandAPI,
  updateBrandAPI,
  deleteBrandAPI,
  deleteManyBrandsAPI,
  type BrandsQueryParams,
  type BrandsResponse,
} from "./brandsAPI";

// Define the Brand type to match backend response
export interface Brand {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  productCount: number;
  createdAt: string;
  updatedAt?: string;
}

// Define interface for creating brand
export interface CreateBrandData {
  name: string;
  image?: File;
}

// Define interface for updating brand
export interface UpdateBrandData {
  name?: string;
  image?: File;
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

// State interface for brands slice
interface BrandsState {
  brands: Brand[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isDeletingMany: boolean;
  currentQueryParams: BrandsQueryParams;
}

// Initial state
const initialState: BrandsState = {
  brands: [],
  pagination: null,
  loading: false,
  error: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isDeletingMany: false,
  currentQueryParams: {},
};

// Async thunk to fetch brands from backend with query parameters
export const fetchBrands = createAsyncThunk<
  { brands: Brand[]; pagination: PaginationMeta },
  BrandsQueryParams,
  { rejectValue: { message: string; status?: number } }
>("brands/fetchBrands", async (queryParams, { rejectWithValue }) => {
  try {
    const response: BrandsResponse = await fetchBrandsAPI(queryParams);

    return {
      brands: response.documents,
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
        brands: [],
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

// Async thunk to create brand
export const createBrand = createAsyncThunk<
  Brand,
  CreateBrandData,
  { rejectValue: string; state: { brands: BrandsState } }
>(
  "brands/createBrand",
  async (brandData, { rejectWithValue, getState, dispatch }) => {
    try {
      const formData = new FormData();
      formData.append("name", brandData.name);
      if (brandData.image) {
        formData.append("image", brandData.image);
      }

      const data = await createBrandAPI(formData);

      // Refetch brands to maintain pagination integrity
      const state = getState();
      dispatch(fetchBrands(state.brands.currentQueryParams));

      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk to update brand
export const updateBrand = createAsyncThunk<
  Brand,
  { id: string; brandData: UpdateBrandData },
  { rejectValue: string; state: { brands: BrandsState } }
>(
  "brands/updateBrand",
  async ({ id, brandData }, { rejectWithValue, getState, dispatch }) => {
    try {
      const formData = new FormData();
      if (brandData.name) {
        formData.append("name", brandData.name);
      }
      if (brandData.image !== undefined) {
        if (brandData.image === null) {
          formData.append("image", "null");
        } else {
          formData.append("image", brandData.image);
        }
      }

      const data = await updateBrandAPI(id, formData);

      // Refetch to maintain consistency with server-side data
      const state = getState();
      dispatch(fetchBrands(state.brands.currentQueryParams));

      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk to delete brand
export const deleteBrand = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: { brands: BrandsState } }
>(
  "brands/deleteBrand",
  async (id, { rejectWithValue, getState, dispatch }) => {
    try {
      await deleteBrandAPI(id);

      // Refetch brands to maintain pagination integrity
      const state = getState();
      dispatch(fetchBrands(state.brands.currentQueryParams));

      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk for bulk delete
export const deleteManyBrands = createAsyncThunk<
  string[],
  string[],
  { rejectValue: string; state: { brands: BrandsState } }
>(
  "brands/deleteManyBrands",
  async (ids, { rejectWithValue, getState, dispatch }) => {
    try {
      await deleteManyBrandsAPI(ids);

      // Refetch brands to maintain pagination integrity
      const state = getState();
      dispatch(fetchBrands(state.brands.currentQueryParams));

      return ids;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Slice with reducers and state management
const brandsSlice = createSlice({
  name: "brands",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Action to update current query parameters
    setQueryParams: (state, action: PayloadAction<BrandsQueryParams>) => {
      state.currentQueryParams = action.payload;
    },
    // Action to reset query parameters
    resetQueryParams: (state) => {
      state.currentQueryParams = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch brands
      .addCase(fetchBrands.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        // Store the query parameters used for this fetch
        state.currentQueryParams = action.meta.arg;
      })
      .addCase(
        fetchBrands.fulfilled,
        (
          state,
          action: PayloadAction<{
            brands: Brand[];
            pagination: PaginationMeta;
          }>
        ) => {
          state.loading = false;
          state.brands = action.payload.brands;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "An error occurred";
      })
      // Create brand
      .addCase(createBrand.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createBrand.fulfilled, (state) => {
        state.isCreating = false;
        // Don't modify brands array here since we refetch
      })
      .addCase(createBrand.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || "Failed to create brand";
      })
      // Update brand
      .addCase(updateBrand.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateBrand.fulfilled, (state) => {
        state.isUpdating = false;
        // Don't modify brands array here since we refetch
      })
      .addCase(updateBrand.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || "Failed to update brand";
      })
      // Delete brand
      .addCase(deleteBrand.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteBrand.fulfilled, (state) => {
        state.isDeleting = false;
        // Don't modify brands array here since we refetch
      })
      .addCase(deleteBrand.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload || "Failed to delete brand";
      })
      // Bulk delete brands
      .addCase(deleteManyBrands.pending, (state) => {
        state.isDeletingMany = true;
        state.error = null;
      })
      .addCase(deleteManyBrands.fulfilled, (state) => {
        state.isDeletingMany = false;
        // Don't modify brands array here since we refetch
      })
      .addCase(deleteManyBrands.rejected, (state, action) => {
        state.isDeletingMany = false;
        state.error = action.payload || "Failed to delete brands";
      });
  },
});

export const { clearError, setQueryParams, resetQueryParams } =
  brandsSlice.actions;
export default brandsSlice.reducer;