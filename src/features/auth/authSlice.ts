/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { signInAPI, type SignInData, type SignInResponse } from "./authAPI";

// Define the User type
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
}

// State interface for auth slice
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isSigningIn: boolean;
}

// Get initial state from localStorage if available
const getInitialState = (): AuthState => {
  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      return {
        user: JSON.parse(user),
        token,
        isAuthenticated: true,
        loading: false,
        error: null,
        isSigningIn: false,
      };
    }
  } catch (error) {
    // If there's an error parsing stored data, clear it
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    isSigningIn: false,
  };
};

// Initial state
const initialState: AuthState = getInitialState();

// Async thunk to sign in user
export const signIn = createAsyncThunk<
  SignInResponse,
  SignInData,
  { rejectValue: string }
>("auth/signIn", async (signInData, { rejectWithValue }) => {
  try {
    const response = await signInAPI(signInData);

    // Store in localStorage
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.data));

    return response;
  } catch (err: any) {
    const message =
      err.response?.data?.message || err.message || "Sign in failed";
    return rejectWithValue(message);
  }
});

// Slice with reducers and state management
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Action to sign out user
    signOut: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    // Action to set auth data (useful for token refresh or initialization)
    setAuthData: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      // Update localStorage
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign in
      .addCase(signIn.pending, (state) => {
        state.isSigningIn = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        signIn.fulfilled,
        (state, action: PayloadAction<SignInResponse>) => {
          state.isSigningIn = false;
          state.loading = false;
          state.user = action.payload.data;
          state.token = action.payload.token;
          state.isAuthenticated = true;
          state.error = null;
        }
      )
      .addCase(signIn.rejected, (state, action) => {
        state.isSigningIn = false;
        state.loading = false;
        state.error = action.payload || "Sign in failed";
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError, signOut, setAuthData } = authSlice.actions;
export default authSlice.reducer;
