/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import {
  Star,
  ShoppingCart,
  Heart,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchProductById,
  clearCurrentProduct,
  fetchProducts,
} from "../../features/products/productsSlice";
import { addProductToCart } from "../../features/cart/cartSlice";
import { addProductToWishlist } from "../../features/wishlist/wishlistSlice";
import { toast } from "sonner";

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const {
    currentProduct: product,
    loadingProduct,
    productError,
    products,
  } = useAppSelector((state) => state.products);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Fetch product on component mount
  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [id, dispatch]);

  // Fetch related products (from same category)
  useEffect(() => {
    if (product?.category?._id) {
      dispatch(
        fetchProducts({
          limit: 4,
          category: product.category._id,
        })
      );
    }
  }, [product?.category?._id, dispatch]);

  // Reset selected image when product changes
  useEffect(() => {
    setSelectedImageIndex(0);
    setSelectedColor(null);
  }, [product?._id]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product || !selectedColor) return;
    setIsAddingToCart(true);

    try {
      await dispatch(
        addProductToCart({
          productId: product._id,
          color: selectedColor,
        })
      ).unwrap();

      toast.success(t('productDetail.addedToCart', { productName: product.name }));

      // Reset quantity and color after adding
      setQuantity(1);
      setSelectedColor(null);
    } catch (error: any) {
      toast.error(error || t('productDetail.failedToAddToCart'));
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Prepare product images array
  const productImages = product
    ? [product.mainImage, ...(product.images || [])]
    : [];

  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= (product?.quantity || 1)) {
      setQuantity(value);
    }
  };

  // Loading state
  if (loadingProduct) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('productDetail.loadingProduct')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (productError || !product) {
    return (
      <div className="container py-10">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">
            {productError || t('productDetail.productNotFound')}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={() => navigate("/shop")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('productDetail.backToShop')}
          </Button>
        </div>
      </div>
    );
  }

  // Calculate discount percentage
  const discountPercentage = product.priceAfterDiscount
    ? Math.round(
        ((product.price - product.priceAfterDiscount) / product.price) * 100
      )
    : 0;

  // Display price (use discounted price if available)
  const displayPrice = product.priceAfterDiscount || product.price;

  // Check if product is in stock
  const inStock = product.quantity > 0;

  // Filter related products (exclude current product)
  const relatedProducts = products
    .filter((p) => p._id !== product._id)
    .slice(0, 4);

  return (
    <div className="container py-6 md:py-10 space-y-6 md:space-y-10 px-4 md:px-6">
      {/* Breadcrumbs */}
      <div className="text-xs md:text-sm text-muted-foreground">
        <Link to="/shop" className="hover:underline">
          {t('productDetail.breadcrumbs.shop')}
        </Link>{" "}
        /{" "}
        <span className="hover:underline cursor-pointer">
          {product.category?.name || t('productDetail.breadcrumbs.category')}
        </span>{" "}
        / <span className="font-medium text-foreground">{product.name}</span>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        {/* Left: Gallery */}
        <div className="space-y-3 md:space-y-4">
          {/* Main Image */}
          <Card>
            <CardContent className="p-3 md:p-4">
              <img
                src={productImages[selectedImageIndex] || "/placeholder.png"}
                alt={product.name}
                className="w-full h-64 md:h-96 lg:h-[400px] object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.png";
                }}
              />
            </CardContent>
          </Card>

          {/* Thumbnail Images - Only show if there are multiple images */}
          {productImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2 md:gap-3">
              {productImages.map((image, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-primary ${
                    selectedImageIndex === index ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <CardContent className="p-2">
                    <img
                      src={image || "/placeholder.png"}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-16 md:h-20 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.png";
                      }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="space-y-4 md:space-y-6">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {product.brand && (
                <Badge variant="outline">{product.brand.name}</Badge>
              )}
              {!inStock && <Badge variant="destructive">{t('productDetail.outOfStock')}</Badge>}
              {inStock && product.quantity < 10 && (
                <Badge variant="secondary">{t('productDetail.onlyLeft', { quantity: product.quantity })}</Badge>
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 md:h-4 md:w-4 ${
                    i < Math.floor(product.rating || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs md:text-sm text-muted-foreground">
              {product.rating?.toFixed(1) || t('productDetail.noRating')} (
              {product.ratingsQuantity || 0} {t('productDetail.reviews')})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-2xl md:text-3xl font-bold">
              {displayPrice.toFixed(2)} DA
            </span>
            {product.priceAfterDiscount && (
              <>
                <span className="line-through text-muted-foreground text-base md:text-lg">
                  {product.price.toFixed(2)} DA
                </span>
                <Badge variant="destructive" className="text-xs md:text-sm">
                  {t('productDetail.save', { percentage: discountPercentage })}
                </Badge>
              </>
            )}
          </div>

          {/* Colors - if available */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">
                {t('productDetail.selectColor')}:{" "}
                {selectedColor && (
                  <span className="text-primary">({selectedColor})</span>
                )}
              </p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((color, index) => (
                  <Badge
                    key={index}
                    variant={selectedColor === color ? "default" : "outline"}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <label htmlFor="quantity" className="text-sm font-medium">
                  {t('productDetail.quantity')}:
                </label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min={1}
                  max={product.quantity}
                  disabled={!inStock}
                  className="w-16 md:w-20 h-9 md:h-10"
                />
              </div>
              <Button
                className="flex-1 md:flex-none h-9 md:h-10"
                disabled={
                  !inStock ||
                  (product.colors &&
                    product.colors.length > 0 &&
                    !selectedColor) ||
                  isAddingToCart
                }
                onClick={handleAddToCart}
                title={
                  !inStock
                    ? t('productDetail.outOfStock')
                    : product.colors &&
                      product.colors.length > 0 &&
                      !selectedColor
                    ? t('productDetail.pleaseSelectColor')
                    : ""
                }
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2 animate-spin" />
                    <span className="text-xs md:text-sm">{t('productDetail.adding')}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                    <span className="text-xs md:text-sm">
                      {!inStock
                        ? t('productDetail.outOfStock')
                        : product.colors &&
                          product.colors.length > 0 &&
                          !selectedColor
                        ? t('productDetail.selectColorButton')
                        : t('productDetail.addToCart')}
                    </span>
                  </>
                )}
              </Button>
              {/* <Button
                variant="secondary"
                className="h-9 md:h-10"
                disabled={!inStock}
              >
                <span className="text-xs md:text-sm">{t('productDetail.buyNow')}</span>
              </Button> */}
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 md:h-10 md:w-10"
                onClick={async () => {
                  try {
                    await dispatch(addProductToWishlist(product._id)).unwrap();
                    toast.success(t('productDetail.addedToWishlist', { productName: product.name }));
                  } catch (err: any) {
                    toast.error(err || t('productDetail.failedToAddToWishlist'));
                  }
                }}
              >
                <Heart className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>

            {/* Product Info Icons */}
            <div className="text-xs md:text-sm text-muted-foreground space-y-1">
              <p>{t('productDetail.features.freeShipping')}</p>
              <p>{t('productDetail.features.securePayment')}</p>
              <p>{t('productDetail.features.returns')}</p>
            </div>
          </div>

          {/* Category and Subcategory */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">{t('productDetail.info.category')}:</span>
                <p className="font-medium">{product.category?.name || t('productDetail.info.na')}</p>
              </div>
              {product.subCategory && (
                <div>
                  <span className="text-muted-foreground">{t('productDetail.info.subcategory')}:</span>
                  <p className="font-medium">{product.subCategory.name}</p>
                </div>
              )}
              {product.brand && (
                <div>
                  <span className="text-muted-foreground">{t('productDetail.info.brand')}:</span>
                  <p className="font-medium">{product.brand.name}</p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">{t('productDetail.info.sku')}:</span>
                <p className="font-medium text-xs">
                  {product._id.slice(-8).toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="description" className="text-xs md:text-sm">
            {t('productDetail.tabs.description')}
          </TabsTrigger>
          <TabsTrigger value="specs" className="text-xs md:text-sm">
            {t('productDetail.tabs.specifications')}
          </TabsTrigger>
          <TabsTrigger value="reviews" className="text-xs md:text-sm">
            {t('productDetail.tabs.reviews')} ({product.ratingsQuantity || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="pt-4 md:pt-6">
          <Card>
            <CardContent className="p-4 md:p-6">
              <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specs" className="pt-4 md:pt-6">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">
                      {t('productDetail.specs.productName')}:
                    </span>
                    <span className="text-sm font-medium">{product.name}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">
                      {t('productDetail.specs.category')}:
                    </span>
                    <span className="text-sm font-medium">
                      {product.category?.name || t('productDetail.info.na')}
                    </span>
                  </div>
                  {product.subCategory && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-muted-foreground">
                        {t('productDetail.specs.subcategory')}:
                      </span>
                      <span className="text-sm font-medium">
                        {product.subCategory.name}
                      </span>
                    </div>
                  )}
                  {product.brand && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-muted-foreground">
                        {t('productDetail.specs.brand')}:
                      </span>
                      <span className="text-sm font-medium">
                        {product.brand.name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">
                      {t('productDetail.specs.price')}:
                    </span>
                    <span className="text-sm font-medium">
                      {product.price.toFixed(2)} DA
                    </span>
                  </div>
                  {product.priceAfterDiscount && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-sm text-muted-foreground">
                        {t('productDetail.specs.discountedPrice')}:
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        {product.priceAfterDiscount.toFixed(2)} DA
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">
                      {t('productDetail.specs.availability')}:
                    </span>
                    <span className="text-sm font-medium">
                      {inStock
                        ? t('productDetail.specs.inStock', { quantity: product.quantity })
                        : t('productDetail.outOfStock')}
                    </span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-sm text-muted-foreground">{t('productDetail.specs.sold')}:</span>
                    <span className="text-sm font-medium">
                      {product.sold || 0} {t('productDetail.specs.units')}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="pt-4 md:pt-6">
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="text-center py-8">
                <Star className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm md:text-base text-muted-foreground">
                  {t('productDetail.reviewsSection.noReviews')}
                </p>
                <Button className="mt-4" variant="outline">
                  {t('productDetail.reviewsSection.writeReview')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">
            {t('productDetail.relatedProducts')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {relatedProducts.map((rp) => (
              <Card
                key={rp._id}
                className="group hover:shadow-lg transition-shadow duration-200"
              >
                <CardContent className="p-2 md:p-4">
                  <Link to={`/product/${rp._id}`}>
                    <div className="relative">
                      <img
                        src={rp.mainImage || "/placeholder.png"}
                        alt={rp.name}
                        className="rounded-lg mb-2 w-full h-32 md:h-40 object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder.png";
                        }}
                      />
                      {rp.priceAfterDiscount && (
                        <Badge
                          variant="destructive"
                          className="absolute top-2 right-2 text-xs"
                        >
                          {t('productDetail.sale')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs md:text-sm font-medium line-clamp-2 mb-1">
                      {rp.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm md:text-base font-bold">
                        {(rp.priceAfterDiscount || rp.price).toFixed(2)} DA
                      </span>
                      {rp.priceAfterDiscount && (
                        <span className="text-xs text-muted-foreground line-through">
                          DA{rp.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;