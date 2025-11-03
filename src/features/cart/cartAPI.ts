import axiosInstance from "../../utils/axiosInstance";

// Interface for cart item
export interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    mainImage: string;
    brand?: { name: string };
  };
  quantity: number;
  color: string;
  price: number;
}

// Interface for cart response
export interface CartResponse {
  status: string;
  numOfCartItems: number;
  data: {
    _id: string;
    cartItems: CartItem[];
    totalCartPrice: number;
    totalPriceAfterDiscount?: number;
    user: string;
    createdAt: string;
    updatedAt: string;
  };
  message?: string;
}

// Add product to cart
export const addProductToCartAPI = async (productData: {
  productId: string;
  color: string;
}) => {
  const response = await axiosInstance.post("/api/cart", productData);
  return response.data;
};

// Get logged user cart
export const getLoggedUserCartAPI = async (): Promise<CartResponse> => {
  const response = await axiosInstance.get("/api/cart");
  return response.data;
};

// Remove specific cart item
export const removeCartItemAPI = async (itemId: string) => {
  const response = await axiosInstance.delete(`/api/cart/${itemId}`);
  return response.data;
};

// Clear cart
export const clearCartAPI = async () => {
  const response = await axiosInstance.delete("/api/cart");
  return response.data;
};

// Update cart item quantity
export const updateCartItemQuantityAPI = async (
  itemId: string,
  quantity: number
) => {
  const response = await axiosInstance.put(`/api/cart/${itemId}`, {
    quantity,
  });
  return response.data;
};

// Apply coupon
export const applyCouponAPI = async (couponCode: string) => {
  const response = await axiosInstance.put("/api/cart/applyCoupon", {
    coupon: couponCode,
  });
  return response.data;
};
