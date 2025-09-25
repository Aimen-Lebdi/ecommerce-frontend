import axiosInstance from "../../utils/axiosInstance";

// Interface for signin request
export interface SignInData {
  email: string;
  password: string;
}

// Interface for signin response
export interface SignInResponse {
  data: {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt?: string;
  };
  token: string;
}

// Sign in API call
export const signInAPI = async (
  signInData: SignInData
): Promise<SignInResponse> => {
  const response = await axiosInstance.post("/api/auth/login", signInData);
  return response.data;
};

// Sign up API call (for future use)
export const signUpAPI = async (
  signUpData: FormData
): Promise<SignInResponse> => {
  const response = await axiosInstance.post("/api/auth/signup", signUpData);
  return response.data;
};

// Forgot password API call (for future use)
export const forgotPasswordAPI = async (email: string) => {
  const response = await axiosInstance.post("/api/auth/forgotPassword", {
    email,
  });
  return response.data;
};

// Verify reset code API call (for future use)
export const verifyResetCodeAPI = async (resetCode: string) => {
  const response = await axiosInstance.post("/api/auth/verifyResetCode", {
    resetCode,
  });
  return response.data;
};

// Reset password API call (for future use)
export const resetPasswordAPI = async (email: string, newPassword: string) => {
  const response = await axiosInstance.put("/api/auth/resetPassword", {
    email,
    newPassword,
  });
  return response.data;
};
