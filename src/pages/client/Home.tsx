import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import type { Category, Product } from "@/types";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Package,
  ArrowRight,
  ArrowLeft,
  Pause,
  Play,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Link } from "react-router-dom";
import { fetchCategories } from "../../features/categories/categoriesSlice";
import { fetchProducts } from "../../features/products/productsSlice";
import {
  addProductToWishlist,
  removeProductFromWishlist,
} from "../../features/wishlist/wishlistSlice";
import { toast } from "sonner";
import { responsiveImageProps } from "../../utils/responsiveImage";
import { formatPrice } from "../../utils/formatPrice";

// Category rail cards run 2-up on phones down to 6-up on desktops. Widths cap
// at 480 because the page container is capped (max-w-7xl): vw-based sizes
// overestimate on desktop, so larger candidates only waste bytes.
const CATEGORY_WIDTHS = [160, 240, 320, 480];
const CATEGORY_SIZES =
  "(max-width: 640px) calc(50vw - 24px), (max-width: 1024px) calc(33.333vw - 22px), min(calc(16.666vw - 14px), 194px)";
// Home product cards mirror the shop grid: 1 column on phones up to 4 on
// large screens.
const PRODUCT_CARD_WIDTHS = [200, 320, 480, 640, 800];
const PRODUCT_CARD_SIZES =
  "(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(50vw - 2rem), calc(25vw - 1.75rem)";

// NOTE: No testimonial or blog content by design — PRODUCT.md forbids
// fabricating social proof or editorial content until real assets exist.

// Full-bleed hero imagery widths for the product slides' srcset.
const HERO_IMAGE_WIDTHS = [640, 1024, 1600];

const HeroSection = () => {
  const { t } = useTranslation();
  // Real catalog imagery for slides 2+: reuse the featured-products fetch.
  const { products } = useAppSelector((state) => state.products);
  const featured = (products ?? [])
    .filter((product: Product) => product.mainImage)
    .slice(0, 3);
  const slideCount = 1 + featured.length;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Autoplay pauses on user request and never starts for users who prefer
  // reduced motion — the prev/next controls remain fully available.
  useEffect(() => {
    if (isPaused || prefersReducedMotion || slideCount <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, prefersReducedMotion, slideCount]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideCount);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
  };

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-2xl mb-12">
      <div className="relative w-full h-full">
        {/* Lead slide: the COD promise — pure type on ink, no stock photography */}
        <div
          aria-hidden={currentSlide !== 0}
          inert={currentSlide !== 0}
          className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none bg-primary text-primary-foreground ${
            currentSlide === 0 ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-2xl px-6">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
                {t("home.hero.cod.title")}
              </h1>
              <h2 className="text-xl md:text-2xl mb-4 opacity-90">
                {t("home.hero.cod.subtitle")}
              </h2>
              <p className="text-lg mb-8 opacity-75">
                {t("home.hero.cod.description")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/shop">{t("home.hero.cod.ctaShop")}</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  asChild
                >
                  <Link to="/about">{t("home.hero.cod.ctaAbout")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product slides: real catalog imagery, no fabricated campaigns */}
        {featured.map((product: Product, index: number) => {
          const slideIndex = index + 1;
          return (
            <div
              key={product._id}
              aria-hidden={currentSlide !== slideIndex}
              inert={currentSlide !== slideIndex}
              className={`absolute inset-0 bg-muted transition-opacity duration-500 motion-reduce:transition-none ${
                currentSlide === slideIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                {...responsiveImageProps(
                  product.mainImage,
                  HERO_IMAGE_WIDTHS,
                  "100vw"
                )}
                alt={product.name}
                className="w-full h-full object-contain"
                {...(currentSlide === slideIndex
                  ? { fetchPriority: "high" as const }
                  : { loading: "lazy" as const, decoding: "async" as const })}
              />
              <div className="absolute inset-0 bg-black/45" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white max-w-2xl px-6">
                  <Badge className="mb-4">{formatPrice(product.price)}</Badge>
                  <h2 className="text-3xl md:text-5xl font-bold mb-6 line-clamp-2">
                    {product.name}
                  </h2>
                  <Button size="lg" className="text-base px-8" asChild>
                    <Link to={`/product/${product._id}`}>
                      {t("home.hero.productCta")}
                      <ArrowRight className="ml-2 h-5 w-5 rtl:hidden" />
                      <ArrowLeft className="ml-2 h-5 w-5 ltr:hidden" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {slideCount > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute start-4 top-1/2 h-11 w-11 -translate-y-1/2 bg-background/80 hover:bg-background"
            onClick={prevSlide}
            aria-label={t("home.hero.prevSlide")}
          >
            <ChevronLeft className="h-6 w-6 flip-rtl" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute end-4 top-1/2 h-11 w-11 -translate-y-1/2 bg-background/80 hover:bg-background"
            onClick={nextSlide}
            aria-label={t("home.hero.nextSlide")}
          >
            <ChevronRight className="h-6 w-6 flip-rtl" />
          </Button>

          {!prefersReducedMotion && (
            <Button
              variant="outline"
              size="icon"
              className="absolute end-4 bottom-6 h-11 w-11 bg-background/80 hover:bg-background"
              onClick={() => setIsPaused((p) => !p)}
              aria-label={
                isPaused
                  ? t("home.hero.resumeCarousel")
                  : t("home.hero.pauseCarousel")
              }
              aria-pressed={isPaused}
            >
              {isPaused ? (
                <Play className="h-5 w-5" />
              ) : (
                <Pause className="h-5 w-5" />
              )}
            </Button>
          )}

          <div className="absolute bottom-6 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 flex space-x-1 rounded-full border bg-background/70 p-1.5 backdrop-blur">
            {Array.from({ length: slideCount }).map((_, index) => (
              <button
                key={index}
                className="grid h-11 w-11 place-items-center"
                onClick={() => setCurrentSlide(index)}
                aria-label={t("home.hero.goToSlide", { number: index + 1 })}
              >
                <span
                  aria-hidden="true"
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide
                      ? "bg-foreground"
                      : "bg-foreground/40"
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

// Categories Section with Slider
const CategoriesSection = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { categories, loading } = useAppSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories({ limit: 100 }));
  }, [dispatch]);

  if (loading) {
    return (
      <section className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            {t("home.categories.title")}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("home.categories.subtitle")}
          </p>
        </div>
        <div className="flex justify-center">
          <p className="text-muted-foreground">{t("shop.loading")}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">
          {t("home.categories.title")}
        </h2>
        <p className="text-muted-foreground text-lg">
          {t("home.categories.subtitle")}
        </p>
      </div>

      <div>
        <div
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories?.map((category: Category) => (
            <Link
              key={category._id}
              to={`/shop?category=${category._id}`}
              className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(16.666%-14px)]"
            >
              <Card className="group cursor-pointer hover:shadow-sm transition-all duration-150 hover:-translate-y-0.5 h-full">
                <CardContent className="p-4 text-center">
                  <div className="w-full h-32 mb-4 overflow-hidden rounded-lg bg-muted transition-transform duration-150 group-hover:scale-105">
                    {category.image ? (
                      <img
                        {...responsiveImageProps(
                          category.image,
                          CATEGORY_WIDTHS,
                          CATEGORY_SIZES
                        )}
                        alt={category.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-3xl font-bold text-muted-foreground">
                          {category.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("home.categories.itemCount", {
                      count: category.productCount ?? 0,
                    })}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

// Featured Products Section with Real Data
const FeaturedProductsSection = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { products, loading } = useAppSelector((state) => state.products);
  const wishlistItems = useAppSelector((state) => state.wishlist.wishlistItems);

  useEffect(() => {
    // Fetch top 4 products sorted by sold (most popular)
    dispatch(fetchProducts({ limit: 4, sort: "-sold" }));
  }, [dispatch]);

  const handleToggleWishlist = async (
    e: React.MouseEvent,
    productId: string,
    productName: string,
    isInWishlist: boolean
  ) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isInWishlist) {
        await dispatch(removeProductFromWishlist(productId)).unwrap();
        toast.success(
          t("shop.product.removedFromWishlist", {
            productName: productName,
          })
        );
      } else {
        await dispatch(addProductToWishlist(productId)).unwrap();
        toast.success(
          t("shop.product.addedToWishlist", {
            productName: productName,
          })
        );
      }
    } catch (err: unknown) {
      const message =
        typeof err === "string"
          ? err
          : t("shop.product.failedToAddToWishlist");
      toast.error(message);
    }
  };

  if (loading) {
    return (
      // content-visibility defers layout/paint of this below-the-fold section
      // until it scrolls near the viewport; contain-intrinsic-size reserves its
      // approximate height so the scrollbar doesn't jump.
      <section className="mb-12 [content-visibility:auto] [contain-intrinsic-size:auto_600px]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              {t("home.products.title")}
            </h2>
            <p className="text-muted-foreground">
              {t("home.products.subtitle")}
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <p className="text-muted-foreground">{t("shop.loadingProducts")}</p>
        </div>
      </section>
    );
  }

  return (
    // See the loading branch above for why these containment utilities exist.
    <section className="mb-12 [content-visibility:auto] [contain-intrinsic-size:auto_600px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            {t("home.products.title")}
          </h2>
          <p className="text-muted-foreground">{t("home.products.subtitle")}</p>
        </div>
        {/* asChild renders the Link AS the button — a nested <a> inside
            <button> is invalid HTML and fails WCAG 2.5.8 target-size. */}
        <Button variant="outline" asChild>
          <Link to="/shop" className="flex items-center">
            {t("home.products.viewAll")} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products?.slice(0, 4).map((product: Product, index: number) => {
          // Determine badge based on index and product properties
          let badge = "home.products.badges.bestSeller";
          let badgeVariant: "secondary" | "default" = "secondary";

          if (index === 0) {
            badge = "home.products.badges.bestSeller";
            badgeVariant = "secondary";
          } else if (product.quantity > 50) {
            badge = "home.products.badges.hotDeal";
            badgeVariant = "default";
          } else {
            badge = "home.products.badges.new";
            badgeVariant = "default";
          }

          const isInWishlist = wishlistItems.some(
            (item) => item._id === product._id
          );

          return (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              className="block"
            >
              <Card className="group hover:shadow-sm transition-all duration-150 h-full flex flex-col">
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    {product.mainImage ? (
                      <div className="w-full h-48 overflow-hidden bg-muted transition-transform duration-150 group-hover:scale-105">
                        <img
                          {...responsiveImageProps(
                            product.mainImage,
                            PRODUCT_CARD_WIDTHS,
                            PRODUCT_CARD_SIZES
                          )}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-muted flex items-center justify-center">
                        <Package className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                    <Badge
                      className="absolute top-3 left-3"
                      variant={badgeVariant}
                    >
                      {t(badge)}
                    </Badge>
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-11 w-11 bg-white/95 backdrop-blur-sm shadow-md ring-1 ring-black/5 hover:bg-white"
                        aria-label={
                          isInWishlist
                            ? t("shop.product.removeFromWishlist", {
                                productName: product.name,
                              })
                            : t("home.products.addToWishlist", {
                                productName: product.name,
                              })
                        }
                        aria-pressed={isInWishlist}
                        onClick={(e) =>
                          handleToggleWishlist(
                            e,
                            product._id,
                            product.name,
                            isInWishlist
                          )
                        }
                      >
                        <Heart
                          className={`h-4 w-4 transition-colors drop-shadow ${
                            isInWishlist
                              ? "fill-destructive text-destructive"
                              : "text-foreground"
                          }`}
                        />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 flex-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl font-bold">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span
                      className={`text-sm ${
                        product.quantity > 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {product.quantity > 0
                        ? t("home.products.inStock")
                        : t("home.products.outOfStock")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

// NOTE: No newsletter section — there is no subscription backend yet, and a
// subscribe form that fakes success would violate PRODUCT.md's honesty rules.

// Main Homepage Component
const Homepage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSection />
      <CategoriesSection />
      <FeaturedProductsSection />
    </div>
  );
};

export default Homepage;
