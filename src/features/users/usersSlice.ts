/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/users/usersSlice.ts
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  fetchUsersAPI,
  createUserAPI,
  updateUserAPI,
  deleteUserAPI,
  deleteManyUsersAPI,
  updateUserPasswordAPI,
  type UsersQueryParams,
  type UsersResponse,
} from "./usersAPI";

// Define the User type to match backend response
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  active: boolean;
  image?: string;
  createdAt: string;
  updatedAt?: string;
}

// Define interface for creating user
export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "user";
  image?: File;
}

// Define interface for updating user
export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: "admin" | "user";
  image?: File | null;
}

// Define interface for updating user password
export interface UpdateUserPasswordData {
  currentPassword: string;
  password: string;
  passwordConfirm: string;
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

// State interface for users slice
interface UsersState {
  users: User[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isDeletingMany: boolean;
  isUpdatingPassword: boolean;
  currentQueryParams: UsersQueryParams;
}

// Initial state
const initialState: UsersState = {
  users: [],
  pagination: null,
  loading: false,
  error: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isDeletingMany: false,
  isUpdatingPassword: false,
  currentQueryParams: {},
};

// Async thunk to fetch users from backend with query parameters
export const fetchUsers = createAsyncThunk<
  { users: User[]; pagination: PaginationMeta },
  UsersQueryParams,
  { rejectValue: { message: string; status?: number } }
>("users/fetchUsers", async (queryParams, { rejectWithValue }) => {
  try {
    const response: UsersResponse = await fetchUsersAPI(queryParams);

    return {
      users: response.documents,
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
        users: [],
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

// Async thunk to create user
export const createUser = createAsyncThunk<
  User,
  CreateUserData,
  { rejectValue: string; state: { users: UsersState } }
>(
  "users/createUser",
  async (userData, { rejectWithValue, getState, dispatch }) => {
    try {
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("email", userData.email);
      formData.append("password", userData.password);
      if (userData.role) {
        formData.append("role", userData.role);
      }
      if (userData.image) {
        formData.append("image", userData.image);
      }

      const data = await createUserAPI(formData);

      // Refetch users to maintain pagination integrity
      const state = getState();
      dispatch(fetchUsers(state.users.currentQueryParams));

      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk to update user
export const updateUser = createAsyncThunk<
  User,
  { id: string; userData: UpdateUserData },
  { rejectValue: string; state: { users: UsersState } }
>(
  "users/updateUser",
  async ({ id, userData }, { rejectWithValue, getState, dispatch }) => {
    try {
      const formData = new FormData();
      
      // Only append fields that are actually provided
      if (userData.name !== undefined) {
        formData.append("name", userData.name);
      }
      if (userData.email !== undefined) {
        formData.append("email", userData.email);
      }
      if (userData.role !== undefined) {
        formData.append("role", userData.role);
      }
      if (userData.image !== undefined) {
        if (userData.image === null) {
          // Send empty string or a flag to indicate image removal
          formData.append("image", "null");
        } else {
          formData.append("image", userData.image);
        }
      }

      const data = await updateUserAPI(id, formData);

      // Refetch to maintain consistency with server-side data
      const state = getState();
      dispatch(fetchUsers(state.users.currentQueryParams));

      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk to update user password
export const updateUserPassword = createAsyncThunk<
  User,
  { id: string; passwordData: UpdateUserPasswordData },
  { rejectValue: string }
>(
  "users/updateUserPassword",
  async ({ id, passwordData }, { rejectWithValue }) => {
    try {
      const data = await updateUserPasswordAPI(id, passwordData);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk to delete user
export const deleteUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: { users: UsersState } }
>(
  "users/deleteUser",
  async (id, { rejectWithValue, getState, dispatch }) => {
    try {
      await deleteUserAPI(id);

      // Refetch users to maintain pagination integrity
      const state = getState();
      dispatch(fetchUsers(state.users.currentQueryParams));

      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk for bulk delete
export const deleteManyUsers = createAsyncThunk<
  string[],
  string[],
  { rejectValue: string; state: { users: UsersState } }
>(
  "users/deleteManyUsers",
  async (ids, { rejectWithValue, getState, dispatch }) => {
    try {
      await deleteManyUsersAPI(ids);

      // Refetch users to maintain pagination integrity
      const state = getState();
      dispatch(fetchUsers(state.users.currentQueryParams));

      return ids;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Slice with reducers and state management
const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Action to update current query parameters
    setQueryParams: (state, action: PayloadAction<UsersQueryParams>) => {
      state.currentQueryParams = action.payload;
    },
    // Action to reset query parameters
    resetQueryParams: (state) => {
      state.currentQueryParams = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        // Store the query parameters used for this fetch
        state.currentQueryParams = action.meta.arg;
      })
      .addCase(
        fetchUsers.fulfilled,
        (
          state,
          action: PayloadAction<{
            users: User[];
            pagination: PaginationMeta;
          }>
        ) => {
          state.loading = false;
          state.users = action.payload.users;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "An error occurred";
      })
      // Create user
      .addCase(createUser.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.isCreating = false;
        // Don't modify users array here since we refetch
      })
      .addCase(createUser.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || "Failed to create user";
      })
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.isUpdating = false;
        // Don't modify users array here since we refetch
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || "Failed to update user";
      })
      // Update user password
      .addCase(updateUserPassword.pending, (state) => {
        state.isUpdatingPassword = true;
        state.error = null;
      })
      .addCase(updateUserPassword.fulfilled, (state) => {
        state.isUpdatingPassword = false;
      })
      .addCase(updateUserPassword.rejected, (state, action) => {
        state.isUpdatingPassword = false;
        state.error = action.payload || "Failed to update password";
      })
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.isDeleting = false;
        // Don't modify users array here since we refetch
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload || "Failed to delete user";
      })
      // Bulk delete users
      .addCase(deleteManyUsers.pending, (state) => {
        state.isDeletingMany = true;
        state.error = null;
      })
      .addCase(deleteManyUsers.fulfilled, (state) => {
        state.isDeletingMany = false;
        // Don't modify users array here since we refetch
      })
      .addCase(deleteManyUsers.rejected, (state, action) => {
        state.isDeletingMany = false;
        state.error = action.payload || "Failed to delete users";
      });
  },
});

export const { clearError, setQueryParams, resetQueryParams } =
  usersSlice.actions;
export default usersSlice.reducer;