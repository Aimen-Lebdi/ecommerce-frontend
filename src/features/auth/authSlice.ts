/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  signInAPI,
  signUpAPI,
  forgotPasswordAPI,
  verifyResetCodeAPI,
  resetPasswordAPI,
  refreshTokenAPI,
  logOutAPI,
  type SignInData,
  type SignUpData,
  type ForgotPasswordData,
  type VerifyResetCodeData,
  type ResetPasswordData,
  type AuthResponse,
  type RefreshTokenResponse,
  type ForgotPasswordResponse,
  type VerifyResetCodeResponse,
  type ResetPasswordResponse,
} from "./authAPI";

// Define the User type
export interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

// State interface for auth slice
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isSigningIn: boolean;
  isSigningUp: boolean;
  isForgotPassword: boolean;
  isVerifyingResetCode: boolean;
  isResettingPassword: boolean;
  tokenExpired: boolean;
  forgotPasswordSuccess: boolean;
  verifyResetCodeSuccess: boolean;
  resetPasswordSuccess: boolean;
  resetEmail: string | null;
  isRefreshing: boolean;
}

// Function to clear auth data
const clearAuthStorage = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

// Get initial state from localStorage
const getInitialState = (): AuthState => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const user = localStorage.getItem("user");

    if (accessToken && refreshToken && user) {
      return {
        user: JSON.parse(user),
        accessToken,
        refreshToken,
        isAuthenticated: true,
        loading: false,
        error: null,
        isSigningIn: false,
        isSigningUp: false,
        isForgotPassword: false,
        isVerifyingResetCode: false,
        isResettingPassword: false,
        tokenExpired: false,
        forgotPasswordSuccess: false,
        verifyResetCodeSuccess: false,
        resetPasswordSuccess: false,
        resetEmail: null,
        isRefreshing: false,
      };
    }
  } catch (error) {
    clearAuthStorage();
  }

  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    isSigningIn: false,
    isSigningUp: false,
    isForgotPassword: false,
    isVerifyingResetCode: false,
    isResettingPassword: false,
    tokenExpired: false,
    forgotPasswordSuccess: false,
    verifyResetCodeSuccess: false,
    resetPasswordSuccess: false,
    resetEmail: null,
    isRefreshing: false,
  };
};

// Initial state
const initialState: AuthState = getInitialState();

// NEW: Async thunk to sync auth state with localStorage
export const syncAuthState = createAsyncThunk(
  'auth/syncState',
  async (_, { rejectWithValue }) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const userStr = localStorage.getItem("user");
      
      if (accessToken && refreshToken && userStr) {
        const user = JSON.parse(userStr);
        return {
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          tokenExpired: false
        };
      }
      
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        tokenExpired: false
      };
    } catch (error: any) {
      return rejectWithValue("Failed to sync auth state");
    }
  }
);

// Async thunk to refresh token
export const refreshToken = createAsyncThunk<
  RefreshTokenResponse,
  void,
  { rejectValue: string }
>("auth/refreshToken", async (_, { rejectWithValue }) => {
  try {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken) {
      throw new Error("No refresh token found");
    }

    const response = await refreshTokenAPI(storedRefreshToken);
    return response;
  } catch (error: any) {
    clearAuthStorage();
    return rejectWithValue("Failed to refresh token");
  }
});

// Async thunk to sign in user
export const signIn = createAsyncThunk<
  AuthResponse,
  SignInData,
  { rejectValue: string }
>("auth/signIn", async (signInData, { rejectWithValue }) => {
  try {
    const response = await signInAPI(signInData);

    // Store tokens and user
    localStorage.setItem("accessToken", response.accessToken);
    localStorage.setItem("refreshToken", response.refreshToken);
    localStorage.setItem("user", JSON.stringify(response.data));

    return response;
  } catch (err: any) {
    const message =
      err.response?.data?.message || err.message || "Sign in failed";
    return rejectWithValue(message);
  }
});

// Async thunk to sign up user
export const signUp = createAsyncThunk<
  AuthResponse,
  SignUpData,
  { rejectValue: string }
>("auth/signUp", async (signUpData, { rejectWithValue }) => {
  try {
    const response = await signUpAPI(signUpData);

    // Store tokens and user
    localStorage.setItem("accessToken", response.accessToken);
    localStorage.setItem("refreshToken", response.refreshToken);
    localStorage.setItem("user", JSON.stringify(response.data));

    return response;
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      err.response?.data?.errors?.[0]?.msg ||
      err.message ||
      "Sign up failed";
    return rejectWithValue(message);
  }
});

// Async thunk for forgot password
export const forgotPassword = createAsyncThunk<
  ForgotPasswordResponse,
  ForgotPasswordData,
  { rejectValue: string }
>("auth/forgotPassword", async (forgotPasswordData, { rejectWithValue }) => {
  try {
    const response = await forgotPasswordAPI(forgotPasswordData);
    return response;
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      err.response?.data?.errors?.[0]?.msg ||
      err.message ||
      "Failed to send reset code";
    return rejectWithValue(message);
  }
});

// Async thunk for verify reset code
export const verifyResetCode = createAsyncThunk<
  VerifyResetCodeResponse,
  VerifyResetCodeData,
  { rejectValue: string }
>("auth/verifyResetCode", async (verifyResetCodeData, { rejectWithValue }) => {
  try {
    const response = await verifyResetCodeAPI(verifyResetCodeData);
    return response;
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      err.response?.data?.errors?.[0]?.msg ||
      err.message ||
      "Invalid or expired reset code";
    return rejectWithValue(message);
  }
});

// Async thunk for reset password
export const resetPassword = createAsyncThunk<
  ResetPasswordResponse,
  ResetPasswordData,
  { rejectValue: string }
>("auth/resetPassword", async (resetPasswordData, { rejectWithValue }) => {
  try {
    const response = await resetPasswordAPI(resetPasswordData);

    // Store new tokens after password reset
    localStorage.setItem("accessToken", response.accessToken);
    localStorage.setItem("refreshToken", response.refreshToken);

    return response;
  } catch (err: any) {
    const message =
      err.response?.data?.message ||
      err.response?.data?.errors?.[0]?.msg ||
      err.message ||
      "Failed to reset password";
    return rejectWithValue(message);
  }
});

// Async thunk for log out
export const logOut = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("auth/logOut", async (_, { rejectWithValue }) => {
  try {
    await logOutAPI();
  } catch (err: any) {
    const message = err.response?.data?.message || "Log out failed";
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
      state.tokenExpired = false;
    },
    signOut: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.tokenExpired = false;
      state.forgotPasswordSuccess = false;
      state.verifyResetCodeSuccess = false;
      state.resetPasswordSuccess = false;
      state.resetEmail = null;

      clearAuthStorage();
    },
    handleTokenExpiration: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = "Session expired. Please sign in again.";
      state.tokenExpired = true;
      state.loading = false;
      state.isSigningIn = false;
      state.isSigningUp = false;

      clearAuthStorage();
    },
    setAuthData: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.tokenExpired = false;

      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    clearPasswordResetState: (state) => {
      state.forgotPasswordSuccess = false;
      state.verifyResetCodeSuccess = false;
      state.resetPasswordSuccess = false;
      state.resetEmail = null;
      state.error = null;
    },
    setResetEmail: (state, action: PayloadAction<string>) => {
      state.resetEmail = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // NEW: Sync auth state
      .addCase(syncAuthState.pending, (state) => {
        state.loading = true;
      })
      .addCase(syncAuthState.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.tokenExpired = action.payload.tokenExpired;
      })
      .addCase(syncAuthState.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      })
      // Sign in
      .addCase(signIn.pending, (state) => {
        state.isSigningIn = true;
        state.loading = true;
        state.error = null;
        state.tokenExpired = false;
      })
      .addCase(
        signIn.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.isSigningIn = false;
          state.loading = false;
          state.user = action.payload.data;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
          state.error = null;
          state.tokenExpired = false;
        }
      )
      .addCase(signIn.rejected, (state, action) => {
        state.isSigningIn = false;
        state.loading = false;
        state.error = action.payload || "Sign in failed";
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.tokenExpired = false;
      })
      // Sign up
      .addCase(signUp.pending, (state) => {
        state.isSigningUp = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(
        signUp.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.isSigningUp = false;
          state.loading = false;
          state.user = action.payload.data;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
          state.error = null;
          state.tokenExpired = false;
        }
      )
      .addCase(signUp.rejected, (state, action) => {
        state.isSigningUp = false;
        state.loading = false;
        state.error = action.payload || "Sign up failed";
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      })
      // Refresh token
      .addCase(refreshToken.pending, (state) => {
        state.isRefreshing = true;
        state.error = null; // Clear any previous errors
      })
      .addCase(
        refreshToken.fulfilled,
        (state, action: PayloadAction<RefreshTokenResponse>) => {
          state.isRefreshing = false;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.tokenExpired = false;
          state.isAuthenticated = true; // IMPORTANT: Set authenticated to true
          state.error = null;

          localStorage.setItem("accessToken", action.payload.accessToken);
          localStorage.setItem("refreshToken", action.payload.refreshToken);
          
          console.log('Tokens refreshed successfully');
        }
      )
      .addCase(refreshToken.rejected, (state, action) => {
        state.isRefreshing = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = action.payload || "Failed to refresh token";
        state.tokenExpired = true;

        clearAuthStorage();
        
        console.log('Token refresh rejected');
      })
      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.isForgotPassword = true;
        state.error = null;
        state.forgotPasswordSuccess = false;
      })
      .addCase(
        forgotPassword.fulfilled,
        (state, _action: PayloadAction<ForgotPasswordResponse>) => {
          state.isForgotPassword = false;
          state.forgotPasswordSuccess = true;
          state.error = null;
        }
      )
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isForgotPassword = false;
        state.forgotPasswordSuccess = false;
        state.error = action.payload || "Failed to send reset code";
      })
      // Verify reset code
      .addCase(verifyResetCode.pending, (state) => {
        state.isVerifyingResetCode = true;
        state.error = null;
        state.verifyResetCodeSuccess = false;
      })
      .addCase(
        verifyResetCode.fulfilled,
        (state, _action: PayloadAction<VerifyResetCodeResponse>) => {
          state.isVerifyingResetCode = false;
          state.verifyResetCodeSuccess = true;
          state.error = null;
        }
      )
      .addCase(verifyResetCode.rejected, (state, action) => {
        state.isVerifyingResetCode = false;
        state.verifyResetCodeSuccess = false;
        state.error = action.payload || "Invalid or expired reset code";
      })
      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.isResettingPassword = true;
        state.error = null;
        state.resetPasswordSuccess = false;
      })
      .addCase(
        resetPassword.fulfilled,
        (state, action: PayloadAction<ResetPasswordResponse>) => {
          state.isResettingPassword = false;
          state.resetPasswordSuccess = true;
          state.error = null;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
        }
      )
      .addCase(resetPassword.rejected, (state, action) => {
        state.isResettingPassword = false;
        state.resetPasswordSuccess = false;
        state.error = action.payload || "Failed to reset password";
      })
      // Log out
      .addCase(logOut.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
        state.tokenExpired = false;
        state.forgotPasswordSuccess = false;
        state.verifyResetCodeSuccess = false;
        state.resetPasswordSuccess = false;
        state.resetEmail = null;

        clearAuthStorage();
      });
  },
});

export const {
  clearError,
  signOut,
  setAuthData,
  handleTokenExpiration,
  clearPasswordResetState,
  setResetEmail,
} = authSlice.actions;

export default authSlice.reducer;