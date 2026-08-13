import axiosInstance from "../../utils/axiosInstance";
import type { Address } from "../addresses/addressesAPI";
import type { Phone } from "../phones/phonesAPI";

// Interfaces
export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

// The authenticated user document shape returned by the API
// (also used by GET /api/users/getMe which returns the raw document)
export interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  phone?: string;
  addresses?: Address[];
  phones?: Phone[];
}

export interface AuthResponse {
  data: User;
  accessToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ForgotPasswordResponse {
  status: string;
  message: string;
}

export interface VerifyResetCodeData {
  resetCode: string;
}

export interface VerifyResetCodeResponse {
  status: string;
}

export interface ResetPasswordData {
  email: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  accessToken: string;
}

// Sign in API call
export const signInAPI = async (
  signInData: SignInData
): Promise<AuthResponse> => {
  const response = await axiosInstance.post("/api/auth/login", signInData);
  return response.data;
};

// Sign up API call
export const signUpAPI = async (
  signUpData: SignUpData
): Promise<AuthResponse> => {
  const response = await axiosInstance.post("/api/auth/signup", signUpData);
  return response.data;
};

// Refresh access token API call
export const refreshTokenAPI = async (): Promise<RefreshTokenResponse> => {
  const response = await axiosInstance.post("/api/auth/refresh");
  return response.data;
};

// Log out API call
export const logOutAPI = async (): Promise<{ status: string; message: string }> => {
  const response = await axiosInstance.post("/api/auth/logout");
  return response.data;
};

// Forgot password API call
export const forgotPasswordAPI = async (
  forgotPasswordData: ForgotPasswordData
): Promise<ForgotPasswordResponse> => {
  const response = await axiosInstance.post(
    "/api/auth/forgotPassword",
    forgotPasswordData
  );
  return response.data;
};

// Verify reset code API call
export const verifyResetCodeAPI = async (
  verifyResetCodeData: VerifyResetCodeData
): Promise<VerifyResetCodeResponse> => {
  const response = await axiosInstance.post(
    "/api/auth/verifyResetCode",
    verifyResetCodeData
  );
  return response.data;
};

// Reset password API call
export const resetPasswordAPI = async (
  resetPasswordData: ResetPasswordData
): Promise<ResetPasswordResponse> => {
  const response = await axiosInstance.put(
    "/api/auth/resetPassword",
    resetPasswordData
  );
  return response.data;
};

// Get current logged-in user API call
// NOTE: getOneUser returns the raw document (NOT wrapped in { data }),
// so we return response.data directly.
export const getCurrentUserAPI = async (): Promise<User> => {
  const response = await axiosInstance.get("/api/users/getMe");
  return response.data;
};