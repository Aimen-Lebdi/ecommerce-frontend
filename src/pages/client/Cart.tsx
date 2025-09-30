/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  Heart,
  ShoppingBag,
  Lock,
  Truck,
  ArrowLeft,
  Tag,
  Shield,
  CreditCard,
  Loader2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchCart,
  removeCartItem,
  updateCartItemQuantity,
  applyCoupon,
  clearError,
} from "../../features/cart/cartSlice";
import { addProductToWishlist } from "../../features/wishlist/wishlistSlice";
import { toast } from "sonner"; // ✅ Import directly from sonner

const Cart = () => {
  const dispatch = useAppDispatch();
  // const { toast } = Toaster()

  const {
    cartItems,
    numOfCartItems,
    totalCartPrice,
    totalPriceAfterDiscount,
    loading,
    error,
    isRemoving,
    isUpdating,
    appliedCoupon,
  } = useAppSelector((state) => state.cart);

  const [promoCode, setPromoCode] = useState("");
  const [shippingMethod, setShippingMethod] = useState("standard");

  // Fetch cart on component mount
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Calculate totals
  const subtotal = totalCartPrice;
  const promoDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const shippingCost =
    shippingMethod === "express" ? 15.99 : subtotal > 75 ? 0 : 9.99;
  const taxRate = 0.08; // 8% tax
  const taxAmount = (subtotal - promoDiscount) * taxRate;
  const total = subtotal - promoDiscount + shippingCost + taxAmount;

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await dispatch(
        updateCartItemQuantity({ itemId, quantity: newQuantity })
      ).unwrap();
      toast.success("Cart updated successfully");
    } catch (err) {
      // Error handled by slice
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await dispatch(removeCartItem(itemId)).unwrap();
      toast.success("Item removed from cart");
    } catch (err) {
      // Error handled by slice
    }
  };

  const moveToWishlist = async (
    itemId: string,
    productId: string,
    productName: string
  ) => {
    try {
      await dispatch(addProductToWishlist(productId)).unwrap();
      await dispatch(removeCartItem(itemId)).unwrap();
      toast.success(`${productName} moved to wishlist`);
    } catch (err: any) {
      toast.error(err || "Failed to move to wishlist");
    }
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error("Please enter a promo code");
      return;
    }

    try {
      await dispatch(applyCoupon(promoCode)).unwrap();
      toast.success("Coupon applied successfully");
      setPromoCode("");
    } catch (err) {
      // Error handled by slice
    }
  };

  // Loading state
  if (loading && cartItems.length === 0) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading cart...</p>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (cartItems.length === 0 && !loading) {
    return (
      <div className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold">Your cart is empty</h1>
            <p className="text-muted-foreground mt-2">
              Looks like you haven't added anything to your cart yet.
            </p>
          </div>
          <Link to="/shop">
            <Button size="lg" className="mt-4">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 md:py-10 px-4 md:px-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <Link
          to="/shop"
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {numOfCartItems} {numOfCartItems === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Cart Items - Left Column */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item._id}>
              <CardContent className="p-4 md:p-6">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link
                    to={`/product/${item.product._id}`}
                    className="flex-shrink-0"
                  >
                    <img
                      src={item.product.mainImage}
                      alt={item.product.name}
                      className="w-16 h-16 md:w-24 md:h-24 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.png";
                      }}
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 md:gap-4">
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.product._id}`}
                          className="font-medium text-sm md:text-base hover:underline line-clamp-2"
                        >
                          {item.product.name}
                        </Link>
                        {item.product.brand && (
                          <p className="text-xs md:text-sm text-muted-foreground mt-1">
                            {item.product.brand.name}
                          </p>
                        )}

                        {/* Color */}
                        {item.color && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {item.color}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="font-semibold text-sm md:text-base">
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item._id, item.quantity - 1)
                          }
                          disabled={isUpdating || item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-12 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item._id, item.quantity + 1)
                          }
                          disabled={isUpdating}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            moveToWishlist(
                              item._id,
                              item.product._id,
                              item.product.name
                            )
                          }
                          className="text-xs hidden md:flex"
                          disabled={isRemoving}
                        >
                          <Heart className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item._id)}
                          className="text-xs text-destructive hover:text-destructive"
                          disabled={isRemoving}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right mt-2">
                      <span className="text-sm font-semibold">
                        Subtotal: ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Promo Code Section */}
          <Card className="mt-6">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full"
                    disabled={loading}
                  />
                </div>
                <Button
                  onClick={applyPromoCode}
                  variant="outline"
                  disabled={loading || !promoCode.trim()}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Tag className="h-4 w-4 mr-2" />
                  )}
                  Apply
                </Button>
              </div>
              {totalPriceAfterDiscount && appliedCoupon && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">
                      Coupon applied: {appliedCoupon.code}
                    </span>
                    <span className="text-sm font-semibold text-green-800">
                      -${appliedCoupon.discount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary - Right Column */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              {totalPriceAfterDiscount && appliedCoupon && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-${appliedCoupon.discount.toFixed(2)}</span>
                </div>
              )}

              {/* Shipping Options */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Shipping</label>
                <Select
                  value={shippingMethod}
                  onValueChange={setShippingMethod}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">
                      Standard (5-7 days) - {subtotal > 75 ? "FREE" : "$9.99"}
                    </SelectItem>
                    <SelectItem value="express">
                      Express (2-3 days) - $15.99
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {/* Estimated Delivery */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                <Truck className="h-4 w-4" />
                <span>
                  Estimated delivery:{" "}
                  {shippingMethod === "express" ? "Dec 8-10" : "Dec 12-15"}
                </span>
              </div>

              {/* Checkout Button */}
              <Button size="lg" className="w-full mt-4">
                <Lock className="h-4 w-4 mr-2" />
                Secure Checkout
              </Button>

              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Trust & Security */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Secure 256-bit SSL encryption</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span>Multiple payment options</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-purple-600" />
                <span>Free returns within 30 days</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">We Accept</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {["Visa", "Mastercard", "PayPal", "Apple Pay"].map((method) => (
                  <Badge key={method} variant="outline" className="text-xs">
                    {method}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;
