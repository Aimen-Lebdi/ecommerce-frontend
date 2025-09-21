/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/subcategories/subCategoriesSlice.ts
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  fetchSubCategoriesAPI,
  createSubCategoryAPI,
  updateSubCategoryAPI,
  deleteSubCategoryAPI,
  deleteManySubCategoriesAPI,
  type SubCategoriesQueryParams,
  type SubCategoriesResponse,
} from "./subCategoriesAPI";

// Define the SubCategory type to match backend response
export interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  category: {
    _id: string;
    name: string;
  } | string; // Can be populated object or just ID
  productCount: number;
  createdAt: string;
  updatedAt?: string;
}

// Define interface for creating subcategory
export interface CreateSubCategoryData {
  name: string;
  category: string; // Category ID
  image?: File;
}

// Define interface for updating subcategory
export interface UpdateSubCategoryData {
  name?: string;
  category?: string; // Category ID
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

// State interface for subcategories slice
interface SubCategoriesState {
  subcategories: SubCategory[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isDeletingMany: boolean;
  currentQueryParams: SubCategoriesQueryParams;
}

// Initial state
const initialState: SubCategoriesState = {
  subcategories: [],
  pagination: null,
  loading: false,
  error: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isDeletingMany: false,
  currentQueryParams: {},
};

// Async thunk to fetch subcategories from backend with query parameters
export const fetchSubCategories = createAsyncThunk<
  { subcategories: SubCategory[]; pagination: PaginationMeta },
  SubCategoriesQueryParams,
  { rejectValue: { message: string; status?: number } }
>("subcategories/fetchSubCategories", async (queryParams, { rejectWithValue }) => {
  try {
    const response: SubCategoriesResponse = await fetchSubCategoriesAPI(queryParams);

    return {
      subcategories: response.documents,
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
        subcategories: [],
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

// Async thunk to create subcategory
export const createSubCategory = createAsyncThunk<
  SubCategory,
  CreateSubCategoryData,
  { rejectValue: string; state: { subCategories: SubCategoriesState } }
>(
  "subcategories/createSubCategory",
  async (subCategoryData, { rejectWithValue, getState, dispatch }) => {
    try {
      const formData = new FormData();
      formData.append("name", subCategoryData.name);
      formData.append("category", subCategoryData.category);
      if (subCategoryData.image) {
        formData.append("image", subCategoryData.image);
      }

      const data = await createSubCategoryAPI(formData);

      // Refetch subcategories to maintain pagination integrity
      const state = getState();
      dispatch(fetchSubCategories(state.subCategories.currentQueryParams));

      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk to update subcategory
export const updateSubCategory = createAsyncThunk<
  SubCategory,
  { id: string; subCategoryData: UpdateSubCategoryData },
  { rejectValue: string; state: { subCategories: SubCategoriesState } }
>(
  "subcategories/updateSubCategory",
  async ({ id, subCategoryData }, { rejectWithValue, getState, dispatch }) => {
    try {
      const formData = new FormData();
      if (subCategoryData.name) {
        formData.append("name", subCategoryData.name);
      }
      if (subCategoryData.category) {
        formData.append("category", subCategoryData.category);
      }
      if (subCategoryData.image) {
        formData.append("image", subCategoryData.image);
      }

      const data = await updateSubCategoryAPI(id, formData);

      // Refetch to maintain consistency with server-side data
      const state = getState();
      dispatch(fetchSubCategories(state.subCategories.currentQueryParams));

      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk to delete subcategory
export const deleteSubCategory = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: { subCategories: SubCategoriesState } }
>(
  "subcategories/deleteSubCategory",
  async (id, { rejectWithValue, getState, dispatch }) => {
    try {
      await deleteSubCategoryAPI(id);

      // Refetch subcategories to maintain pagination integrity
      const state = getState();
      dispatch(fetchSubCategories(state.subCategories.currentQueryParams));

      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk for bulk delete
export const deleteManySubCategories = createAsyncThunk<
  string[],
  string[],
  { rejectValue: string; state: { subCategories: SubCategoriesState } }
>(
  "subcategories/deleteManySubCategories",
  async (ids, { rejectWithValue, getState, dispatch }) => {
    try {
      await deleteManySubCategoriesAPI(ids);

      // Refetch subcategories to maintain pagination integrity
      const state = getState();
      dispatch(fetchSubCategories(state.subCategories.currentQueryParams));

      return ids;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Slice with reducers and state management
const subCategoriesSlice = createSlice({
  name: "subcategories",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Action to update current query parameters
    setQueryParams: (state, action: PayloadAction<SubCategoriesQueryParams>) => {
      state.currentQueryParams = action.payload;
    },
    // Action to reset query parameters
    resetQueryParams: (state) => {
      state.currentQueryParams = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch subcategories
      .addCase(fetchSubCategories.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        // Store the query parameters used for this fetch
        state.currentQueryParams = action.meta.arg;
      })
      .addCase(
        fetchSubCategories.fulfilled,
        (
          state,
          action: PayloadAction<{
            subcategories: SubCategory[];
            pagination: PaginationMeta;
          }>
        ) => {
          state.loading = false;
          state.subcategories = action.payload.subcategories;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchSubCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "An error occurred";
      })
      // Create subcategory
      .addCase(createSubCategory.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createSubCategory.fulfilled, (state) => {
        state.isCreating = false;
        // Don't modify subcategories array here since we refetch
      })
      .addCase(createSubCategory.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || "Failed to create subcategory";
      })
      // Update subcategory
      .addCase(updateSubCategory.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateSubCategory.fulfilled, (state) => {
        state.isUpdating = false;
        // Don't modify subcategories array here since we refetch
      })
      .addCase(updateSubCategory.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || "Failed to update subcategory";
      })
      // Delete subcategory
      .addCase(deleteSubCategory.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteSubCategory.fulfilled, (state) => {
        state.isDeleting = false;
        // Don't modify subcategories array here since we refetch
      })
      .addCase(deleteSubCategory.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload || "Failed to delete subcategory";
      })
      // Bulk delete subcategories
      .addCase(deleteManySubCategories.pending, (state) => {
        state.isDeletingMany = true;
        state.error = null;
      })
      .addCase(deleteManySubCategories.fulfilled, (state) => {
        state.isDeletingMany = false;
        // Don't modify subcategories array here since we refetch
      })
      .addCase(deleteManySubCategories.rejected, (state, action) => {
        state.isDeletingMany = false;
        state.error = action.payload || "Failed to delete subcategories";
      });
  },
});

export const { clearError, setQueryParams, resetQueryParams } =
  subCategoriesSlice.actions;
export default subCategoriesSlice.reducer;