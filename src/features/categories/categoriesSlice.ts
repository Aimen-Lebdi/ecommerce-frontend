/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/categories/categoriesSlice.ts
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  fetchCategoriesAPI,
  createCategoryAPI,
  updateCategoryAPI,
  deleteCategoryAPI,
  deleteManyCategoriesAPI,
  type CategoriesQueryParams,
  type CategoriesResponse,
} from "./categoriesAPI";

// Define the Category type to match backend response
export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  productCount: number;
  createdAt: string;
  updatedAt?: string;
}

// Define interface for creating category
export interface CreateCategoryData {
  name: string;
  image?: File;
}

// Define interface for updating category
export interface UpdateCategoryData {
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

// State interface for categories slice
interface CategoriesState {
  categories: Category[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isDeletingMany: boolean;
  currentQueryParams: CategoriesQueryParams;
}

// Initial state
const initialState: CategoriesState = {
  categories: [],
  pagination: null,
  loading: false,
  error: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isDeletingMany: false,
  currentQueryParams: {},
};

// Async thunk to fetch categories from backend with query parameters
export const fetchCategories = createAsyncThunk<
  { categories: Category[]; pagination: PaginationMeta },
  CategoriesQueryParams,
  { rejectValue: { message: string; status?: number } }
>("categories/fetchCategories", async (queryParams, { rejectWithValue }) => {
  try {
    const response: CategoriesResponse = await fetchCategoriesAPI(queryParams);

    return {
      categories: response.documents,
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
        categories: [],
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

// Async thunk to create category
export const createCategory = createAsyncThunk<
  Category,
  CreateCategoryData,
  { rejectValue: string; state: { categories: CategoriesState } }
>(
  "categories/createCategory",
  async (categoryData, { rejectWithValue, getState, dispatch }) => {
    try {
      const formData = new FormData();
      formData.append("name", categoryData.name);
      if (categoryData.image) {
        formData.append("image", categoryData.image);
      }

      const data = await createCategoryAPI(formData);

      // Refetch categories to maintain pagination integrity
      const state = getState();
      dispatch(fetchCategories(state.categories.currentQueryParams));

      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk to update category
export const updateCategory = createAsyncThunk<
  Category,
  { id: string; categoryData: UpdateCategoryData },
  { rejectValue: string; state: { categories: CategoriesState } }
>(
  "categories/updateCategory",
  async ({ id, categoryData }, { rejectWithValue, getState, dispatch }) => {
    try {
      const formData = new FormData();
      if (categoryData.name) {
        formData.append("name", categoryData.name);
      }
      if (categoryData.image) {
        formData.append("image", categoryData.image);
      }

      const data = await updateCategoryAPI(id, formData);

      // Refetch to maintain consistency with server-side data
      const state = getState();
      dispatch(fetchCategories(state.categories.currentQueryParams));

      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk to delete category
export const deleteCategory = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: { categories: CategoriesState } }
>(
  "categories/deleteCategory",
  async (id, { rejectWithValue, getState, dispatch }) => {
    try {
      await deleteCategoryAPI(id);

      // Refetch categories to maintain pagination integrity
      const state = getState();
      dispatch(fetchCategories(state.categories.currentQueryParams));

      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk for bulk delete
export const deleteManyCategories = createAsyncThunk<
  string[],
  string[],
  { rejectValue: string; state: { categories: CategoriesState } }
>(
  "categories/deleteManyCategories",
  async (ids, { rejectWithValue, getState, dispatch }) => {
    try {
      await deleteManyCategoriesAPI(ids);

      // Refetch categories to maintain pagination integrity
      const state = getState();
      dispatch(fetchCategories(state.categories.currentQueryParams));

      return ids;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Slice with reducers and state management
const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Action to update current query parameters
    setQueryParams: (state, action: PayloadAction<CategoriesQueryParams>) => {
      state.currentQueryParams = action.payload;
    },
    // Action to reset query parameters
    resetQueryParams: (state) => {
      state.currentQueryParams = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        // Store the query parameters used for this fetch
        state.currentQueryParams = action.meta.arg;
      })
      .addCase(
        fetchCategories.fulfilled,
        (
          state,
          action: PayloadAction<{
            categories: Category[];
            pagination: PaginationMeta;
          }>
        ) => {
          state.loading = false;
          state.categories = action.payload.categories;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "An error occurred";
      })
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state) => {
        state.isCreating = false;
        // Don't modify categories array here since we refetch
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || "Failed to create category";
      })
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state) => {
        state.isUpdating = false;
        // Don't modify categories array here since we refetch
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || "Failed to update category";
      })
      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state) => {
        state.isDeleting = false;
        // Don't modify categories array here since we refetch
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload || "Failed to delete category";
      })
      // Bulk delete categories
      .addCase(deleteManyCategories.pending, (state) => {
        state.isDeletingMany = true;
        state.error = null;
      })
      .addCase(deleteManyCategories.fulfilled, (state) => {
        state.isDeletingMany = false;
        // Don't modify categories array here since we refetch
      })
      .addCase(deleteManyCategories.rejected, (state, action) => {
        state.isDeletingMany = false;
        state.error = action.payload || "Failed to delete categories";
      });
  },
});

export const { clearError, setQueryParams, resetQueryParams } =
  categoriesSlice.actions;
export default categoriesSlice.reducer;
