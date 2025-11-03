/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Star,
  Loader2,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchWishlist,
  removeProductFromWishlist,
  clearError,
} from "../../features/wishlist/wishlistSlice";
import { addProductToCart } from "../../features/cart/cartSlice";
import { toast } from "sonner";

const WishlistPage = () => {
  const dispatch = useAppDispatch();

  const { wishlistItems, numOfWishlistItems, loading, error, isRemoving } =
    useAppSelector((state) => state.wishlist);

  const { isAddingToCart } = useAppSelector((state) => state.cart);

  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  // Fetch wishlist on component mount
  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Handle remove from wishlist
  const handleRemove = async (productId: string) => {
    try {
      await dispatch(removeProductFromWishlist(productId)).unwrap();
      toast.success("Product removed from wishlist");
    } catch (err) {
      // Error handled by slice
    }
  };

  // Handle add to cart
  const handleAddToCart = async (
    productId: string,
    productName: string,
    colors?: string[]
  ) => {
    // If product has colors, use the first one as default
    const defaultColor = colors && colors.length > 0 ? colors[0] : "default";

    setAddingToCartId(productId);
    try {
      await dispatch(
        addProductToCart({
          productId,
          color: defaultColor,
        })
      ).unwrap();

      toast.success(`${productName} added to cart`);

      // Optionally remove from wishlist after adding to cart
      // await dispatch(removeProductFromWishlist(productId)).unwrap();
    } catch (err: any) {
      toast.error(err || "Failed to add to cart");
    } finally {
      setAddingToCartId(null);
    }
  };

  // Loading state
  if (loading && wishlistItems.length === 0) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  // Empty wishlist state
  if (wishlistItems.length === 0 && !loading) {
    return (
      <div className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold">Your wishlist is empty</h1>
            <p className="text-muted-foreground mt-2">
              Save your favorite items here to purchase them later.
            </p>
          </div>
          <Link to="/shop">
            <Button size="lg" className="mt-4">
              Start Shopping
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
          <h1 className="text-2xl md:text-3xl font-bold">My Wishlist</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {numOfWishlistItems} {numOfWishlistItems === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {wishlistItems.map((product) => {
          const discountPrice = product.priceAfterDiscount || product.price;
          const hasDiscount =
            product.priceAfterDiscount &&
            product.priceAfterDiscount < product.price;
          const discountPercentage = hasDiscount
            ? Math.round(
                ((product.price - product.priceAfterDiscount!) /
                  product.price) *
                  100
              )
            : 0;
          const inStock = product.quantity > 0;

          return (
            <Card
              key={product._id}
              className="group hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-3 md:p-4">
                {/* Product Image */}
                <div className="relative overflow-hidden rounded-lg mb-3">
                  <Link to={`/product/${product._id}`}>
                    <img
                      src={product.mainImage || "/placeholder.png"}
                      alt={product.name}
                      className="w-full h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.png";
                      }}
                    />
                  </Link>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {hasDiscount && (
                      <Badge className="bg-red-600 hover:bg-red-700 text-xs px-1.5 py-0.5">
                        -{discountPercentage}%
                      </Badge>
                    )}
                    {!inStock && (
                      <Badge className="bg-gray-600 hover:bg-gray-700 text-xs px-1.5 py-0.5">
                        Out of Stock
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 bg-white/90 hover:bg-white"
                      onClick={() => handleRemove(product._id)}
                      disabled={isRemoving}
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 bg-white/90 hover:bg-white"
                      asChild
                    >
                      <Link to={`/product/${product._id}`}>
                        <Eye className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  {/* Brand & Category */}
                  <div className="flex flex-wrap gap-1">
                    {product.brand?.name && (
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0.5"
                      >
                        {product.brand.name}
                      </Badge>
                    )}
                    {product.category?.name && (
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0.5"
                      >
                        {product.category.name}
                      </Badge>
                    )}
                  </div>

                  {/* Product Name */}
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-semibold text-sm md:text-base line-clamp-2 hover:underline leading-tight">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(product.rating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({product.ratingsQuantity || 0})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-base md:text-lg font-bold">
                      ${discountPrice.toFixed(2)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs md:text-sm text-muted-foreground line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Stock Status */}
                  <div className="text-xs">
                    {inStock ? (
                      <span className="text-green-600 font-medium">
                        In Stock ({product.quantity})
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    size="sm"
                    className="w-full text-xs md:text-sm"
                    disabled={
                      !inStock ||
                      addingToCartId === product._id ||
                      isAddingToCart
                    }
                    onClick={() =>
                      handleAddToCart(product._id, product.name, product.colors)
                    }
                  >
                    {addingToCartId === product._id ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-3 w-3 mr-2" />
                        {inStock ? "Add to Cart" : "Out of Stock"}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
