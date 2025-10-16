import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
    title: "home.hero.slides.summerSale.title",
    subtitle: "home.hero.slides.summerSale.subtitle",
    description: "home.hero.slides.summerSale.description",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
    cta: "home.hero.slides.summerSale.cta",
    badge: "home.hero.slides.summerSale.badge"
  },
  {
    id: 2,
    title: "home.hero.slides.iphone.title",
    subtitle: "home.hero.slides.iphone.subtitle",
    description: "home.hero.slides.iphone.description",
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&h=600&fit=crop",
    cta: "home.hero.slides.iphone.cta",
    badge: "home.hero.slides.iphone.badge"
  },
  {
    id: 3,
    title: "home.hero.slides.gaming.title",
    subtitle: "home.hero.slides.gaming.subtitle",
    description: "home.hero.slides.gaming.description",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=600&fit=crop",
    cta: "home.hero.slides.gaming.cta",
    badge: "home.hero.slides.gaming.badge"
  }
];

const categories = [
  { name: "home.categories.smartphones", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop", count: "home.categories.smartphonesCount" },
  { name: "home.categories.laptops", image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop", count: "home.categories.laptopsCount" },
  { name: "home.categories.headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop", count: "home.categories.headphonesCount" },
  { name: "home.categories.gaming", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&h=200&fit=crop", count: "home.categories.gamingCount" },
  { name: "home.categories.cameras", image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=200&h=200&fit=crop", count: "home.categories.camerasCount" },
  { name: "home.categories.smartHome", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop", count: "home.categories.smartHomeCount" }
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
    badge: "home.products.badges.bestSeller",
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
    badge: "home.products.badges.new",
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
    badge: "home.products.badges.sale",
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
    badge: "home.products.badges.hotDeal",
    inStock: true
  }
];

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b332-1c3f?w=100&h=100&fit=crop",
    rating: 5,
    text: "home.testimonials.items.sarah.text",
    product: "home.testimonials.items.sarah.product"
  },
  {
    id: 2,
    name: "Mike Chen",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    rating: 5,
    text: "home.testimonials.items.mike.text",
    product: "home.testimonials.items.mike.product"
  },
  {
    id: 3,
    name: "Emily Davis",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    rating: 5,
    text: "home.testimonials.items.emily.text",
    product: "home.testimonials.items.emily.product"
  }
];

const blogPosts = [
  {
    id: 1,
    title: "home.blog.posts.mobileTech.title",
    excerpt: "home.blog.posts.mobileTech.excerpt",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=250&fit=crop",
    date: "home.blog.posts.mobileTech.date",
    readTime: "home.blog.posts.mobileTech.readTime",
    category: "home.blog.posts.mobileTech.category"
  },
  {
    id: 2,
    title: "home.blog.posts.gamingSetup.title",
    excerpt: "home.blog.posts.gamingSetup.excerpt",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=250&fit=crop",
    date: "home.blog.posts.gamingSetup.date",
    readTime: "home.blog.posts.gamingSetup.readTime",
    category: "home.blog.posts.gamingSetup.category"
  },
  {
    id: 3,
    title: "home.blog.posts.smartHome.title",
    excerpt: "home.blog.posts.smartHome.excerpt",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
    date: "home.blog.posts.smartHome.date",
    readTime: "home.blog.posts.smartHome.readTime",
    category: "home.blog.posts.smartHome.category"
  }
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
  const { t } = useTranslation();
  
  const features = [
    {
      icon: <Truck className="h-8 w-8" />,
      title: "home.features.freeShipping.title",
      description: "home.features.freeShipping.description"
    },
    {
      icon: <RotateCcw className="h-8 w-8" />,
      title: "home.features.easyReturns.title",
      description: "home.features.easyReturns.description"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "home.features.securePayment.title",
      description: "home.features.securePayment.description"
    },
    {
      icon: <Headphones className="h-8 w-8" />,
      title: "home.features.support.title",
      description: "home.features.support.description"
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
              <h3 className="font-semibold text-lg mb-2">{t(feature.title)}</h3>
              <p className="text-muted-foreground text-sm">{t(feature.description)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Categories Section
const CategoriesSection = () => {
  const { t } = useTranslation();
  
  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">{t('home.categories.title')}</h2>
        <p className="text-muted-foreground text-lg">
          {t('home.categories.subtitle')}
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category, index) => (
          <Card key={index} className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-4 text-center">
              <div className="w-full h-32 mb-4 overflow-hidden rounded-lg">
                <img
                  src={category.image}
                  alt={t(category.name)}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h3 className="font-semibold mb-1">{t(category.name)}</h3>
              <p className="text-sm text-muted-foreground">{t(category.count)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

// Featured Products Section
const FeaturedProductsSection = () => {
  const { t } = useTranslation();
  
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">{t('home.products.title')}</h2>
          <p className="text-muted-foreground">{t('home.products.subtitle')}</p>
        </div>
        <Button variant="outline">
          {t('home.products.viewAll')} <ArrowRight className="ml-2 h-4 w-4" />
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
                  variant={product.badge === 'home.products.badges.sale' ? 'destructive' : product.badge === 'home.products.badges.new' ? 'default' : 'secondary'}
                >
                  {t(product.badge)}
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
                  {product.inStock ? t('home.products.inStock') : t('home.products.outOfStock')}
                </span>
                <Button size="sm" disabled={!product.inStock}>
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  {t('home.products.addToCart')}
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
  const { t } = useTranslation();
  
  return (
    <section className="py-12 bg-muted/30 rounded-2xl mb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">{t('home.testimonials.title')}</h2>
          <p className="text-muted-foreground text-lg">
            {t('home.testimonials.subtitle')}
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
                <p className="text-muted-foreground mb-4 italic">"{t(testimonial.text)}"</p>
                <div className="flex items-center justify-center gap-3">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{t('home.testimonials.verifiedBuyer')} - {t(testimonial.product)}</p>
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
  const [email, setEmail] = useState('');

  return (
    <section className="py-12 bg-primary text-primary-foreground rounded-2xl mb-12">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">{t('home.newsletter.title')}</h2>
        <p className="text-xl mb-8 opacity-90">
          {t('home.newsletter.subtitle')}
        </p>
        <div className="max-w-md mx-auto flex gap-4">
          <Input
            type="email"
            placeholder={t('home.newsletter.placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white text-black"
          />
          <Button variant="secondary" size="lg">
            {t('home.newsletter.button')}
          </Button>
        </div>
        <p className="text-sm opacity-75 mt-4">
          {t('home.newsletter.privacyNote')}
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
          <h2 className="text-3xl font-bold mb-2">{t('home.blog.title')}</h2>
          <p className="text-muted-foreground">{t('home.blog.subtitle')}</p>
        </div>
        <Button variant="outline">
          {t('home.blog.viewAll')} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <Card key={post.id} className="group hover:shadow-lg transition-shadow duration-300">
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
                <span className="text-sm text-muted-foreground">{t(post.readTime)}</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">{t(post.title)}</h3>
              <p className="text-muted-foreground mb-4 line-clamp-2">{t(post.excerpt)}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t(post.date)}</span>
                <Button variant="ghost" size="sm">
                  {t('home.blog.readMore')} <ArrowRight className="ml-1 h-3 w-3" />
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