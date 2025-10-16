import { useEffect, useState } from "react";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  Globe,
  ChevronDown,
  LogOut,
  Settings,
  Package,
  Shield,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../../ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../../ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "../../ui/sheet";
import { ModeToggle } from "../../mode-toggle";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { signOut } from "../../../features/auth/authSlice";
import { useTranslation } from "react-i18next";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  const handleSignOut = () => {
    dispatch(signOut());
    navigate("/sign-in");
  };

  // Language change handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // Update HTML dir and lang attributes
    const htmlElement = document.documentElement;
    if (lng === 'ar') {
      htmlElement.setAttribute('dir', 'rtl');
      htmlElement.setAttribute('lang', 'ar');
    } else {
      htmlElement.setAttribute('dir', 'ltr');
      htmlElement.setAttribute('lang', lng);
    }
    
    // Save preference to localStorage
    localStorage.setItem('preferred-language', lng);
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && savedLanguage !== i18n.language) {
      changeLanguage(savedLanguage);
    } else if (i18n.language === 'ar') {
      // Ensure dir is set if current language is Arabic
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    }
  }, [changeLanguage, i18n.language]);

  // Get current language code
  const getCurrentLanguageCode = () => {
    const lang = i18n.language;
    if (lang.startsWith('en')) return 'EN';
    if (lang.startsWith('fr')) return 'FR';
    if (lang.startsWith('ar')) return 'AR';
    return 'EN';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar - Promotional */}
      <div className="border-b bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex h-10 items-center justify-center text-sm">
            <p className="text-muted-foreground">
              {t('header.promoText')}{" "}
              <span className="font-semibold text-primary">{t('header.promoCode')}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">
                  C
                </span>
              </div>
              <span className="font-bold text-xl">{t('header.logo')}</span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('header.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex">
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Globe className="h-4 w-4 mr-1" />
                    {getCurrentLanguageCode()}
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => changeLanguage('en')}>
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLanguage('fr')}>
                    Français
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => changeLanguage('ar')}>
                    العربية
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Dark Mode Toggle */}
              <ModeToggle />
            </div>

            {/* Shopping Cart */}
            <Button variant="ghost" size="sm" className="relative">
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                  2
                </Badge>
              </Link>
            </Button>

            {/* User Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isAuthenticated && user ? (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                      {isAdmin && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {t('header.adminBadge')}
                        </Badge>
                      )}
                    </div>
                    <DropdownMenuSeparator />
                    
                    {/* Show Admin Panel for admin users */}
                    {isAdmin && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="cursor-pointer">
                            <Shield className="mr-2 h-4 w-4" />
                            {t('header.adminPanel')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    
                    <DropdownMenuItem asChild>
                      <Link to="/my-account" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        {t('header.myAccount')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/my-account?tab=orders"
                        className="cursor-pointer"
                      >
                        <Package className="mr-2 h-4 w-4" />
                        {t('header.orders')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/my-account?tab=wishlist"
                        className="cursor-pointer"
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        {t('header.wishlist')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('header.signOut')}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/sign-in" className="cursor-pointer">
                        {t('header.signIn')}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/sign-up" className="cursor-pointer">
                        {t('header.register')}
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 px-4">
                <div className="flex flex-col space-y-4 mt-10">
                  <Input placeholder={t('header.searchPlaceholder')} />
                  <div className="flex items-center justify-between">
                    {/* Language Selector */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Globe className="h-4 w-4 mr-1" />
                          {getCurrentLanguageCode()}
                          <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => changeLanguage('en')}>
                          English
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => changeLanguage('fr')}>
                          Français
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => changeLanguage('ar')}>
                          العربية
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <ModeToggle />
                  </div>

                  {/* User Section in Mobile */}
                  {isAuthenticated && user ? (
                    <div className="border-t pt-4">
                      <div className="px-2 py-2 mb-2">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                        {isAdmin && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {t('header.adminBadge')}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Show Admin Panel for admin users in mobile */}
                      {isAdmin && (
                        <>
                          <Link
                            to="/admin"
                            className="flex items-center py-2 text-sm font-medium hover:text-primary"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            {t('header.adminPanel')}
                          </Link>
                          <div className="border-b my-2" />
                        </>
                      )}
                      
                      <Link
                        to="/my-account"
                        className="block py-2 text-sm font-medium hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('header.myAccount')}
                      </Link>
                      <Link
                        to="/my-account?tab=orders"
                        className="block py-2 text-sm font-medium hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('header.orders')}
                      </Link>
                      <Link
                        to="/my-account?tab=wishlist"
                        className="block py-2 text-sm font-medium hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('header.wishlist')}
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setMobileMenuOpen(false);
                        }}
                        className="block w-full text-left py-2 text-sm font-medium text-destructive hover:text-destructive/90"
                      >
                        {t('header.signOut')}
                      </button>
                    </div>
                  ) : (
                    <div className="border-t pt-4 space-y-2">
                      <Link
                        to="/sign-in"
                        className="block py-2 text-sm font-medium hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('header.signIn')}
                      </Link>
                      <Link
                        to="/sign-up"
                        className="block py-2 text-sm font-medium hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('header.register')}
                      </Link>
                    </div>
                  )}

                  <div className="space-y-2 border-t pt-4">
                    <Link
                      to="/"
                      className="block py-2 text-lg font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('header.nav.home')}
                    </Link>
                    <Link
                      to="/shop"
                      className="block py-2 text-lg font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('header.nav.shop')}
                    </Link>
                    <a
                      href="/categories"
                      className="block py-2 text-lg font-medium"
                    >
                      {t('header.nav.categories')}
                    </a>
                    <a href="/deals" className="block py-2 text-lg font-medium">
                      {t('header.nav.deals')}
                    </a>
                    <Link
                      to="/about"
                      className="block py-2 text-lg font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('header.nav.about')}
                    </Link>
                    <a
                      href="/contact"
                      className="block py-2 text-lg font-medium"
                    >
                      {t('header.nav.contact')}
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Search Bar - Mobile */}
      <div className="md:hidden border-t px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('header.searchPlaceholder')}
            className="pl-10 pr-4"
          />
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="hidden md:block border-t">
        <div className="container mx-auto px-4">
          <NavigationMenu className="max-w-full">
            <NavigationMenuList className="flex-wrap">
              <NavigationMenuItem>
                <Link to="/" className="px-4 py-3 text-sm font-medium">
                  {t('header.nav.home')}
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/shop" className="px-4 py-3 text-sm font-medium">
                  {t('header.nav.shop')}
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/contact"
                  className="px-4 py-3 text-sm font-medium"
                >
                  {t('header.nav.contact')}
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
}