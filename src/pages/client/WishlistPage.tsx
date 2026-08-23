import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Trash2,
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
import { useTranslation } from "react-i18next";
import { getErrorMessage } from "../../utils/errorMessage";

const WishlistPage = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { wishlistItems, numOfWishlistItems, loading, error, isRemoving } =
    useAppSelector((state) => state.wishlist);

  const { isAddingToCart } = useAppSelector((state) => state.cart);

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  // Fetch wishlist on component mount (only if authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

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
      toast.success(t("myAccount.removedFromWishlist"));
    } catch {
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

      toast.success(t("myAccount.addedToCart", { productName }));

      // Optionally remove from wishlist after adding to cart
      // await dispatch(removeProductFromWishlist(productId)).unwrap();
    } catch (err) {
      toast.error(getErrorMessage(err, t("myAccount.addToCartFailed")));
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
            <h1 className="text-2xl font-bold">{t("wishlist.empty")}</h1>
            <p className="text-muted-foreground mt-2">
              {t("wishlist.emptyDescription")}
            </p>
          </div>
          <Link to="/shop">
            <Button size="lg" className="mt-4">
              {t("wishlist.startShopping")}
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
          aria-label={t("wishlist.backToShop")}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t("wishlist.title")}</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {t("wishlist.itemCount", { count: numOfWishlistItems })}
          </p>
        </div>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {wishlistItems.map((product) => {
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
                      loading="lazy"
                      decoding="async"
                      className="w-full h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.png";
                      }}
                    />
                  </Link>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {!inStock && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        {t("wishlist.outOfStock")}
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-11 w-11 bg-background/90 hover:bg-background"
                      aria-label={t("wishlist.removeProduct", {
                        productName: product.name,
                      })}
                      onClick={() => handleRemove(product._id)}
                      disabled={isRemoving}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-11 w-11 bg-background/90 hover:bg-background"
                      aria-label={t("wishlist.viewProduct", {
                        productName: product.name,
                      })}
                      asChild
                    >
                      <Link to={`/product/${product._id}`}>
                        <Eye className="h-4 w-4" />
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

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-base md:text-lg font-bold">
                      {product.price.toFixed(2)} DZD
                    </span>
                  </div>

                  {/* Stock Status */}
                  <div className="text-xs">
                    {inStock ? (
                      <span className="text-success font-medium">
                        {t("wishlist.inStock", { quantity: product.quantity })}
                      </span>
                    ) : (
                      <span className="text-destructive font-medium">
                        {t("wishlist.outOfStock")}
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
                        {t("wishlist.adding")}
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-3 w-3 mr-2" />
                        {inStock ? t("wishlist.addToCart") : t("wishlist.outOfStock")}
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
