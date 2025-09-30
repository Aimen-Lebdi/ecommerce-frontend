import axiosInstance from "../../utils/axiosInstance";

// Interface for wishlist product
export interface WishlistProduct {
  _id: string;
  name: string;
  mainImage: string;
  price: number;
  priceAfterDiscount?: number;
  quantity: number;
  brand?: { name: string };
  category?: { name: string };
  rating?: number;
  ratingsQuantity?: number;
  colors?: string[];
}

// Interface for wishlist response
export interface WishlistResponse {
  status: string;
  results: number;
  data: WishlistProduct[];
  message?: string;
}

// Add product to wishlist
export const addProductToWishlistAPI = async (productId: string) => {
  const response = await axiosInstance.post("/api/wishlist", { productId });
  return response.data;
};

// Get logged user wishlist
export const getLoggedUserWishlistAPI = async (): Promise<WishlistResponse> => {
  const response = await axiosInstance.get("/api/wishlist");
  return response.data;
};

// Remove product from wishlist
export const removeProductFromWishlistAPI = async (productId: string) => {
  const response = await axiosInstance.delete(`/api/wishlist/${productId}`);
  return response.data;
};
