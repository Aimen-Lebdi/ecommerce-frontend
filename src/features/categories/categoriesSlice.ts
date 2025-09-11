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

// State interface for categories slice
interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean; // ✅ ADD THIS
    isDeletingMany: boolean; // ✅ ADD THIS

  
}

// Initial state
const initialState: CategoriesState = {
  categories: [],
  loading: false,
  error: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false, // ✅ ADD THIS
  isDeletingMany: false, // ✅ ADD THIS

};

// Async thunk to fetch categories from backend
export const fetchCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: string }
>("categories/fetchCategories", async (_, { rejectWithValue }) => {
  try {
    const data = await fetchCategoriesAPI();
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Async thunk to create category
export const createCategory = createAsyncThunk<
  Category,
  CreateCategoryData,
  { rejectValue: string }
>("categories/createCategory", async (categoryData, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("name", categoryData.name);
    if (categoryData.image) {
      formData.append("image", categoryData.image);
    }

    const data = await createCategoryAPI(formData);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

// Async thunk to update category
export const updateCategory = createAsyncThunk<
  Category,
  { id: string; categoryData: UpdateCategoryData },
  { rejectValue: string }
>(
  "categories/updateCategory",
  async ({ id, categoryData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      if (categoryData.name) {
        formData.append("name", categoryData.name);
      }
      if (categoryData.image) {
        formData.append("image", categoryData.image);
      }

      const data = await updateCategoryAPI(id, formData);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ✅ ADD THIS: Async thunk to delete category
export const deleteCategory = createAsyncThunk<
  string, // Return the deleted category ID
  string, // Category ID to delete
  { rejectValue: string }
>("categories/deleteCategory", async (id, { rejectWithValue }) => {
  try {
    await deleteCategoryAPI(id);
    return id; // Return the deleted category ID
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const deleteManyCategories = createAsyncThunk<
  string[], // Return deleted category IDs
  string[], // Array of category IDs to delete
  { rejectValue: string }
>(
  'categories/deleteManyCategories',
  async (ids, { rejectWithValue }) => {
    try {
      await deleteManyCategoriesAPI(ids);
      return ids; // Return the deleted category IDs
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCategories.fulfilled,
        (state, action: PayloadAction<Category[]>) => {
          state.loading = false;
          state.categories = action.payload;
        }
      )
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch categories";
      })
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(
        createCategory.fulfilled,
        (state, action: PayloadAction<Category>) => {
          state.isCreating = false;
          state.categories.unshift(action.payload); // Add to beginning of array
        }
      )
      .addCase(createCategory.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || "Failed to create category";
      })
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(
        updateCategory.fulfilled,
        (state, action: PayloadAction<Category>) => {
          state.isUpdating = false;
          const index = state.categories.findIndex(
            (cat) => cat._id === action.payload._id
          );
          if (index !== -1) {
            state.categories[index] = action.payload;
          }
        }
      )
      .addCase(updateCategory.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || "Failed to update category";
      })
      .addCase(deleteCategory.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(
        deleteCategory.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.isDeleting = false;
          // Remove the deleted category from the array
          state.categories = state.categories.filter(
            (cat) => cat._id !== action.payload
          );
        }
      )
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload || "Failed to delete category";
      })
      .addCase(deleteManyCategories.pending, (state) => {
      state.isDeletingMany = true;
      state.error = null;
    })
    .addCase(deleteManyCategories.fulfilled, (state, action: PayloadAction<string[]>) => {
      state.isDeletingMany = false;
      // Remove all deleted categories from the array
      state.categories = state.categories.filter(cat => !action.payload.includes(cat._id));
    })
    .addCase(deleteManyCategories.rejected, (state, action) => {
      state.isDeletingMany = false;
      state.error = action.payload || 'Failed to delete categories';
    });
  },
});

export const { clearError } = categoriesSlice.actions;
export default categoriesSlice.reducer;
