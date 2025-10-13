import axiosInstance from "../../utils/axiosInstance";

// Interface for signin request
export interface SignInData {
  email: string;
  password: string;
}

// Interface for signup request
export interface SignUpData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

// Interface for auth response (both signin and signup)
export interface AuthResponse {
  data: {
    _id: string;
    name: string;
    email: string;
    role: string;
    active: boolean;
    createdAt: string;
    updatedAt?: string;
  };
  token: string;
}

// Interface for forgot password request
export interface ForgotPasswordData {
  email: string;
}

// Interface for forgot password response
export interface ForgotPasswordResponse {
  status: string;
  message: string;
}

// Interface for verify reset code request
export interface VerifyResetCodeData {
  resetCode: string;
}

// Interface for verify reset code response
export interface VerifyResetCodeResponse {
  status: string;
}

// Interface for reset password request
export interface ResetPasswordData {
  email: string;
  newPassword: string;
}

// Interface for reset password response
export interface ResetPasswordResponse {
  token: string;
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

// Forgot password API call
export const forgotPasswordAPI = async (
  forgotPasswordData: ForgotPasswordData
): Promise<ForgotPasswordResponse> => {
  const response = await axiosInstance.post("/api/auth/forgotPassword", forgotPasswordData);
  return response.data;
};

// Verify reset code API call
export const verifyResetCodeAPI = async (
  verifyResetCodeData: VerifyResetCodeData
): Promise<VerifyResetCodeResponse> => {
  const response = await axiosInstance.post("/api/auth/verifyResetCode", verifyResetCodeData);
  return response.data;
};

// Reset password API call
export const resetPasswordAPI = async (
  resetPasswordData: ResetPasswordData
): Promise<ResetPasswordResponse> => {
  const response = await axiosInstance.put("/api/auth/resetPassword", resetPasswordData);
  return response.data;
};