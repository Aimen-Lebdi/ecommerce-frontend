import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  ShoppingCart, 
  Heart, 
  Eye,
  ArrowRight,
  Truck,
  Shield,
  RotateCcw,
  Headphones,
  Quote
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';

// Mock data
const heroSlides = [
  {
    id: 1,
    title: "Summer Sale 2024",
    subtitle: "Up to 70% Off Electronics",
    description: "Don't miss out on amazing deals on smartphones, laptops, and more!",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
    cta: "Shop Now",
    badge: "Limited Time"
  },
  {
    id: 2,
    title: "New iPhone 15 Pro",
    subtitle: "Revolutionary Performance",
    description: "Experience the power of A17 Pro chip with titanium design.",
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&h=600&fit=crop",
    cta: "Pre-Order Now",
    badge: "New Launch"
  },
  {
    id: 3,
    title: "Gaming Collection",
    subtitle: "Level Up Your Setup",
    description: "Premium gaming gear for the ultimate gaming experience.",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=600&fit=crop",
    cta: "Explore Gaming",
    badge: "Gaming Week"
  }
];

const categories = [
  { name: "Smartphones", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop", count: "250+ items" },
  { name: "Laptops", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop", count: "180+ items" },
  { name: "Headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop", count: "120+ items" },
  { name: "Gaming", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop", count: "95+ items" },
  { name: "Cameras", image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=200&h=200&fit=crop", count: "85+ items" },
  { name: "Smart Home", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop", count: "75+ items" }
];

const featuredProducts = [
  {
    id: 1,
    name: "Sony WH-1000XM5",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
    price: 349.99,
    originalPrice: 399.99,
    rating: 4.8,
    reviews: 2847,
    badge: "Best Seller",
    inStock: true
  },
  {
    id: 2,
    name: "iPhone 15 Pro Max",
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&h=300&fit=crop",
    price: 1199.99,
    originalPrice: null,
    rating: 4.9,
    reviews: 1523,
    badge: "New",
    inStock: true
  },
  {
    id: 3,
    name: "MacBook Pro 16\"",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop",
    price: 2399.99,
    originalPrice: 2699.99,
    rating: 4.7,
    reviews: 892,
    badge: "Sale",
    inStock: false
  },
  {
    id: 4,
    name: "Samsung Galaxy S24",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
    price: 899.99,
    originalPrice: 999.99,
    rating: 4.6,
    reviews: 1247,
    badge: "Hot Deal",
    inStock: true
  }
];

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b332-1c3f?w=100&h=100&fit=crop",
    rating: 5,
    text: "Amazing service and fast delivery! The product quality exceeded my expectations.",
    product: "iPhone 15 Pro"
  },
  {
    id: 2,
    name: "Mike Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    rating: 5,
    text: "Great prices and excellent customer support. Will definitely shop here again!",
    product: "Sony Headphones"
  },
  {
    id: 3,
    name: "Emily Davis",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    rating: 5,
    text: "The shopping experience was smooth and the product arrived exactly as described.",
    product: "MacBook Pro"
  }
];

const blogPosts = [
  {
    id: 1,
    title: "The Future of Mobile Technology in 2024",
    excerpt: "Discover the latest trends and innovations shaping the smartphone industry.",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=250&fit=crop",
    date: "Dec 15, 2024",
    readTime: "5 min read",
    category: "Technology"
  },
  {
    id: 2,
    title: "Ultimate Guide to Gaming Setups",
    excerpt: "Everything you need to know about building the perfect gaming station.",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=250&fit=crop",
    date: "Dec 12, 2024",
    readTime: "8 min read",
    category: "Gaming"
  },
  {
    id: 3,
    title: "Smart Home Automation Tips",
    excerpt: "Transform your home with these smart automation ideas and products.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
    date: "Dec 10, 2024",
    readTime: "6 min read",
    category: "Smart Home"
  }
];

// Hero Section Component
const HeroSection = () => {
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
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-2xl mb-12">
      <div className="relative w-full h-full">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative w-full h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white max-w-2xl px-6">
                  <Badge className="mb-4 bg-red-600 hover:bg-red-700">
                    {slide.badge}
                  </Badge>
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    {slide.title}
                  </h1>
                  <h2 className="text-xl md:text-2xl mb-4 text-gray-200">
                    {slide.subtitle}
                  </h2>
                  <p className="text-lg mb-8 text-gray-300">
                    {slide.description}
                  </p>
                  <Button size="lg" className="text-lg px-8 py-4">
                    {slide.cta}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
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

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: <Truck className="h-8 w-8" />,
      title: "Free Shipping",
      description: "Free shipping on all orders over $50"
    },
    {
      icon: <RotateCcw className="h-8 w-8" />,
      title: "Easy Returns",
      description: "30-day hassle-free return policy"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure Payment",
      description: "Your payments are safe and encrypted"
    },
    {
      icon: <Headphones className="h-8 w-8" />,
      title: "24/7 Support",
      description: "Round-the-clock customer service"
    }
  ];

  return (
    <section className="py-12 bg-muted/30 rounded-2xl mb-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Categories Section
const CategoriesSection = () => {
  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
        <p className="text-muted-foreground text-lg">
          Discover our wide range of product categories
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category, index) => (
          <Card key={index} className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-4 text-center">
              <div className="w-full h-32 mb-4 overflow-hidden rounded-lg">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="font-semibold mb-1">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

// Featured Products Section
const FeaturedProductsSection = () => {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
          <p className="text-muted-foreground">Our best-selling and most popular items</p>
        </div>
        <Button variant="outline">
          View All <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredProducts.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="p-0">
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge 
                  className="absolute top-3 left-3" 
                  variant={product.badge === 'Sale' ? 'destructive' : product.badge === 'New' ? 'default' : 'secondary'}
                >
                  {product.badge}
                </Badge>
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="outline" className="h-8 w-8 bg-white/80 hover:bg-white">
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="outline" className="h-8 w-8 bg-white/80 hover:bg-white">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
              <div className="flex items-center mb-2">
                <div className="flex items-center mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({product.reviews})</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl font-bold">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
                <Button size="sm" disabled={!product.inStock}>
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  return (
    <section className="py-12 bg-muted/30 rounded-2xl mb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-muted-foreground text-lg">
            Don't take our word for it - see what our satisfied customers have to say
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
                      className={`h-4 w-4 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center justify-center gap-3">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">Verified Buyer - {testimonial.product}</p>
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
  const [email, setEmail] = useState('');

  return (
    <section className="py-12 bg-primary text-primary-foreground rounded-2xl mb-12">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
        <p className="text-xl mb-8 opacity-90">
          Subscribe to our newsletter for exclusive deals and latest updates
        </p>
        <div className="max-w-md mx-auto flex gap-4">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white text-black"
          />
          <Button variant="secondary" size="lg">
            Subscribe
          </Button>
        </div>
        <p className="text-sm opacity-75 mt-4">
          No spam, unsubscribe at any time. We respect your privacy.
        </p>
      </div>
    </section>
  );
};

// Blog Section
const BlogSection = () => {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Latest From Our Blog</h2>
          <p className="text-muted-foreground">Stay informed with our latest articles and insights</p>
        </div>
        <Button variant="outline">
          View All Posts <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <Card key={post.id} className="group hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="p-0">
              <div className="overflow-hidden rounded-t-lg">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="secondary">{post.category}</Badge>
                <span className="text-sm text-muted-foreground">{post.readTime}</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{post.date}</span>
                <Button variant="ghost" size="sm">
                  Read More <ArrowRight className="ml-1 h-3 w-3" />
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
      <FeaturesSection />
      <CategoriesSection />
      <FeaturedProductsSection />
      <TestimonialsSection />
      <NewsletterSection />
      <BlogSection />
    </div>
  );
};

export default Homepage;