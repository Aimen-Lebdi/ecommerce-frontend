import { useState, useEffect, useRef } from "react";
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
import { addProductToWishlist } from "../../features/wishlist/wishlistSlice";
import { toast } from "sonner";

// Mock data for hero slides
const heroSlides = [
  {
    id: 1,
    title: "home.hero.slides.summerSale.title",
    subtitle: "home.hero.slides.summerSale.subtitle",
    description: "home.hero.slides.summerSale.description",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
    cta: "home.hero.slides.summerSale.cta",
    badge: "home.hero.slides.summerSale.badge",
  },
  {
    id: 2,
    title: "home.hero.slides.iphone.title",
    subtitle: "home.hero.slides.iphone.subtitle",
    description: "home.hero.slides.iphone.description",
    image:
      "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&h=600&fit=crop",
    cta: "home.hero.slides.iphone.cta",
    badge: "home.hero.slides.iphone.badge",
  },
  {
    id: 3,
    title: "home.hero.slides.gaming.title",
    subtitle: "home.hero.slides.gaming.subtitle",
    description: "home.hero.slides.gaming.description",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=600&fit=crop",
    cta: "home.hero.slides.gaming.cta",
    badge: "home.hero.slides.gaming.badge",
  },
];

// NOTE: No testimonial or blog content by design — PRODUCT.md forbids
// fabricating social proof or editorial content until real assets exist.

// Hero Section Component
// Build a responsive srcset from an Unsplash URL by swapping its width param.
const heroSrcSet = (url: string) =>
  [640, 1280, 1920]
    .map((w) => `${url.replace(/w=\d+/, `w=${w}`)} ${w}w`)
    .join(", ");

const HeroSection = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Autoplay pauses on user request and never starts for users who prefer
  // reduced motion — the prev/next controls remain fully available.
  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, prefersReducedMotion]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length
    );
  };

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-2xl mb-12">
      <div className="relative w-full h-full">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            aria-hidden={index !== currentSlide}
            className={`absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="relative w-full h-full">
              <img
                src={slide.image}
                srcSet={heroSrcSet(slide.image)}
                sizes="100vw"
                alt={t(slide.title)}
                className="w-full h-full object-cover"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white max-w-2xl px-6">
                  <Badge className="mb-4 bg-destructive hover:bg-destructive/90">
                    {t(slide.badge)}
                  </Badge>
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    {t(slide.title)}
                  </h1>
                  <h2 className="text-xl md:text-2xl mb-4 text-white/90">
                    {t(slide.subtitle)}
                  </h2>
                  <p className="text-lg mb-8 text-white/75">
                    {t(slide.description)}
                  </p>
                  <Button size="lg" className="text-lg px-8 py-4" asChild>
                    <Link to="/shop">
                      {t(slide.cta)}
                      <ArrowRight className="ml-2 h-5 w-5 rtl:hidden" />
                      <ArrowLeft className="ml-2 h-5 w-5 ltr:hidden" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 h-11 w-11 transform -translate-y-1/2 bg-white/80 hover:bg-white"
        onClick={prevSlide}
        aria-label={t("home.hero.prevSlide")}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 h-11 w-11 transform -translate-y-1/2 bg-white/80 hover:bg-white"
        onClick={nextSlide}
        aria-label={t("home.hero.nextSlide")}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {!prefersReducedMotion && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-4 bottom-6 h-11 w-11 bg-white/80 hover:bg-white"
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

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            className="grid h-11 w-11 place-items-center"
            onClick={() => setCurrentSlide(index)}
            aria-label={t("home.hero.goToSlide", { number: index + 1 })}
          >
            <span
              aria-hidden="true"
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? "bg-white" : "bg-white/50"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
};

// Categories Section with Slider
const CategoriesSection = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { categories, loading } = useAppSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories({ limit: 100 }));
  }, [dispatch]);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);
      return () => {
        container.removeEventListener("scroll", checkScrollButtons);
        window.removeEventListener("resize", checkScrollButtons);
      };
    }
  }, [categories]);

  const scroll = (direction: string) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

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
          <p className="text-muted-foreground">Loading categories...</p>
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

      <div className="relative">
        {canScrollLeft && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-sm"
            onClick={() => scroll("left")}
            aria-label={t("home.categories.scrollLeft")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories?.map((category: Category) => (
            <Link
              key={category._id}
              to={`/shop?category=${category._id}`}
              className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(16.666%-14px)]"
            >
              <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                <CardContent className="p-4 text-center">
                  <div className="w-full h-32 mb-4 overflow-hidden rounded-lg">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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

        {canScrollRight && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-sm"
            onClick={() => scroll("right")}
            aria-label={t("home.categories.scrollRight")}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>
    </section>
  );
};

// Featured Products Section with Real Data
const FeaturedProductsSection = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const { products, loading } = useAppSelector((state) => state.products);

  useEffect(() => {
    // Fetch top 4 products sorted by sold (most popular)
    dispatch(fetchProducts({ limit: 4, sort: "-sold" }));
  }, [dispatch]);

  const handleAddToWishlist = async (e: React.MouseEvent, productId: string, productName: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await dispatch(addProductToWishlist(productId)).unwrap();
      toast.success(
        t("shop.product.addedToWishlist", {
          productName: productName,
        })
      );
    } catch (err: unknown) {
      const message = typeof err === "string" ? err : t("shop.product.failedToAddToWishlist");
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <section className="mb-12">
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
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            {t("home.products.title")}
          </h2>
          <p className="text-muted-foreground">{t("home.products.subtitle")}</p>
        </div>
        <Button variant="outline">
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

          return (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              className="block"
            >
              <Card className="group hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    {product.mainImage ? (
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
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
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-11 w-11 bg-white/80 hover:bg-white"
                        aria-label={t("home.products.addToWishlist", {
                          productName: product.name,
                        })}
                        onClick={(e) =>
                          handleAddToWishlist(e, product._id, product.name)
                        }
                      >
                        <Heart className="h-4 w-4" />
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
                      {product.price} DZD
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
