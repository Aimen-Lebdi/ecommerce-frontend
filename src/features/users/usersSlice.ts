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
  updateUserPasswordAPI,
  type UsersQueryParams,
  type UsersResponse,
  updateLoggedUserPasswordAPI,
  updateLoggedUserDataAPI,
  banUserAPI,
  banManyUsersAPI,
  unbanUserAPI,
  unbanManyUsersAPI,
  type UpdateLoggedUserData,
} from "./usersAPI";

// Shared types from central definitions
import type {
  User,
  CreateUserData,
  UpdateUserData,
  UpdateUserPasswordData,
  PaginationMeta,
  UserRole,
} from "@/types";

// Inline type for logged user password update (matches API signature)
type UpdateLoggedUserPasswordData = {
  currentPassword: string;
  password: string;
  passwordConfirm: string;
};

// Re-export for backward compatibility
export type {
  User,
  CreateUserData,
  UpdateUserData,
  UpdateUserPasswordData,
  UpdateLoggedUserData,
  UpdateLoggedUserPasswordData,
  PaginationMeta,
  UserRole,
};

// State interface for users slice
interface UsersState {
  users: User[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  isCreating: boolean;
  isUpdating: boolean;
  isBanning: boolean;
  isUnbanning: boolean;
  isBulkBanning: boolean;
  isBulkUnbanning: boolean;
  isUpdatingPassword: boolean;
  currentQueryParams: UsersQueryParams;
  isUpdatingLoggedUser: boolean;
  isUpdatingLoggedPassword: boolean;
}

// Initial state
const initialState: UsersState = {
  users: [],
  pagination: null,
  loading: false,
  error: null,
  isCreating: false,
  isUpdating: false,
  isBanning: false,
  isUnbanning: false,
  isBulkBanning: false,
  isBulkUnbanning: false,
  isUpdatingPassword: false,
  currentQueryParams: {},
  isUpdatingLoggedUser: false,
isUpdatingLoggedPassword: false,

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

// Async thunk to ban single user
export const banUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: { users: UsersState } }
>(
  "users/banUser",
  async (id, { rejectWithValue, getState, dispatch }) => {
    try {
      await banUserAPI(id);

      const state = getState();
      dispatch(fetchUsers(state.users.currentQueryParams));

      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Define return types for bulk operations
export interface BulkBanResult {
  bannedCount: number;
  skippedUsers: Array<{ id: string; name: string; reason: string }>;
}

export interface BulkUnbanResult {
  unbannedCount: number;
  skippedUsers: Array<{ id: string; name: string; reason: string }>;
}

// Async thunk for bulk ban
export const banManyUsers = createAsyncThunk<
  BulkBanResult,
  string[],
  { rejectValue: string; state: { users: UsersState } }
>(
  "users/banManyUsers",
  async (ids, { rejectWithValue, getState, dispatch }) => {
    try {
      const response = await banManyUsersAPI(ids);

      const state = getState();
      dispatch(fetchUsers(state.users.currentQueryParams));

      return {
        bannedCount: response.data.bannedCount,
        skippedUsers: response.data.skippedUsers,
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk to unban single user
export const unbanUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: { users: UsersState } }
>(
  "users/unbanUser",
  async (id, { rejectWithValue, getState, dispatch }) => {
    try {
      await unbanUserAPI(id);

      const state = getState();
      dispatch(fetchUsers(state.users.currentQueryParams));

      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk for bulk unban
export const unbanManyUsers = createAsyncThunk<
  BulkUnbanResult,
  string[],
  { rejectValue: string; state: { users: UsersState } }
>(
  "users/unbanManyUsers",
  async (ids, { rejectWithValue, getState, dispatch }) => {
    try {
      const response = await unbanManyUsersAPI(ids);

      const state = getState();
      dispatch(fetchUsers(state.users.currentQueryParams));

      return {
        unbannedCount: response.data.unbannedCount,
        skippedUsers: response.data.skippedUsers,
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Add these thunks
export const updateLoggedUserData = createAsyncThunk<
  User,
  UpdateLoggedUserData,
  { rejectValue: string }
>(
  "users/updateLoggedUserData",
  async (userData, { rejectWithValue }) => {
    try {
      const data = await updateLoggedUserDataAPI(userData);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateLoggedUserPassword = createAsyncThunk<
  { user: User; token: string },
  UpdateLoggedUserPasswordData,
  { rejectValue: string }
>(
  "users/updateLoggedUserPassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      const data = await updateLoggedUserPasswordAPI(passwordData);
      return data;
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
        state.users = [];
        state.pagination = null;
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
      // Ban user
      .addCase(banUser.pending, (state) => {
        state.isBanning = true;
        state.error = null;
      })
      .addCase(banUser.fulfilled, (state) => {
        state.isBanning = false;
        // Don't modify users array here since we refetch
      })
      .addCase(banUser.rejected, (state, action) => {
        state.isBanning = false;
        state.error = action.payload || "Failed to ban user";
      })
      // Bulk ban users
      .addCase(banManyUsers.pending, (state) => {
        state.isBulkBanning = true;
        state.error = null;
      })
      .addCase(banManyUsers.fulfilled, (state) => {
        state.isBulkBanning = false;
        // Don't modify users array here since we refetch
      })
      .addCase(banManyUsers.rejected, (state, action) => {
        state.isBulkBanning = false;
        state.error = action.payload || "Failed to ban users";
      })
      // Unban user
      .addCase(unbanUser.pending, (state) => {
        state.isUnbanning = true;
        state.error = null;
      })
      .addCase(unbanUser.fulfilled, (state) => {
        state.isUnbanning = false;
        // Don't modify users array here since we refetch
      })
      .addCase(unbanUser.rejected, (state, action) => {
        state.isUnbanning = false;
        state.error = action.payload || "Failed to unban user";
      })
      // Bulk unban users
      .addCase(unbanManyUsers.pending, (state) => {
        state.isBulkUnbanning = true;
        state.error = null;
      })
      .addCase(unbanManyUsers.fulfilled, (state) => {
        state.isBulkUnbanning = false;
        // Don't modify users array here since we refetch
      })
      .addCase(unbanManyUsers.rejected, (state, action) => {
        state.isBulkUnbanning = false;
        state.error = action.payload || "Failed to unban users";
      })
      // Add these to extraReducers
.addCase(updateLoggedUserData.pending, (state) => {
  state.isUpdatingLoggedUser = true;
  state.error = null;
})
.addCase(updateLoggedUserData.fulfilled, (state) => {
  state.isUpdatingLoggedUser = false;
})
.addCase(updateLoggedUserData.rejected, (state, action) => {
  state.isUpdatingLoggedUser = false;
  state.error = action.payload || "Failed to update profile";
})
.addCase(updateLoggedUserPassword.pending, (state) => {
  state.isUpdatingLoggedPassword = true;
  state.error = null;
})
.addCase(updateLoggedUserPassword.fulfilled, (state) => {
  state.isUpdatingLoggedPassword = false;
})
.addCase(updateLoggedUserPassword.rejected, (state, action) => {
  state.isUpdatingLoggedPassword = false;
  state.error = action.payload || "Failed to update password";
});
  },
});

export const { clearError, setQueryParams, resetQueryParams } =
  usersSlice.actions;
export default usersSlice.reducer;