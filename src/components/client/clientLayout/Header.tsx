import { useEffect, useState } from "react";
import {
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
import { Badge } from "../../ui/badge";
import { SearchBox } from "./SearchBox";
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
  NavigationMenuList,
} from "../../ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "../../ui/sheet";
import { ModeToggle } from "../../mode-toggle";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { signOut } from "../../../features/auth/authSlice";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../../../i18n";
import { cn } from "../../../lib/utils";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, i18n } = useTranslation();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const numOfCartItems = useAppSelector((state) => state.cart.numOfCartItems);

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  const handleSignOut = () => {
    dispatch(signOut());
    navigate("/sign-in");
  };

  // Language change handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const changeLanguage = (lng: string) => {
    setLanguage(lng);
    // Update HTML dir and lang attributes
    const htmlElement = document.documentElement;
    if (lng === "ar") {
      htmlElement.setAttribute("dir", "rtl");
      htmlElement.setAttribute("lang", "ar");
    } else {
      htmlElement.setAttribute("dir", "ltr");
      htmlElement.setAttribute("lang", lng);
    }

    // Save preference to localStorage
    localStorage.setItem("preferred-language", lng);
  };

  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language");
    if (savedLanguage && savedLanguage !== i18n.language) {
      changeLanguage(savedLanguage);
    } else if (i18n.language === "ar") {
      // Ensure dir is set if current language is Arabic
      document.documentElement.setAttribute("dir", "rtl");
      document.documentElement.setAttribute("lang", "ar");
    }
  }, [changeLanguage, i18n.language]);

  // Add a subtle shadow once the page is scrolled for depth/affordance.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Get current language code
  const getCurrentLanguageCode = () => {
    const lang = i18n.language;
    if (lang.startsWith("en")) return "EN";
    if (lang.startsWith("fr")) return "FR";
    if (lang.startsWith("ar")) return "AR";
    return "EN";
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full  bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow",
        scrolled && "shadow-sm"
      )}
    >
      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" aria-label={t("header.goHome")} className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center">
                  <img src="/logo.png" alt="" width={128} height={128} />
              </div>
                  {/* w-auto: width/height attrs are presentational hints — without
                      an explicit width override the img would render at its raw
                      attribute width. */}
                  <img src="/shopName.png" alt="" width={130} height={64} className="h-8 w-auto" />
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <SearchBox className="w-full" />
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <Globe className="h-4 w-4 mr-1" />
                  {getCurrentLanguageCode()}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => changeLanguage("en")}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("fr")}>
                  Français
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("ar")}>
                  العربية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Dark Mode Toggle */}
            <ModeToggle className="hidden sm:flex" />

            {/* Shopping Cart */}
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              aria-label={t("header.cart")}
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/sign-in', { state: { from: { pathname: '/cart' } } });
                } else {
                  navigate('/cart');
                }
              }}
            >
              <ShoppingCart className="h-5 w-5" />
              {numOfCartItems > 0 && (
                <Badge
                  key={numOfCartItems}
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs animate-in zoom-in-75"
                >
                  {numOfCartItems}
                </Badge>
              )}
            </Button>

            {/* User Account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" aria-label={t("header.userMenu")}>
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
                          {t("header.adminBadge")}
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
                            {t("header.adminPanel")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    <DropdownMenuItem asChild>
                      <Link to="/my-account" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        {t("header.myAccount")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/my-account?tab=orders"
                        className="cursor-pointer"
                      >
                        <Package className="mr-2 h-4 w-4" />
                        {t("header.orders")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/my-account?tab=wishlist"
                        className="cursor-pointer"
                      >
                        <Heart className="mr-2 h-4 w-4" />
                        {t("header.wishlist")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("header.signOut")}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/sign-in" className="cursor-pointer">
                        {t("header.signIn")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/sign-up" className="cursor-pointer">
                        {t("header.register")}
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden" aria-label={t("header.openMenu")}>
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 px-4 overflow-auto">
                <div className="flex flex-col space-y-4 mt-10">
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
                        <DropdownMenuItem onClick={() => changeLanguage("en")}>
                          English
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => changeLanguage("fr")}>
                          Français
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => changeLanguage("ar")}>
                          العربية
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <ModeToggle />
                  </div>

                  <div className="space-y-2 border-t pt-4">
                    <NavLink
                      to="/"
                      end
                      className={({ isActive }) =>
                        cn(
                          "block rounded-md px-3 py-2 text-base font-medium transition-colors",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        )
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("header.nav.home")}
                    </NavLink>
                    <NavLink
                      to="/shop"
                      className={({ isActive }) =>
                        cn(
                          "block rounded-md px-3 py-2 text-base font-medium transition-colors",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        )
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("header.nav.shop")}
                    </NavLink>
                    <NavLink
                      to="/about"
                      className={({ isActive }) =>
                        cn(
                          "block rounded-md px-3 py-2 text-base font-medium transition-colors",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        )
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("header.nav.about")}
                    </NavLink>
                    <NavLink
                      to="/contact"
                      className={({ isActive }) =>
                        cn(
                          "block rounded-md px-3 py-2 text-base font-medium transition-colors",
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        )
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("header.nav.contact")}
                    </NavLink>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Search Bar - Mobile */}
      <div className="md:hidden border-t px-4 py-3">
        <SearchBox />
      </div>

      {/* Navigation Menu */}
      <div className="hidden md:block  ">
        <div className="container mx-auto px-4">
          <NavigationMenu className="max-w-full">
            <NavigationMenuList className="flex-wrap gap-1 py-2">
              <NavigationMenuItem>
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )
                  }
                >
                  {t("header.nav.home")}
                </NavLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavLink
                  to="/shop"
                  className={({ isActive }) =>
                    cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )
                  }
                >
                  {t("header.nav.shop")}
                </NavLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )
                  }
                >
                  {t("header.nav.about")}
                </NavLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )
                  }
                >
                  {t("header.nav.contact")}
                </NavLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
}