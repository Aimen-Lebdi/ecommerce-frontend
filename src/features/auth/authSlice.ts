/* eslint-disable @typescript-eslint/no-unused-vars */
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
  type SignInData,
  type SignUpData,
  type ForgotPasswordData,
  type VerifyResetCodeData,
  type ResetPasswordData,
  type AuthResponse,
  type ForgotPasswordResponse,
  type VerifyResetCodeResponse,
  type ResetPasswordResponse,
} from "./authAPI";

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
  isSigningUp: boolean;
  isForgotPassword: boolean;
  isVerifyingResetCode: boolean;
  isResettingPassword: boolean;
  tokenExpired: boolean;
  forgotPasswordSuccess: boolean;
  verifyResetCodeSuccess: boolean;
  resetPasswordSuccess: boolean;
  resetEmail: string | null; // Store email for password reset flow
}

// Function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  if (!token) return true;

  try {
    // Decode JWT payload (assuming it's a JWT token)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;

    // Check if token is expired
    return payload.exp < currentTime;
  } catch (error) {
    // If we can't decode the token, consider it expired
    return true;
  }
};

// Function to clear auth data from localStorage
const clearAuthStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// Get initial state from localStorage if available
const getInitialState = (): AuthState => {
  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        // Token is expired, clear storage and return unauthenticated state
        clearAuthStorage();
        return {
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: "Session expired. Please sign in again.",
          isSigningIn: false,
          isSigningUp: false,
          isForgotPassword: false,
          isVerifyingResetCode: false,
          isResettingPassword: false,
          tokenExpired: true,
          forgotPasswordSuccess: false,
          verifyResetCodeSuccess: false,
          resetPasswordSuccess: false,
          resetEmail: null,
        };
      }

      // Token is valid, return authenticated state
      return {
        user: JSON.parse(user),
        token,
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
      };
    }
  } catch (error) {
    // If there's an error parsing stored data, clear it
    clearAuthStorage();
  }

  return {
    user: null,
    token: null,
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
  };
};

// Initial state
const initialState: AuthState = getInitialState();

// Async thunk to verify token validity
export const verifyToken = createAsyncThunk<
  { user: User; token: string },
  void,
  { rejectValue: string }
>("auth/verifyToken", async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      throw new Error("No token or user found");
    }

    if (isTokenExpired(token)) {
      clearAuthStorage();
      throw new Error("Token expired");
    }

    // Optional: You can also make an API call to verify token with backend
    // const response = await verifyTokenAPI(token);

    return {
      user: JSON.parse(user),
      token,
    };
  } catch (error: any) {
    clearAuthStorage();
    return rejectWithValue("Session expired. Please sign in again.");
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

// Async thunk to sign up user
export const signUp = createAsyncThunk<
  AuthResponse,
  SignUpData,
  { rejectValue: string }
>("auth/signUp", async (signUpData, { rejectWithValue }) => {
  try {
    const response = await signUpAPI(signUpData);

    // Store in localStorage
    localStorage.setItem("token", response.token);
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

    // Store the new token in localStorage (user is automatically signed in after password reset)
    localStorage.setItem("token", response.token);

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

// Slice with reducers and state management
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.tokenExpired = false;
    },
    // Action to sign out user
    signOut: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.tokenExpired = false;
      state.forgotPasswordSuccess = false;
      state.verifyResetCodeSuccess = false;
      state.resetPasswordSuccess = false;
      state.resetEmail = null;

      // Clear localStorage
      clearAuthStorage();
    },
    // Action to handle token expiration
    handleTokenExpiration: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = "Session expired. Please sign in again.";
      state.tokenExpired = true;
      state.loading = false;
      state.isSigningIn = false;
      state.isSigningUp = false;
      state.isForgotPassword = false;
      state.isVerifyingResetCode = false;
      state.isResettingPassword = false;

      // Clear localStorage
      clearAuthStorage();
    },
    // Action to set auth data (useful for token refresh or initialization)
    setAuthData: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.tokenExpired = false;

      // Update localStorage
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    // Action to clear password reset states
    clearPasswordResetState: (state) => {
      state.forgotPasswordSuccess = false;
      state.verifyResetCodeSuccess = false;
      state.resetPasswordSuccess = false;
      state.resetEmail = null;
      state.error = null;
    },
    // Action to set reset email (for password reset flow)
    setResetEmail: (state, action: PayloadAction<string>) => {
      state.resetEmail = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
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
          state.token = action.payload.token;
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
        state.token = null;
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
          state.token = action.payload.token;
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
        state.token = null;
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
          state.token = action.payload.token;
          // Note: User data should be fetched separately or included in the response
        }
      )
      .addCase(resetPassword.rejected, (state, action) => {
        state.isResettingPassword = false;
        state.resetPasswordSuccess = false;
        state.error = action.payload || "Failed to reset password";
      })
      // Verify token
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyToken.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        state.tokenExpired = false;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = action.payload || "Session expired";
        state.tokenExpired = true;
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
