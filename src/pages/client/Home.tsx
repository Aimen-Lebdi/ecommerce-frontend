import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  Eye,
  ArrowRight,
  Quote,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
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

// Mock testimonials
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    rating: 5,
    text: "home.testimonials.items.sarah.text",
    product: "home.testimonials.items.sarah.product",
  },
  {
    id: 2,
    name: "Mike Chen",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    rating: 5,
    text: "home.testimonials.items.mike.text",
    product: "home.testimonials.items.mike.product",
  },
  {
    id: 3,
    name: "Emily Davis",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    rating: 5,
    text: "home.testimonials.items.emily.text",
    product: "home.testimonials.items.emily.product",
  },
];

// Mock blog posts
const blogPosts = [
  {
    id: 1,
    title: "home.blog.posts.mobileTech.title",
    excerpt: "home.blog.posts.mobileTech.excerpt",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=250&fit=crop",
    date: "home.blog.posts.mobileTech.date",
    readTime: "home.blog.posts.mobileTech.readTime",
    category: "home.blog.posts.mobileTech.category",
  },
  {
    id: 2,
    title: "home.blog.posts.gamingSetup.title",
    excerpt: "home.blog.posts.gamingSetup.excerpt",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=250&fit=crop",
    date: "home.blog.posts.gamingSetup.date",
    readTime: "home.blog.posts.gamingSetup.readTime",
    category: "home.blog.posts.gamingSetup.category",
  },
  {
    id: 3,
    title: "home.blog.posts.smartHome.title",
    excerpt: "home.blog.posts.smartHome.excerpt",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
    date: "home.blog.posts.smartHome.date",
    readTime: "home.blog.posts.smartHome.readTime",
    category: "home.blog.posts.smartHome.category",
  },
];

// Hero Section Component
const HeroSection = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

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
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="relative w-full h-full">
              <img
                src={slide.image}
                alt={t(slide.title)}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white max-w-2xl px-6">
                  <Badge className="mb-4 bg-red-600 hover:bg-red-700">
                    {t(slide.badge)}
                  </Badge>
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    {t(slide.title)}
                  </h1>
                  <h2 className="text-xl md:text-2xl mb-4 text-gray-200">
                    {t(slide.subtitle)}
                  </h2>
                  <p className="text-lg mb-8 text-gray-300">
                    {t(slide.description)}
                  </p>
                  <Button size="lg" className="text-lg px-8 py-4">
                    {t(slide.cta)}
                    <ArrowRight className="ml-2 h-5 w-5" />
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
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </section>
  );
};

// Categories Section with Slider
const CategoriesSection = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { categories, loading } = useSelector((state) => state.categories);

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

  const scroll = (direction) => {
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
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories?.map((category) => (
            <Link
              key={category._id}
              to={`/shop?category=${category._id}`}
              className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(16.666%-14px)]"
            >
              <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                <CardContent className="p-4 text-center">
                  <div className="w-full h-32 mb-4 overflow-hidden rounded-lg">
                    <img
                      src={
                        category.image ||
                        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop"
                      }
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category.productCount}{" "}
                    {category.productCount === 1 ? "item" : "items"}
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
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg"
            onClick={() => scroll("right")}
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
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { products, loading } = useSelector((state) => state.products);

  useEffect(() => {
    // Fetch top 4 products sorted by sold (most popular)
    dispatch(fetchProducts({ limit: 4, sort: "-sold" }));
  }, [dispatch]);

  const handleAddToWishlist = async (e, productId, productName) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await dispatch(addProductToWishlist(productId)).unwrap();
      toast.success(
        t("shop.product.addedToWishlist", {
          productName: productName,
        })
      );
    } catch (err) {
      toast.error(err || t("shop.product.failedToAddToWishlist"));
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
        {products?.slice(0, 4).map((product, index) => {
          const discountPrice = product.priceAfterDiscount || product.price;
          const hasDiscount =
            product.priceAfterDiscount &&
            product.priceAfterDiscount < product.price;

          // Determine badge based on index and product properties
          let badge = "home.products.badges.bestSeller";
          let badgeVariant = "secondary";

          if (index === 0) {
            badge = "home.products.badges.bestSeller";
            badgeVariant = "secondary";
          } else if (hasDiscount) {
            badge = "home.products.badges.sale";
            badgeVariant = "destructive";
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
                    <img
                      src={
                        product.mainImage ||
                        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop"
                      }
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge
                      className="absolute top-3 left-3"
                      variant={badgeVariant}
                    >
                      {t(badge)}
                    </Badge>
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 bg-white/80 hover:bg-white"
                        onClick={(e) =>
                          handleAddToWishlist(e, product._id, product.name)
                        }
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button
  size="icon"
  variant="outline"
  className="h-8 w-8 bg-white/80 hover:bg-white"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${product._id}`);
  }}
>
  <Eye className="h-4 w-4" />
</Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 flex-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center mb-2">
                    <div className="flex items-center mr-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({product.ratingsQuantity})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl font-bold">
                      {discountPrice} DA
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-muted-foreground line-through">
                        {product.price} DA
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span
                      className={`text-sm ${
                        product.quantity > 0 ? "text-green-600" : "text-red-600"
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

// Testimonials Section
const TestimonialsSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-12 bg-muted/30 rounded-2xl mb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">
            {t("home.testimonials.title")}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("home.testimonials.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="text-center">
              <CardContent className="p-6">
                <Quote className="h-8 w-8 text-primary mx-auto mb-4" />
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">
                  "{t(testimonial.text)}"
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={testimonial.avatar}
                      alt={testimonial.name}
                    />
                    <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("home.testimonials.verifiedBuyer")} -{" "}
                      {t(testimonial.product)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

// Newsletter Section
const NewsletterSection = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");

  return (
    <section className="py-12 bg-primary text-primary-foreground rounded-2xl mb-12">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">
          {t("home.newsletter.title")}
        </h2>
        <p className="text-xl mb-8 opacity-90">
          {t("home.newsletter.subtitle")}
        </p>
        <div className="max-w-md mx-auto flex gap-4">
          <Input
            type="email"
            placeholder={t("home.newsletter.placeholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white text-black"
          />
          <Button variant="secondary" size="lg">
            {t("home.newsletter.button")}
          </Button>
        </div>
        <p className="text-sm opacity-75 mt-4">
          {t("home.newsletter.privacyNote")}
        </p>
      </div>
    </section>
  );
};

// Blog Section
const BlogSection = () => {
  const { t } = useTranslation();

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">{t("home.blog.title")}</h2>
          <p className="text-muted-foreground">{t("home.blog.subtitle")}</p>
        </div>
        <Button variant="outline">
          {t("home.blog.viewAll")} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <Card
            key={post.id}
            className="group hover:shadow-lg transition-shadow duration-300"
          >
            <CardHeader className="p-0">
              <div className="overflow-hidden rounded-t-lg">
                <img
                  src={post.image}
                  alt={t(post.title)}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary">{t(post.category)}</Badge>
                <span className="text-sm text-muted-foreground">
                  {t(post.readTime)}
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {t(post.title)}
              </h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {t(post.excerpt)}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t(post.date)}
                </span>
                <Button variant="ghost" size="sm">
                  {t("home.blog.readMore")}{" "}
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

// Main Homepage Component
const Homepage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <HeroSection />
      <CategoriesSection />
      <FeaturedProductsSection />
      <TestimonialsSection />
      <NewsletterSection />
      <BlogSection />
    </div>
  );
};

export default Homepage;
