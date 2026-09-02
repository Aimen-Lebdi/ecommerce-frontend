import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useTranslation } from "react-i18next";
import type { Product, Category, SubCategory, Brand, ProductsQueryParams } from "@/types";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  Heart,
  ShoppingCart,
  Package,
  RefreshCw,
  X,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../components/ui/sheet";
import { Link } from "react-router-dom";

import { responsiveImageProps } from "../../utils/responsiveImage";
import { formatPrice } from "../../utils/formatPrice";

// Import Redux actions
import {
  fetchProducts,
  fetchMoreProducts,
} from "../../features/products/productsSlice";
import { fetchCategories } from "../../features/categories/categoriesSlice";
import { fetchSubCategories } from "../../features/subCategories/subCategoriesSlice";
import { fetchBrands } from "../../features/brands/brandsSlice";
import { addProductToWishlist, removeProductFromWishlist } from "../../features/wishlist/wishlistSlice";
import { toast } from "sonner";

// ─── Shop Filters Types ───────────────────────────────────────────────────────

interface TempPriceRange {
  minPrice: string;
  maxPrice: string;
}

interface ShopFilters {
  limit: number;
  sort: string;
  category: string;
  subCategory: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  keyword: string;
}

interface FiltersPanelProps {
  isMobile?: boolean;
  categories: Category[];
  categoriesLoading: boolean;
  selectedCategories: string[];
  onCategoryChange: (categoryId: string) => void;
  selectedSubCategories: string[];
  availableSubCategories: SubCategory[];
  subcategoriesLoading: boolean;
  subcategoriesError: string | null;
  onSubCategoryChange: (subCategoryId: string) => void;
  onRetrySubCategories: () => void;
  brands: Brand[];
  brandsLoading: boolean;
  selectedBrands: string[];
  onBrandChange: (brandId: string) => void;
  tempPriceRange: TempPriceRange;
  onTempPriceChange: (field: string, value: string) => void;
  onApplyPriceFilter: () => void;
  filters: ShopFilters;
  onFiltersChange: (filters: ShopFilters) => void;
  activeFilters: number;
  onClearFilters: () => void;
}

// FiltersPanel component - MOVED OUTSIDE ShopPage
const FiltersPanel = memo<FiltersPanelProps>(
  ({
    categories,
    categoriesLoading,
    selectedCategories,
    onCategoryChange,
    selectedSubCategories,
    availableSubCategories,
    subcategoriesLoading,
    subcategoriesError,
    onSubCategoryChange,
    onRetrySubCategories,
    brands,
    brandsLoading,
    selectedBrands,
    onBrandChange,
    tempPriceRange,
    onTempPriceChange,
    onApplyPriceFilter,
    filters,
    onFiltersChange,
    activeFilters,
    onClearFilters,
  }) => {
    const { t } = useTranslation();

    return (
      <div className="space-y-6">
        {/* Categories */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            {t("shop.filters.categories")}
          </Label>
          {categoriesLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                {t("shop.loading")}
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {categories?.map((category) => (
                <div key={category._id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category._id}`}
                    checked={selectedCategories.includes(category._id)}
                    onCheckedChange={() => onCategoryChange(category._id)}
                  />
                  <Label
                    htmlFor={`category-${category._id}`}
                    className="text-sm font-normal flex-1 line-clamp-1"
                  >
                    {category.name}
                    <span className="text-muted-foreground ml-1">
                      ({category.productCount || 0})
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subcategories */}
        {selectedCategories.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {t("shop.filters.subcategories")}
            </Label>
            {subcategoriesLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  {t("shop.loading")}
                </span>
              </div>
            ) : subcategoriesError ? (
              <div className="text-sm text-destructive space-y-2">
                <p>{t("shop.errors.loadingSubcategoriesFailed")}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetrySubCategories}
                  className="w-full"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  {t("shop.retry")}
                </Button>
              </div>
            ) : availableSubCategories.length > 0 ? (
              <div className="space-y-2">
                {availableSubCategories.map((subcategory) => (
                  <div
                    key={subcategory._id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`subcategory-${subcategory._id}`}
                      checked={selectedSubCategories.includes(subcategory._id)}
                      onCheckedChange={() =>
                        onSubCategoryChange(subcategory._id)
                      }
                    />
                    <Label
                      htmlFor={`subcategory-${subcategory._id}`}
                      className="text-sm font-normal flex-1 line-clamp-1"
                    >
                      {subcategory.name}
                      <span className="text-muted-foreground ml-1">
                        ({subcategory.productCount || 0})
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("shop.filters.noSubcategories")}
              </p>
            )}
          </div>
        )}

        {/* Brands */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            {t("shop.filters.brands")}
          </Label>
          {brandsLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                {t("shop.loading")}
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {brands?.map((brand) => (
                <div key={brand._id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand._id}`}
                    checked={selectedBrands.includes(brand._id)}
                    onCheckedChange={() => onBrandChange(brand._id)}
                  />
                  <Label
                    htmlFor={`brand-${brand._id}`}
                    className="text-sm font-normal flex-1 line-clamp-1"
                  >
                    {brand.name}
                    <span className="text-muted-foreground ml-1">
                      ({brand.productCount || 0})
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            {t("shop.filters.priceRange")}
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label
                htmlFor="min-price"
                className="text-xs text-muted-foreground"
              >
                {t("shop.filters.minPrice")}
              </Label>
              <Input
                id="min-price"
                type="number"
                placeholder="0"
                value={tempPriceRange.minPrice}
                onChange={(e) => {
                  e.stopPropagation();
                  onTempPriceChange("minPrice", e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onApplyPriceFilter();
                  }
                }}
                className="text-sm"
              />
            </div>
            <div>
              <Label
                htmlFor="max-price"
                className="text-xs text-muted-foreground"
              >
                {t("shop.filters.maxPrice")}
              </Label>
              <Input
                id="max-price"
                type="number"
                placeholder="∞"
                value={tempPriceRange.maxPrice}
                onChange={(e) => {
                  e.stopPropagation();
                  onTempPriceChange("maxPrice", e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onApplyPriceFilter();
                  }
                }}
                className="text-sm"
              />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onApplyPriceFilter}
            className="w-full"
          >
            {t("shop.filters.applyPriceFilter")}
          </Button>
          {(filters.minPrice || filters.maxPrice) && (
            <div className="text-xs text-muted-foreground text-center">
              {t("shop.filters.active")}: {formatPrice(Number(filters.minPrice || 0))} -{" "}
              {filters.maxPrice ? formatPrice(Number(filters.maxPrice)) : "∞"}
            </div>
          )}
        </div>

        {/* Special Filters */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            {t("shop.filters.specialOffers")}
          </Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="in-stock"
                checked={filters.inStock}
                onCheckedChange={(checked) =>
                  onFiltersChange({ ...filters, inStock: checked === true })
                }
              />
              <Label htmlFor="in-stock" className="text-sm font-normal">
                {t("shop.filters.inStockOnly")}
              </Label>
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        {activeFilters > 0 && (
          <Button variant="outline" onClick={onClearFilters} className="w-full">
            {t("shop.filters.clearAllFilters")} ({activeFilters})
          </Button>
        )}
      </div>
    );
  }
);

FiltersPanel.displayName = "FiltersPanel";

// ─── Product Cards (module level) ────────────────────────────────────────────
// Defined outside ShopPage so React keeps a stable component type across
// filter/sort/pagination updates — inline definitions remounted the whole
// grid on every state change, re-decoding every image and losing scroll
// position. memo() additionally skips re-renders when a product object is
// unchanged.

interface ProductCardProps {
  product: Product;
}

// Grid cards run from one phone-width column up to four columns on wide
// desktops with fixed heights, so width drives the fetched variant.
const PRODUCT_GRID_WIDTHS = [200, 320, 480, 640, 800];
const PRODUCT_GRID_SIZES =
  "(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(50vw - 2rem), 350px";

const ProductCard = memo<ProductCardProps>(({ product }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlist.wishlistItems);
  const [isAnimating, setIsAnimating] = useState(false);

  const isInWishlist = wishlistItems.some((item) => item._id === product._id);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Trigger a quick pop animation for tactile feedback.
    setIsAnimating(true);
    window.setTimeout(() => setIsAnimating(false), 300);

    try {
      if (isInWishlist) {
        await dispatch(removeProductFromWishlist(product._id)).unwrap();
        toast.success(
          t("shop.product.removedFromWishlist", {
            productName: product.name,
          })
        );
      } else {
        await dispatch(addProductToWishlist(product._id)).unwrap();
        toast.success(
          t("shop.product.addedToWishlist", {
            productName: product.name,
          })
        );
      }
    } catch (err) {
      toast.error(
        (err as string) || t("shop.product.failedToAddToWishlist")
      );
    }
  };

  return (
    <Link to={`/product/${product._id}`} className="block h-full">
      <Card className="group hover:shadow-sm transition-all duration-150 h-full flex flex-col cursor-pointer">
        <CardHeader className="p-0 flex-shrink-0">
          <div className="relative overflow-hidden rounded-t-lg">
            {product.mainImage ? (
              <div className="w-full h-36 sm:h-40 md:h-48 overflow-hidden bg-muted transition-transform duration-150 group-hover:scale-105">
                <img
                  {...responsiveImageProps(
                    product.mainImage,
                    PRODUCT_GRID_WIDTHS,
                    PRODUCT_GRID_SIZES
                  )}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-full h-36 sm:h-40 md:h-48 bg-muted flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              <Button
                size="icon"
                variant="outline"
                className={`h-11 w-11 bg-white/95 backdrop-blur-sm shadow-md ring-1 ring-black/5 hover:bg-white transition-transform ${
                  isAnimating ? "scale-110" : ""
                }`}
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
                onClick={handleToggleWishlist}
              >
                <Heart
                  className={`h-3 w-3 transition-colors drop-shadow ${
                    isInWishlist
                      ? "fill-destructive text-destructive"
                      : "text-foreground"
                  }`}
                />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
          <div className="mb-1.5 flex flex-wrap gap-1">
            {product.brand?.name && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                {product.brand.name}
              </Badge>
            )}
            {product.category?.name && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                {product.category.name}
              </Badge>
            )}
          </div>
          <h3 className="font-semibold text-sm sm:text-base mb-2 line-clamp-2 leading-tight flex-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
            <span className="text-base sm:text-lg font-bold">
              {formatPrice(product.price)}
            </span>
          </div>
          <div className="flex items-center justify-between mt-auto">
            <span
              className={`text-xs ${
                product.quantity > 0 ? "text-success" : "text-destructive"
              }`}
            >
              {product.quantity > 0
                ? t("shop.product.inStock", { quantity: product.quantity })
                : t("shop.product.outOfStock")}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

ProductCard.displayName = "ProductCard";

const ShopPage = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const sortOptions = [
    { value: "-createdAt", label: t("shop.sort.newestFirst") },
    { value: "createdAt", label: t("shop.sort.oldestFirst") },
    { value: "price", label: t("shop.sort.priceLowToHigh") },
    { value: "-price", label: t("shop.sort.priceHighToLow") },
    { value: "-sold", label: t("shop.sort.mostPopular") },
    { value: "name", label: t("shop.sort.nameAToZ") },
    { value: "-name", label: t("shop.sort.nameZToA") },
  ];

  // Redux state
  const {
    products,
    pagination,
    loading: productsLoading,
    error: productsError,
    loadingMore,
    loadMoreError,
  } = useAppSelector((state) => state.products);
  const { categories, loading: categoriesLoading } = useAppSelector(
    (state) => state.categories
  );
  const {
    subcategories,
    loading: subcategoriesLoading,
    error: subcategoriesError,
  } = useAppSelector((state) => state.subCategories);
  const { brands, loading: brandsLoading } = useAppSelector(
    (state) => state.brands
  );

  // Local state
  const [filters, setFilters] = useState<ShopFilters>({
    limit: 24,
    sort: "-sold",
    category: "",
    subCategory: "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    inStock: false,
    keyword: "",
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState(0);
  const [tempPriceRange, setTempPriceRange] = useState<TempPriceRange>({
    minPrice: "",
    maxPrice: "",
  });

  // Get filters from URL on mount and when URL changes
  useEffect(() => {
    const keywordFromUrl = searchParams.get("keyword");
    const categoryFromUrl = searchParams.get("category");
    const subCategoryFromUrl = searchParams.get("subcategory");

    if (keywordFromUrl) {
      setFilters((prev) => ({ ...prev, keyword: keywordFromUrl }));
    }

    if (categoryFromUrl) {
      setSelectedCategories(categoryFromUrl.split(",").filter(Boolean));
    }

    if (subCategoryFromUrl) {
      setSelectedSubCategories(subCategoryFromUrl.split(",").filter(Boolean));
    }
  }, [searchParams]);

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchCategories({}));
    dispatch(fetchBrands({}));
  }, [dispatch]);

  // Fetch subcategories when categories change.
  // The `else` branch uses a functional updater to avoid clearing subcategories
  // that were just set from URL params (e.g. breadcrumb links). React batches
  // state updates across effects, so the stale `selectedCategories` in this
  // render could still be `[]` while the URL-params effect already queued
  // `setSelectedSubCategories([...])`. Checking `prev` (the pending state)
  // ensures we only clear subcategories that were genuinely empty before.
  useEffect(() => {
    if (selectedCategories.length > 0) {
      const categoryIds = selectedCategories.join(",");
      dispatch(fetchSubCategories({ category: categoryIds, limit: 100 }));
    } else {
      setSelectedSubCategories((prev) => (prev.length > 0 ? prev : []));
    }
  }, [selectedCategories, dispatch]);

  // Build products query params from current filters (shared by effect + retry)
  const buildProductsQueryParams = useCallback((): ProductsQueryParams => {
    const queryParams: ProductsQueryParams = {
      limit: filters.limit,
      sort: filters.sort,
    };

    // Add keyword to query params if present
    if (filters.keyword) {
      queryParams.keyword = filters.keyword;
    }

    if (selectedCategories.length > 0) {
      queryParams.category = selectedCategories.join(",");
    }

    if (selectedSubCategories.length > 0) {
      queryParams.subCategory = selectedSubCategories.join(",");
    }

    if (selectedBrands.length > 0) {
      queryParams.brand = selectedBrands.join(",");
    }

    if (filters.minPrice) {
      queryParams["price[gte]"] = Number(filters.minPrice);
    }
    if (filters.maxPrice) {
      queryParams["price[lte]"] = Number(filters.maxPrice);
    }

    if (filters.inStock) {
      queryParams["quantity[gt]"] = 0;
    }

    return queryParams;
  }, [filters, selectedCategories, selectedSubCategories, selectedBrands]);

  // Fetch products when filters change (abort any in-flight request so the
  // latest filter selection always wins)
  useEffect(() => {
    const fetchPromise = dispatch(fetchProducts(buildProductsQueryParams()));
    return () => {
      fetchPromise?.abort?.();
      // A filter change supersedes any in-flight load-more request
      loadMorePromiseRef.current?.abort?.();
      loadMorePromiseRef.current = null;
    };
  }, [buildProductsQueryParams, dispatch]);

  // Retry products fetch after an error
  const handleRetryProducts = useCallback(() => {
    dispatch(fetchProducts(buildProductsQueryParams()));
  }, [buildProductsQueryParams, dispatch]);

  // Retry subcategories fetch after an error
  const handleRetrySubCategories = useCallback(() => {
    if (selectedCategories.length > 0) {
      const categoryIds = selectedCategories.join(",");
      dispatch(fetchSubCategories({ category: categoryIds, limit: 100 }));
    }
  }, [selectedCategories, dispatch]);

  // Retry a failed load-more request (infinite scroll)
  const handleRetryLoadMore = useCallback(() => {
    dispatch(fetchMoreProducts(buildProductsQueryParams()));
  }, [buildProductsQueryParams, dispatch]);

  const hasMore = Boolean(pagination?.nextPage);

  // Infinite scroll: prefetch the next page when the sentinel approaches the
  // bottom of the scroll container. The observer is recreated whenever the
  // guard values change so that a sentinel already in view re-triggers once
  // loadingMore clears.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    const scrollRoot = productsScrollRef.current;
    if (!sentinel || !scrollRoot) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          !productsLoading &&
          !loadingMore &&
          hasMore
        ) {
          loadMorePromiseRef.current = dispatch(
            fetchMoreProducts(buildProductsQueryParams())
          );
        }
      },
      { root: scrollRoot, rootMargin: "300px 0px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    dispatch,
    buildProductsQueryParams,
    productsLoading,
    loadingMore,
    hasMore,
  ]);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (selectedCategories.length > 0) count++;
    if (selectedSubCategories.length > 0) count++;
    if (selectedBrands.length > 0) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.inStock) count++;
    if (filters.keyword) count++;
    setActiveFilters(count);
  }, [selectedCategories, selectedSubCategories, selectedBrands, filters]);

  // Callbacks wrapped with useCallback
  const handleCategoryChange = useCallback(
    (categoryId: string) => {
      const nextCategories = selectedCategories.includes(categoryId)
        ? selectedCategories.filter((c) => c !== categoryId)
        : [...selectedCategories, categoryId];

      setSelectedCategories(nextCategories);

      // Preserve subcategory selections that still belong to a selected category:
      // adding a category keeps existing selections, removing one drops the
      // subcategories of the removed category.
      setSelectedSubCategories((prev) =>
        prev.filter((subId) => {
          const sub = subcategories.find((s) => s._id === subId);
          if (!sub) return false;
          const subCategoryId =
            typeof sub.category === "object" ? sub.category._id : sub.category;
          return nextCategories.includes(subCategoryId);
        })
      );

      setFilters((prev) => ({ ...prev }));
    },
    [selectedCategories, subcategories]
  );

  const handleSubCategoryChange = useCallback((subCategoryId: string) => {
    setSelectedSubCategories((prev) =>
      prev.includes(subCategoryId)
        ? prev.filter((s) => s !== subCategoryId)
        : [...prev, subCategoryId]
    );
    setFilters((prev) => ({ ...prev }));
  }, []);

  const handleBrandChange = useCallback((brandId: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((b) => b !== brandId)
        : [...prev, brandId]
    );
    setFilters((prev) => ({ ...prev }));
  }, []);

  const handleTempPriceChange = useCallback((field: string, value: string) => {
    setTempPriceRange((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleApplyPriceFilter = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      minPrice: tempPriceRange.minPrice,
      maxPrice: tempPriceRange.maxPrice,
    }));
  }, [tempPriceRange]);

  const handleFiltersChange = useCallback((newFilters: ShopFilters) => {
    setFilters(newFilters);
  }, []);

  const handleSortChange = (sortValue: string) => {
    setFilters((prev) => ({ ...prev, sort: sortValue }));
  };

  const productsScrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMorePromiseRef = useRef<{ abort: () => void } | null>(null);

  const clearFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setSelectedBrands([]);
    setTempPriceRange({ minPrice: "", maxPrice: "" });
    setFilters((prev) => ({
      ...prev,
      minPrice: "",
      maxPrice: "",
      inStock: false,
      keyword: "",
    }));
    // Clear keyword from URL
    setSearchParams({});
  }, [setSearchParams]);

  const clearSpecificFilter = (type: string, value?: string) => {
    switch (type) {
      case "category":
        handleCategoryChange(value!);
        break;
      case "subcategory":
        handleSubCategoryChange(value!);
        break;
      case "brand":
        handleBrandChange(value!);
        break;
      case "price":
        setTempPriceRange({ minPrice: "", maxPrice: "" });
        setFilters((prev) => ({
          ...prev,
          minPrice: "",
          maxPrice: "",
        }));
        break;
      case "inStock":
        setFilters((prev) => ({ ...prev, inStock: false }));
        break;
      case "keyword":
        setFilters((prev) => ({ ...prev, keyword: "" }));
        setSearchParams({});
        break;
    }
  };

  // Get filtered subcategories based on selected categories
  const availableSubCategories = subcategories.filter((sub) => {
    if (selectedCategories.length === 0) return false;
    const subCategoryId =
      typeof sub.category === "object" ? sub.category._id : sub.category;
    return selectedCategories.includes(subCategoryId);
  });

  return (
    <div className="container mx-auto px-4 py-3 sm:py-4 flex flex-col overflow-hidden" style={{ height: "calc(100dvh - 4rem)" }}>
      {/* Page Header */}
      <div className="flex-shrink-0 pb-2 sm:pb-3">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          {t("shop.header.title")}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {filters.keyword
            ? t("shop.header.searchResults", { query: filters.keyword })
            : t("shop.header.subtitle")}
        </p>
      </div>

      <div className="flex gap-4 sm:gap-8 flex-1 min-h-0">
        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0 overflow-y-auto custom-scroll">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {t("shop.filters.title")}
                </h2>
                {activeFilters > 0 && (
                  <Badge variant="secondary">{activeFilters}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <FiltersPanel
                categories={categories}
                categoriesLoading={categoriesLoading}
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
                selectedSubCategories={selectedSubCategories}
                availableSubCategories={availableSubCategories}
                subcategoriesLoading={subcategoriesLoading}
                subcategoriesError={subcategoriesError}
                onSubCategoryChange={handleSubCategoryChange}
                onRetrySubCategories={handleRetrySubCategories}
                brands={brands}
                brandsLoading={brandsLoading}
                selectedBrands={selectedBrands}
                onBrandChange={handleBrandChange}
                tempPriceRange={tempPriceRange}
                onTempPriceChange={handleTempPriceChange}
                onApplyPriceFilter={handleApplyPriceFilter}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                activeFilters={activeFilters}
                onClearFilters={clearFilters}
              />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          {/* Toolbar */}
          <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* Mobile Filters */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    {t("shop.filters.title")}
                    {activeFilters > 0 && (
                      <Badge className="ml-2" variant="secondary">
                        {activeFilters}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 sm:w-96">
                  <SheetHeader>
                    <SheetTitle>{t("shop.filters.title")}</SheetTitle>
                  </SheetHeader>
                  <div className=" px-6 pb-5 overflow-y-auto h-full">
                    <FiltersPanel
                      isMobile={true}
                      categories={categories}
                      categoriesLoading={categoriesLoading}
                      selectedCategories={selectedCategories}
                      onCategoryChange={handleCategoryChange}
                      selectedSubCategories={selectedSubCategories}
                      availableSubCategories={availableSubCategories}
                      subcategoriesLoading={subcategoriesLoading}
                      subcategoriesError={subcategoriesError}
                      onSubCategoryChange={handleSubCategoryChange}
                      onRetrySubCategories={handleRetrySubCategories}
                      brands={brands}
                      brandsLoading={brandsLoading}
                      selectedBrands={selectedBrands}
                      onBrandChange={handleBrandChange}
                      tempPriceRange={tempPriceRange}
                      onTempPriceChange={handleTempPriceChange}
                      onApplyPriceFilter={handleApplyPriceFilter}
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                      activeFilters={activeFilters}
                      onClearFilters={clearFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Results count */}
              <p className="text-sm text-muted-foreground">
                {pagination ? (
                  <>
                    {t("shop.results.showing")} {products?.length || 0}{" "}
                    {t("shop.results.of")} {pagination.totalResults || 0}{" "}
                    {t("shop.results.results")}
                  </>
                ) : (
                  t("shop.loading")
                )}
              </p>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* Sort */}
              <Select value={filters.sort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder={t("shop.sort.sortBy")} />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

            </div>
          </div>

          {/* Active Filters */}
          {activeFilters > 0 && (
            <div className="flex-shrink-0 flex flex-wrap gap-2 pb-3">
              {filters.keyword && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {t("shop.searchChip", { keyword: filters.keyword })}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => clearSpecificFilter("keyword")}
                  />
                </Badge>
              )}
              {selectedCategories.map((categoryId) => {
                const category = categories.find((c) => c._id === categoryId);
                return category ? (
                  <Badge
                    key={categoryId}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {category.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        clearSpecificFilter("category", categoryId)
                      }
                    />
                  </Badge>
                ) : null;
              })}
              {selectedSubCategories.map((subCategoryId) => {
                const subcategory = availableSubCategories.find(
                  (s) => s._id === subCategoryId
                );
                return subcategory ? (
                  <Badge
                    key={subCategoryId}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {subcategory.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        clearSpecificFilter("subcategory", subCategoryId)
                      }
                    />
                  </Badge>
                ) : null;
              })}
              {selectedBrands.map((brandId) => {
                const brand = brands.find((b) => b._id === brandId);
                return brand ? (
                  <Badge
                    key={brandId}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {brand.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => clearSpecificFilter("brand", brandId)}
                    />
                  </Badge>
                ) : null;
              })}
              {(filters.minPrice || filters.maxPrice) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {t("shop.filters.priceLabel")}: {filters.minPrice || "0"} -{" "}
                  {filters.maxPrice || "∞"}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => clearSpecificFilter("price")}
                  />
                </Badge>
              )}
              {filters.inStock && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {t("shop.filters.inStockOnly")}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => clearSpecificFilter("inStock")}
                  />
                </Badge>
              )}
            </div>
          )}

          {/* Scrollable Products Area */}
          <div ref={productsScrollRef} className="flex-1 overflow-y-auto min-h-0 custom-scroll">
          {/* Loading State */}
          {productsLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {t("shop.loadingProducts")}
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!productsLoading && productsError && (
            <div className="text-center py-12">
              <div className="mb-4">
                <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t("shop.errors.loadingProductsFailed")}
              </h3>
              <p className="text-muted-foreground mb-4 break-words">
                {productsError}
              </p>
              <Button onClick={handleRetryProducts} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("shop.retry")}
              </Button>
            </div>
          )}

          {/* Products Grid */}
          {!productsLoading && !productsError && products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
          ) : !productsLoading && !productsError ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {t("shop.noProducts.title")}
              </h3>
              <p className="text-muted-foreground mb-4">
                {filters.keyword
                  ? t("shop.noProducts.searchMessage", {
                      query: filters.keyword,
                    })
                  : t("shop.noProducts.message")}
              </p>
              {activeFilters > 0 && (
                <Button onClick={clearFilters} variant="outline">
                  {t("shop.noProducts.clearFilters")}
                </Button>
              )}
            </div>
          ) : null}

          {/* Infinite scroll sentinel + bottom states */}
          {!productsLoading && !productsError && products && products.length > 0 && (
            <>
              <div ref={sentinelRef} aria-hidden="true" className="h-px" />
              {loadingMore && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              )}
              {!loadingMore && loadMoreError && (
                <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                  <p className="text-sm text-destructive">
                    {t("shop.errors.loadMoreFailed")}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetryLoadMore}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    {t("shop.retry")}
                  </Button>
                </div>
              )}
              {!loadingMore && !loadMoreError && !hasMore && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {t("shop.reachedEnd")}
                </div>
              )}
            </>
          )}
          </div>
          {/* End Scrollable Products Area */}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
