import { useState, useEffect } from 'react';
import { 
  Grid3X3, 
  List, 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye,
  X,
  SlidersHorizontal,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { Label } from '../../components/ui/label';
import { Slider } from '../../components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet';
import { Link } from 'react-router-dom';


// Mock data for products
export const mockProducts = [
  {
    id: 1,
    name: "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
    price: 349.99,
    originalPrice: 399.99,
    rating: 4.8,
    reviews: 2847,
    brand: "Sony",
    category: "Headphones",
    tags: ["wireless", "noise-canceling", "premium"],
    inStock: true,
    isNew: false,
    isOnSale: true
  },
  {
    id: 2,
    name: "iPhone 15 Pro Max 256GB",
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&h=300&fit=crop",
    price: 1199.99,
    originalPrice: null,
    rating: 4.9,
    reviews: 1523,
    brand: "Apple",
    category: "Smartphones",
    tags: ["smartphone", "premium", "ios"],
    inStock: true,
    isNew: true,
    isOnSale: false
  },
  {
    id: 3,
    name: "MacBook Pro 16-inch M3 Pro",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop",
    price: 2399.99,
    originalPrice: 2699.99,
    rating: 4.7,
    reviews: 892,
    brand: "Apple",
    category: "Laptops",
    tags: ["laptop", "professional", "m3"],
    inStock: false,
    isNew: false,
    isOnSale: true
  },
  {
    id: 4,
    name: "Samsung Galaxy S24 Ultra",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
    price: 899.99,
    originalPrice: 999.99,
    rating: 4.6,
    reviews: 1247,
    brand: "Samsung",
    category: "Smartphones",
    tags: ["android", "camera", "flagship"],
    inStock: true,
    isNew: false,
    isOnSale: true
  },
  {
    id: 5,
    name: "Dell XPS 13 Plus",
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&h=300&fit=crop",
    price: 1299.99,
    originalPrice: null,
    rating: 4.5,
    reviews: 654,
    brand: "Dell",
    category: "Laptops",
    tags: ["ultrabook", "business", "portable"],
    inStock: true,
    isNew: false,
    isOnSale: false
  },
  {
    id: 6,
    name: "AirPods Pro 2nd Generation",
    image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=300&h=300&fit=crop",
    price: 249.99,
    originalPrice: 279.99,
    rating: 4.7,
    reviews: 3421,
    brand: "Apple",
    category: "Headphones",
    tags: ["wireless", "earbuds", "anc"],
    inStock: true,
    isNew: false,
    isOnSale: true
  },
  {
    id: 7,
    name: "Google Pixel 8 Pro",
    image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=300&fit=crop",
    price: 799.99,
    originalPrice: null,
    rating: 4.4,
    reviews: 876,
    brand: "Google",
    category: "Smartphones",
    tags: ["android", "ai", "camera"],
    inStock: true,
    isNew: true,
    isOnSale: false
  },
  {
    id: 8,
    name: "Lenovo ThinkPad X1 Carbon",
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300&h=300&fit=crop",
    price: 1899.99,
    originalPrice: 2199.99,
    rating: 4.6,
    reviews: 432,
    brand: "Lenovo",
    category: "Laptops",
    tags: ["business", "lightweight", "professional"],
    inStock: true,
    isNew: false,
    isOnSale: true
  }
];

const categories = ["All Categories", "Smartphones", "Laptops", "Headphones"];
const brands = ["All Brands", "Apple", "Samsung", "Sony", "Dell", "Google", "Lenovo"];
const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest First" }
];

const ShopPage = () => {
  const [products, setProducts] = useState(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(6);
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [showOnSale, setShowOnSale] = useState(false);
  const [showInStock, setShowInStock] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState(0);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes('All Categories')) {
      filtered = filtered.filter(product => selectedCategories.includes(product.category));
    }

    // Brand filter
    if (selectedBrands.length > 0 && !selectedBrands.includes('All Brands')) {
      filtered = filtered.filter(product => selectedBrands.includes(product.brand));
    }

    // Price range filter
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // On sale filter
    if (showOnSale) {
      filtered = filtered.filter(product => product.isOnSale);
    }

    // In stock filter
    if (showInStock) {
      filtered = filtered.filter(product => product.inStock);
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => b.isNew - a.isNew);
        break;
      default:
        filtered.sort((a, b) => b.reviews - a.reviews);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);

    // Count active filters
    let filterCount = 0;
    if (selectedCategories.length > 0) filterCount++;
    if (selectedBrands.length > 0) filterCount++;
    if (priceRange[0] > 0 || priceRange[1] < 3000) filterCount++;
    if (showOnSale) filterCount++;
    if (showInStock) filterCount++;
    setActiveFilters(filterCount);
  }, [products, selectedCategories, selectedBrands, priceRange, showOnSale, showInStock, sortBy, searchQuery]);

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleBrandChange = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, 3000]);
    setShowOnSale(false);
    setShowInStock(false);
    setSearchQuery('');
  };

  const FiltersPanel = ({ isMobile = false }) => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Search Products</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Categories</Label>
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleCategoryChange(category)}
              />
              <Label htmlFor={`category-${category}`} className="text-sm font-normal">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Brands</Label>
        <div className="space-y-2">
          {brands.map(brand => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => handleBrandChange(brand)}
              />
              <Label htmlFor={`brand-${brand}`} className="text-sm font-normal">
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Price Range</Label>
        <div className="px-3">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={3000}
            min={0}
            step={50}
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      {/* Special Filters */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Special Offers</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="on-sale"
              checked={showOnSale}
              onCheckedChange={setShowOnSale}
            />
            <Label htmlFor="on-sale" className="text-sm font-normal">
              On Sale
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="in-stock"
              checked={showInStock}
              onCheckedChange={setShowInStock}
            />
            <Label htmlFor="in-stock" className="text-sm font-normal">
              In Stock Only
            </Label>
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {activeFilters > 0 && (
        <Button 
          variant="outline" 
          onClick={clearFilters}
          className="w-full"
        >
          Clear All Filters ({activeFilters})
        </Button>
      )}
    </div>
  );

  const ProductCard = ({ product }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <CardHeader className="p-0 flex-shrink-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-36 sm:h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {product.isNew && (
              <Badge className="bg-green-600 hover:bg-green-700 text-xs px-1.5 py-0.5">New</Badge>
            )}
            {product.isOnSale && (
              <Badge className="bg-red-600 hover:bg-red-700 text-xs px-1.5 py-0.5">Sale</Badge>
            )}
          </div>
          <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity sm:opacity-100 sm:group-hover:scale-110">
            <Button size="icon" variant="outline" className="h-7 w-7 bg-white/90 hover:bg-white">
              <Heart className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="outline" className="h-7 w-7 bg-white/90 hover:bg-white">
              <Link to={`/product/${product.id}`}>
              <Eye className="h-4 w-4" />
              </Link>
              {/* <Eye className="h-3 w-3" /> */}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 flex-1 flex flex-col">
        <div className="mb-1.5">
          <Badge variant="outline" className="text-xs px-1.5 py-0.5">
            {product.brand}
          </Badge>
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
                  i < Math.floor(product.rating) 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-300'
                }`} 
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">({product.reviews})</span>
          <span className="text-xs text-muted-foreground sm:hidden">({product.reviews > 1000 ? `${Math.floor(product.reviews/1000)}k` : product.reviews})</span>
        </div>
        <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
          <span className="text-base sm:text-lg font-bold">${product.price}</span>
          {product.originalPrice && (
            <span className="text-xs sm:text-sm text-muted-foreground line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-auto">
          <span className={`text-xs ${
            product.inStock ? 'text-green-600' : 'text-red-600'
          }`}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
          <Button size="sm" disabled={!product.inStock} className="text-xs px-2 py-1 h-7 sm:h-8">
            <ShoppingCart className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">Add to Cart</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const ProductCardList = ({ product }) => (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative overflow-hidden rounded-lg flex-shrink-0">
            <img
              src={product.image}
              alt={product.name}
              className="w-32 h-32 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 left-2 flex flex-wrap gap-1">
              {product.isNew && (
                <Badge className="bg-green-600 hover:bg-green-700 text-xs">New</Badge>
              )}
              {product.isOnSale && (
                <Badge className="bg-red-600 hover:bg-red-700 text-xs">Sale</Badge>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <Badge variant="outline" className="text-xs mb-1">
                  {product.brand}
                </Badge>
                <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                  {product.name}
                </h3>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" className="h-8 w-8">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="outline" className="h-8 w-8">
                  <Link to={`/product/${product.id}`}>
                  <Eye className="h-4 w-4" />
                  </Link>
                  
                </Button>
              </div>
            </div>
            <div className="flex items-center mb-2">
              <div className="flex items-center mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating) 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl font-bold">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>
                <span className={`text-sm ${
                  product.inStock ? 'text-green-600' : 'text-red-600'
                }`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <Button disabled={!product.inStock}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shop All Products</h1>
        <p className="text-muted-foreground">
          Discover our complete collection of premium electronics and accessories
        </p>
      </div>

      <div className="flex gap-8">
        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Filters</h2>
                {activeFilters > 0 && (
                  <Badge variant="secondary">{activeFilters}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <FiltersPanel />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* Mobile Filters */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                    {activeFilters > 0 && (
                      <Badge className="ml-2" variant="secondary">
                        {activeFilters}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FiltersPanel isMobile={true} />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Results count */}
              <p className="text-sm text-muted-foreground">
                Showing {currentProducts.length} of {filteredProducts.length} results
              </p>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex border rounded-md p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedCategories.length > 0 || selectedBrands.length > 0 || showOnSale || showInStock || searchQuery) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{searchQuery}"
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </Badge>
              )}
              {selectedCategories.map(category => (
                <Badge key={category} variant="secondary" className="flex items-center gap-1">
                  {category}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleCategoryChange(category)} 
                  />
                </Badge>
              ))}
              {selectedBrands.map(brand => (
                <Badge key={brand} variant="secondary" className="flex items-center gap-1">
                  {brand}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleBrandChange(brand)} 
                  />
                </Badge>
              ))}
              {showOnSale && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  On Sale
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setShowOnSale(false)} />
                </Badge>
              )}
              {showInStock && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  In Stock
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setShowInStock(false)} />
                </Badge>
              )}
            </div>
          )}

          {/* Products Grid/List */}
          {currentProducts.length > 0 ? (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {currentProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4 mb-8">
                  {currentProducts.map(product => (
                    <ProductCardList key={product.id} product={product} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i + 1}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
                      className="min-w-[40px]"
                    >
                      {i + 1}
                    </Button>
                  ))}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="mb-4">
                <Search className="h-12 w-12 mx-auto text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search terms
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;