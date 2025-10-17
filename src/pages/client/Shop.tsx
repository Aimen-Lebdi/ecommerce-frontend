/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, memo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import {
  Grid3X3,
  List,
  Star,
  Heart,
  ShoppingCart,
  Eye,
  X,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
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

// Import Redux actions
import { fetchProducts } from "../../features/products/productsSlice";
import { fetchCategories } from "../../features/categories/categoriesSlice";
import { fetchSubCategories } from "../../features/subCategories/subCategoriesSlice";
import { fetchBrands } from "../../features/brands/brandsSlice";
import { addProductToWishlist } from "../../features/wishlist/wishlistSlice";
import { toast } from "sonner";

// FiltersPanel component - MOVED OUTSIDE ShopPage
const FiltersPanel = memo(
  ({
    isMobile = false,
    categories,
    categoriesLoading,
    selectedCategories,
    onCategoryChange,
    selectedSubCategories,
    availableSubCategories,
    subcategoriesLoading,
    onSubCategoryChange,
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
            <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto custom-scroll">
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
            ) : availableSubCategories.length > 0 ? (
              <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto custom-scroll">
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
            <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto custom-scroll">
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
              {t("shop.filters.active")}: ${filters.minPrice || "0"} - $
              {filters.maxPrice || "∞"}
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
                id="on-sale"
                checked={filters.onSale}
                onCheckedChange={(checked) =>
                  onFiltersChange({ ...filters, onSale: checked, page: 1 })
                }
              />
              <Label htmlFor="on-sale" className="text-sm font-normal">
                {t("shop.filters.onSale")}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="in-stock"
                checked={filters.inStock}
                onCheckedChange={(checked) =>
                  onFiltersChange({ ...filters, inStock: checked, page: 1 })
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

const ShopPage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const sortOptions = [
    { value: "createdAt", label: t("shop.sort.newestFirst") },
    { value: "-createdAt", label: t("shop.sort.oldestFirst") },
    { value: "price", label: t("shop.sort.priceLowToHigh") },
    { value: "-price", label: t("shop.sort.priceHighToLow") },
    { value: "-rating", label: t("shop.sort.highestRated") },
    { value: "-sold", label: t("shop.sort.mostPopular") },
    { value: "name", label: t("shop.sort.nameAToZ") },
    { value: "-name", label: t("shop.sort.nameZToA") },
  ];

  // Redux state
  const {
    products,
    pagination,
    loading: productsLoading,
  } = useSelector((state) => state.products);
  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.categories
  );
  const { subcategories, loading: subcategoriesLoading } = useSelector(
    (state) => state.subCategories
  );
  const { brands, loading: brandsLoading } = useSelector(
    (state) => state.brands
  );

  // Local state
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sort: "-sold",
    category: "",
    subCategory: "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    inStock: false,
    onSale: false,
    keyword: "",
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [activeFilters, setActiveFilters] = useState(0);
  const [tempPriceRange, setTempPriceRange] = useState({
    minPrice: "",
    maxPrice: "",
  });

  // Get keyword from URL on mount and when URL changes
  useEffect(() => {
    const keywordFromUrl = searchParams.get("keyword");
    if (keywordFromUrl) {
      setFilters((prev) => ({ ...prev, keyword: keywordFromUrl, page: 1 }));
    }
  }, [searchParams]);

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch]);

  // Fetch subcategories when categories change
  useEffect(() => {
    if (selectedCategories.length > 0) {
      const categoryIds = selectedCategories.join(",");
      dispatch(fetchSubCategories({ category: categoryIds, limit: 100 }));
    } else {
      setSelectedSubCategories([]);
    }
  }, [selectedCategories, dispatch]);

  // Fetch products when filters change
  useEffect(() => {
    const queryParams = {
      page: filters.page,
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
      queryParams["price[gte]"] = filters.minPrice;
    }
    if (filters.maxPrice) {
      queryParams["price[lte]"] = filters.maxPrice;
    }

    if (filters.inStock) {
      queryParams["quantity[gt]"] = 0;
    }

    if (filters.onSale) {
      queryParams.priceAfterDiscount = "exists";
    }

    dispatch(fetchProducts(queryParams));
  }, [
    filters,
    selectedCategories,
    selectedSubCategories,
    selectedBrands,
    dispatch,
  ]);

  // Count active filters
  useEffect(() => {
    let count = 0;
    if (selectedCategories.length > 0) count++;
    if (selectedSubCategories.length > 0) count++;
    if (selectedBrands.length > 0) count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.inStock) count++;
    if (filters.onSale) count++;
    if (filters.keyword) count++;
    setActiveFilters(count);
  }, [selectedCategories, selectedSubCategories, selectedBrands, filters]);

  // Callbacks wrapped with useCallback
  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId]
    );
    setSelectedSubCategories([]);
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleSubCategoryChange = useCallback((subCategoryId) => {
    setSelectedSubCategories((prev) =>
      prev.includes(subCategoryId)
        ? prev.filter((s) => s !== subCategoryId)
        : [...prev, subCategoryId]
    );
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleBrandChange = useCallback((brandId) => {
    setSelectedBrands((prev) =>
      prev.includes(brandId)
        ? prev.filter((b) => b !== brandId)
        : [...prev, brandId]
    );
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, []);

  const handleTempPriceChange = useCallback((field, value) => {
    setTempPriceRange((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleApplyPriceFilter = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      minPrice: tempPriceRange.minPrice,
      maxPrice: tempPriceRange.maxPrice,
      page: 1,
    }));
  }, [tempPriceRange]);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleSortChange = (sortValue) => {
    setFilters((prev) => ({ ...prev, sort: sortValue, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
      onSale: false,
      keyword: "",
      page: 1,
    }));
    // Clear keyword from URL
    setSearchParams({});
  }, [setSearchParams]);

  const clearSpecificFilter = (type, value) => {
    switch (type) {
      case "category":
        handleCategoryChange(value);
        break;
      case "subcategory":
        handleSubCategoryChange(value);
        break;
      case "brand":
        handleBrandChange(value);
        break;
      case "price":
        setTempPriceRange({ minPrice: "", maxPrice: "" });
        setFilters((prev) => ({
          ...prev,
          minPrice: "",
          maxPrice: "",
          page: 1,
        }));
        break;
      case "inStock":
        setFilters((prev) => ({ ...prev, inStock: false, page: 1 }));
        break;
      case "onSale":
        setFilters((prev) => ({ ...prev, onSale: false, page: 1 }));
        break;
      case "keyword":
        setFilters((prev) => ({ ...prev, keyword: "", page: 1 }));
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

  const ProductCard = ({ product }) => {
    const discountPrice = product.priceAfterDiscount || product.price;
    const hasDiscount =
      product.priceAfterDiscount && product.priceAfterDiscount < product.price;
    const discountPercentage = hasDiscount
      ? Math.round(
          ((product.price - product.priceAfterDiscount) / product.price) * 100
        )
      : 0;

    return (
      <Link to={`/product/${product._id}`} className="block h-full">
        <Card className="group hover:shadow-lg transition-all duration-300 h-full flex flex-col cursor-pointer">
          <CardHeader className="p-0 flex-shrink-0">
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={
                  product.mainImage ||
                  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop"
                }
                alt={product.name}
                className="w-full h-36 sm:h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity sm:opacity-100 sm:group-hover:scale-110">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-7 w-7 bg-white/90 hover:bg-white"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try {
                      await dispatch(
                        addProductToWishlist(product._id)
                      ).unwrap();
                      toast.success(
                        t("shop.product.addedToWishlist", {
                          productName: product.name,
                        })
                      );
                    } catch (err: any) {
                      toast.error(
                        err || t("shop.product.failedToAddToWishlist")
                      );
                    }
                  }}
                >
                  <Heart className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-7 w-7 bg-white/90 hover:bg-white"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Eye className="h-4 w-4" />
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
            <div className="flex items-center mb-2">
              <div className="flex items-center mr-2">
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
              <span className="text-xs text-muted-foreground hidden sm:inline">
                ({product.ratingsQuantity || 0})
              </span>
              <span className="text-xs text-muted-foreground sm:hidden">
                (
                {product.ratingsQuantity > 1000
                  ? `${Math.floor(product.ratingsQuantity / 1000)}k`
                  : product.ratingsQuantity || 0}
                )
              </span>
            </div>
            <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
              <span className="text-base sm:text-lg font-bold">
                {discountPrice} DA
              </span>
              {hasDiscount && (
                <span className="text-xs sm:text-sm text-muted-foreground line-through">
                  {product.price} DA
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span
                className={`text-xs ${
                  product.quantity > 0 ? "text-green-600" : "text-red-600"
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
  };

  const ProductCardList = ({ product }) => {
    const discountPrice = product.priceAfterDiscount || product.price;
    const hasDiscount =
      product.priceAfterDiscount && product.priceAfterDiscount < product.price;
    const discountPercentage = hasDiscount
      ? Math.round(
          ((product.price - product.priceAfterDiscount) / product.price) * 100
        )
      : 0;

    return (
      <Card className="group hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative overflow-hidden rounded-lg flex-shrink-0">
              <img
                src={
                  product.mainImage ||
                  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop"
                }
                alt={product.name}
                className="w-24 h-24 sm:w-32 sm:h-32 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-1 left-1 flex flex-wrap gap-1">
                {hasDiscount && (
                  <Badge className="bg-red-600 hover:bg-red-700 text-xs px-1 py-0.5">
                    -{discountPercentage}%
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-1 mb-1">
                    {product.brand?.name && (
                      <Badge variant="outline" className="text-xs">
                        {product.brand.name}
                      </Badge>
                    )}
                    {product.category?.name && (
                      <Badge variant="outline" className="text-xs">
                        {product.category.name}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-2">
                    {product.name}
                  </h3>
                </div>
                <div className="flex gap-1 sm:gap-2 ml-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 sm:h-8 sm:w-8"
                  >
                    <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 sm:h-8 sm:w-8"
                  >
                    <Link to={`/product/${product._id}`}>
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center mb-2">
                <div className="flex items-center mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 sm:h-4 sm:w-4 ${
                        i < Math.floor(product.rating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({product.ratingsQuantity || 0} {t("shop.product.reviews")})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg sm:text-xl font-bold">
                      {discountPrice} DA
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-muted-foreground line-through">
                        {product.price} DA
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      product.quantity > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {product.quantity > 0
                      ? t("shop.product.inStock", {
                          quantity: product.quantity,
                        })
                      : t("shop.product.outOfStock")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const generatePaginationPages = () => {
    if (!pagination) return [];

    const { currentPage, numberOfPages } = pagination;
    const pages = [];
    const maxVisiblePages = 5;

    if (numberOfPages <= maxVisiblePages) {
      for (let i = 1; i <= numberOfPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(numberOfPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < numberOfPages - 2) {
        pages.push("...");
      }

      if (!pages.includes(numberOfPages)) {
        pages.push(numberOfPages);
      }
    }

    return pages;
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          {t("shop.header.title")}
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          {filters.keyword
            ? t("shop.header.searchResults", { query: filters.keyword })
            : t("shop.header.subtitle")}
        </p>
      </div>

      <div className="flex gap-4 sm:gap-8">
        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
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
                onSubCategoryChange={handleSubCategoryChange}
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
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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
                      onSubCategoryChange={handleSubCategoryChange}
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

              {/* View Toggle */}
              <div className="flex border rounded-md p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {filters.keyword && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{filters.keyword}"
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
              {filters.onSale && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {t("shop.filters.onSale")}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => clearSpecificFilter("onSale")}
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

          {/* Products Grid/List */}
          {!productsLoading && products && products.length > 0 ? (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4 mb-8">
                  {products.map((product) => (
                    <ProductCardList key={product._id} product={product} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {pagination && pagination.numberOfPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t">
                  <div className="text-sm text-muted-foreground order-2 sm:order-1">
                    {t("shop.pagination.showingPage")} {pagination.currentPage}{" "}
                    {t("shop.pagination.of")} {pagination.numberOfPages}
                  </div>

                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={!pagination.previousPage}
                      className="hidden sm:flex"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      {t("shop.pagination.previous")}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      disabled={!pagination.previousPage}
                      className="sm:hidden"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {generatePaginationPages().map((page, index) =>
                      page === "..." ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-2 text-muted-foreground"
                        >
                          ...
                        </span>
                      ) : (
                        <Button
                          key={page}
                          variant={
                            pagination.currentPage === page
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="min-w-[40px]"
                        >
                          {page}
                        </Button>
                      )
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={!pagination.nextPage}
                      className="hidden sm:flex"
                    >
                      {t("shop.pagination.next")}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      disabled={!pagination.nextPage}
                      className="sm:hidden"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : !productsLoading ? (
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
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
