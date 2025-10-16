/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  User,
  Package,
  MapPin,
  CreditCard,
  Heart,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit,
  Plus,
  Eye,
  Truck,
  ShoppingCart,
  Bell,
  Globe,
  Shield,
  Star,
  Menu,
  X,
  Phone,
  Mail,
  Loader2,
  Upload,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchOrders } from "../../features/orders/ordersSlice";
import {
  fetchWishlist,
  removeProductFromWishlist,
} from "../../features/wishlist/wishlistSlice";
import { addProductToCart } from "../../features/cart/cartSlice";
import { signOut } from "../../features/auth/authSlice";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Separator } from "../../components/ui/separator";
import { Switch } from "../../components/ui/switch";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { updateLoggedUserData, updateLoggedUserPassword } from "../../features/users/usersSlice";

const MyAccountDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [searchParams] = useSearchParams();
const tabFromUrl = searchParams.get("tab") || "overview";

const [activeSection, setActiveSection] = useState(tabFromUrl);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

// ADD THESE STATE DECLARATIONS HERE (at the top level)
  // Personal Info State
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [tempPersonalInfo, setTempPersonalInfo] = useState({
    name: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Password State
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    password: "",
    passwordConfirm: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // Redux selectors
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const {
    orders,
    pagination: ordersPagination,
    loading: ordersLoading,
  } = useAppSelector((state) => state.orders);
  const { wishlistItems, numOfWishlistItems, isRemoving } = useAppSelector(
    (state) => state.wishlist
  );
  const { isAddingToCart } = useAppSelector((state) => state.cart);
const { isUpdatingLoggedUser, isUpdatingLoggedPassword } = useAppSelector(
    (state) => state.users
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/sign-in");
    }
  }, [isAuthenticated, navigate]);

  // Fetch data on mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchOrders({ limit: 10, sort: "-createdAt" }));
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
  const tab = searchParams.get("tab") || "overview";
  setActiveSection(tab);
}, [searchParams]);

useEffect(() => {
    if (user) {
      setTempPersonalInfo({ name: user.name || "" });
    }
  }, [user]);
  // Show loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{t('myAccount.loading')}</p>
        </div>
      </div>
    );
  }

  // Prepare user data
  const userData = {
    name: user?.name || t('myAccount.guest'),
    email: user?.email || "",
    phone: t('myAccount.notAvailable'),
    profilePicture:
      user?.image ||
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    memberSince: user?.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : t('myAccount.notAvailable'),
    totalOrders: ordersPagination?.totalResults || 0,
    totalSpent: orders.reduce((sum, order) => sum + order.totalOrderPrice, 0),
    loyaltyPoints: Math.floor(
      orders.reduce((sum, order) => sum + order.totalOrderPrice, 0) / 10
    ),
  };

  // Prepare recent orders
  const recentOrders = orders.slice(0, 3).map((order) => ({
    id: order._id,
    orderNumber: order._id,
    date: new Date(order.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    status: order.deliveryStatus.replace("_", " "),
    total: order.totalOrderPrice,
    items: order.cartItems.length,
  }));

  // Prepare wishlist items for display
  const displayWishlistItems = wishlistItems.slice(0, 4).map((item) => ({
    id: item._id,
    name: item.name,
    price: item.priceAfterDiscount || item.price,
    image: item.mainImage,
  }));

  const sidebarItems = [
    { id: "overview", label: t('myAccount.sidebar.overview'), icon: User },
    { id: "orders", label: t('myAccount.sidebar.orders'), icon: Package },
    { id: "wishlist", label: t('myAccount.sidebar.wishlist'), icon: Heart },
    { id: "settings", label: t('myAccount.sidebar.settings'), icon: Settings },
    { id: "support", label: t('myAccount.sidebar.support'), icon: HelpCircle },
  ];

  // Handlers
  const handleLogout = () => {
    dispatch(signOut());
    toast.success(t('myAccount.logoutSuccess'));
    navigate("/signin");
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await dispatch(removeProductFromWishlist(productId)).unwrap();
      toast.success(t('myAccount.removedFromWishlist'));
    } catch (error) {
      toast.error(t('myAccount.removeFailed'));
    }
  };

  const handleAddToCart = async (productId: string, productName: string) => {
    setAddingToCartId(productId);
    try {
      await dispatch(
        addProductToCart({ productId, color: "default" })
      ).unwrap();
      toast.success(t('myAccount.addedToCart', { productName }));
    } catch (error: any) {
      toast.error(error || t('myAccount.addToCartFailed'));
    } finally {
      setAddingToCartId(null);
    }
  };

   // ADD THESE HANDLER FUNCTIONS HERE (at the top level, before renderSettings)
  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('myAccount.imageSizeError'));
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleUpdatePersonalInfo = async () => {
    try {
      await dispatch(
        updateLoggedUserData({
          name: tempPersonalInfo.name,
          image: selectedImage,
        })
      ).unwrap();
      
      toast.success(t('myAccount.profileUpdated'));
      setIsEditingInfo(false);
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error: any) {
      toast.error(error || t('myAccount.updateFailed'));
    }
  };

  const handleCancelInfoEdit = () => {
    setTempPersonalInfo({ name: user?.name || "" });
    setIsEditingInfo(false);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const validatePassword = () => {
    const errors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = t('myAccount.passwordErrors.currentRequired');
    }

    if (!passwordData.password) {
      errors.password = t('myAccount.passwordErrors.newRequired');
    } else if (passwordData.password.length < 6) {
      errors.password = t('myAccount.passwordErrors.minLength');
    }

    if (!passwordData.passwordConfirm) {
      errors.passwordConfirm = t('myAccount.passwordErrors.confirmRequired');
    } else if (passwordData.password !== passwordData.passwordConfirm) {
      errors.passwordConfirm = t('myAccount.passwordErrors.mismatch');
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdatePassword = async () => {
    if (!validatePassword()) {
      return;
    }

    try {
      const result = await dispatch(
        updateLoggedUserPassword(passwordData)
      ).unwrap();
      
      toast.success(t('myAccount.passwordUpdated'));
      setPasswordData({
        currentPassword: "",
        password: "",
        passwordConfirm: "",
      });
      setIsEditingPassword(false);
      setPasswordErrors({});
      
      if (result.token) {
        localStorage.setItem("token", result.token);
      }
    } catch (error: any) {
      toast.error(error || t('myAccount.passwordUpdateFailed'));
    }
  };

  const handleCancelPasswordEdit = () => {
    setPasswordData({
      currentPassword: "",
      password: "",
      passwordConfirm: "",
    });
    setIsEditingPassword(false);
    setPasswordErrors({});
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (
      statusLower.includes("delivered") ||
      statusLower.includes("completed")
    ) {
      return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
    }
    if (statusLower.includes("shipped") || statusLower.includes("transit")) {
      return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20";
    }
    if (
      statusLower.includes("confirmed") ||
      statusLower.includes("processing")
    ) {
      return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20";
    }
    if (statusLower.includes("cancelled") || statusLower.includes("failed")) {
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
    }
    return "text-muted-foreground bg-muted";
  };

  const renderOverview = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Avatar className="w-12 h-12 sm:w-16 sm:h-16">
              <AvatarImage src={userData.profilePicture} alt={userData.name} />
              <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl sm:text-2xl font-semibold">
                {t('myAccount.overview.welcome', { name: userData.name })}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t('myAccount.overview.memberSince', { date: userData.memberSince })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-semibold">
                  {userData.totalOrders}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t('myAccount.overview.totalOrders')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-chart-1/10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-chart-1" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-semibold">
                  ${userData.totalSpent.toFixed(2)}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t('myAccount.overview.totalSpent')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg">
              {t('myAccount.overview.recentOrders')}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveSection("orders")}
              className="text-primary hover:text-primary/80 text-xs sm:text-sm font-medium"
            >
              {t('myAccount.overview.viewAll')}
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {ordersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-muted rounded-lg gap-2"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-sm">
                        #{order.orderNumber.slice(-8)}
                      </p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {t('myAccount.overview.orderInfo', { date: order.date, items: order.items })}
                    </p>
                  </div>
                  <p className="font-semibold text-base">
                    ${order.total.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {t('myAccount.overview.noOrders')}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold">{t('myAccount.orders.title')}</h2>
        <Select defaultValue="all">
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder={t('myAccount.orders.filter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('myAccount.orders.allOrders')}</SelectItem>
            <SelectItem value="delivered">{t('myAccount.orders.delivered')}</SelectItem>
            <SelectItem value="shipped">{t('myAccount.orders.shipped')}</SelectItem>
            <SelectItem value="processing">{t('myAccount.orders.processing')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {ordersLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base">
                      {t('myAccount.orders.orderNumber', { number: order._id.slice(-8) })}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t('myAccount.orders.placedOn', { date: new Date(order.createdAt).toLocaleDateString() })}
                    </p>
                  </div>
                  <Badge
                    className={`${getStatusColor(
                      order.deliveryStatus
                    )} self-start sm:self-auto`}
                  >
                    {order.deliveryStatus.replace("_", " ")}
                  </Badge>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    {t('myAccount.orders.orderSummary', { 
                      items: order.cartItems.length, 
                      total: order.totalOrderPrice.toFixed(2) 
                    })}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link to={`/order-confirmation/${order._id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        {t('myAccount.orders.view')}
                      </Button>
                    </Link>
                    <Link to={`/orders/${order._id}/tracking`}>
                      <Button variant="outline" size="sm">
                        <Truck className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        {t('myAccount.orders.track')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">{t('myAccount.orders.noOrders')}</p>
            <Link to="/shop">
              <Button>{t('myAccount.orders.startShopping')}</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderWishlist = () => (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-semibold">{t('myAccount.wishlist.title')}</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          {t('myAccount.wishlist.itemCount', { count: numOfWishlistItems })}
        </p>
      </div>

      {wishlistItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {displayWishlistItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden group hover:shadow-lg transition-all"
            >
              <Link
                to={`/product/${item.id}`}
                className="block relative aspect-square"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.png";
                  }}
                />
              </Link>
              <CardContent className="p-2 sm:p-3 space-y-2">
                <Link to={`/product/${item.id}`}>
                  <h3 className="font-medium text-xs sm:text-sm line-clamp-2 hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                </Link>
                <p className="text-sm sm:text-base font-semibold text-primary">
                  ${item.price.toFixed(2)}
                </p>
                <div className="flex gap-1.5 sm:gap-2">
                  <Button
                    onClick={() => handleAddToCart(item.id, item.name)}
                    disabled={addingToCartId === item.id || isAddingToCart}
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    {addingToCartId === item.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">{t('myAccount.wishlist.add')}</span>
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    disabled={isRemoving}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">{t('myAccount.wishlist.empty')}</p>
            <Link to="/shop">
              <Button>{t('myAccount.wishlist.browseProducts')}</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {wishlistItems.length > 4 && (
        <div className="text-center">
          <Link to="/wishlist">
            <Button variant="outline">{t('myAccount.wishlist.viewAll')}</Button>
          </Link>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-semibold">{t('myAccount.settings.title')}</h2>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            {t('myAccount.settings.personalInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isEditingInfo ? (
            <>
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
                  <AvatarImage src={userData.profilePicture} alt={userData.name} />
                  <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-base sm:text-lg">
                    {userData.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {userData.email}
                  </p>
                </div>
              </div>
              <Button onClick={() => setIsEditingInfo(true)}>
                <Edit className="w-4 h-4 mr-2" />
                {t('myAccount.settings.editInfo')}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>{t('myAccount.settings.profilePicture')}</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
                    <AvatarImage
                      src={imagePreview || userData.profilePicture}
                      alt={tempPersonalInfo.name}
                    />
                    <AvatarFallback>
                      {tempPersonalInfo.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex gap-2">
                    <label htmlFor="image-upload">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span className="cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" />
                          {t('myAccount.settings.upload')}
                        </span>
                      </Button>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    {(imagePreview || selectedImage) && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleRemoveImage}
                      >
                        <X className="w-4 h-4 mr-2" />
                        {t('myAccount.settings.remove')}
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('myAccount.settings.imageRequirements')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">{t('myAccount.settings.fullName')}</Label>
                <Input
                  id="name"
                  type="text"
                  value={tempPersonalInfo.name}
                  onChange={(e) =>
                    setTempPersonalInfo({
                      ...tempPersonalInfo,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('myAccount.settings.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  readOnly
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  {t('myAccount.settings.emailCannotChange')}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleUpdatePersonalInfo}
                  disabled={isUpdatingLoggedUser}
                >
                  {isUpdatingLoggedUser ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('myAccount.settings.updating')}
                    </>
                  ) : (
                    t('myAccount.settings.saveChanges')
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelInfoEdit}
                  disabled={isUpdatingLoggedUser}
                >
                  {t('myAccount.settings.cancel')}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">{t('myAccount.settings.security')}</CardTitle>
        </CardHeader>
        <CardContent>
          {!isEditingPassword ? (
            <div className="flex items-center justify-between p-3 sm:p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm sm:text-base">{t('myAccount.settings.password')}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t('myAccount.settings.keepAccountSecure')}
                  </p>
                </div>
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={() => setIsEditingPassword(true)}
              >
                {t('myAccount.settings.change')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t('myAccount.settings.currentPassword')}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className={
                    passwordErrors.currentPassword ? "border-destructive" : ""
                  }
                />
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-destructive">
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">{t('myAccount.settings.newPassword')}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.password}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      password: e.target.value,
                    })
                  }
                  className={passwordErrors.password ? "border-destructive" : ""}
                />
                {passwordErrors.password && (
                  <p className="text-xs text-destructive">
                    {passwordErrors.password}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t('myAccount.settings.passwordMinLength')}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('myAccount.settings.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.passwordConfirm}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      passwordConfirm: e.target.value,
                    })
                  }
                  className={
                    passwordErrors.passwordConfirm ? "border-destructive" : ""
                  }
                />
                {passwordErrors.passwordConfirm && (
                  <p className="text-xs text-destructive">
                    {passwordErrors.passwordConfirm}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleUpdatePassword}
                  disabled={isUpdatingLoggedPassword}
                >
                  {isUpdatingLoggedPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('myAccount.settings.updating')}
                    </>
                  ) : (
                    t('myAccount.settings.updatePassword')
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelPasswordEdit}
                  disabled={isUpdatingLoggedPassword}
                >
                  {t('myAccount.settings.cancel')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-semibold">{t('myAccount.support.title')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">
                  {t('myAccount.support.phoneSupport')}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t('myAccount.support.phoneHours')}
                </p>
              </div>
            </div>
            <p className="text-base sm:text-lg font-semibold mb-2">
              {t('myAccount.support.phoneNumber')}
            </p>
            <Button variant="outline" className="w-full">
              {t('myAccount.support.callNow')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-chart-2" />
              </div>
              <div>
                <h3 className="font-semibold text-sm sm:text-base">
                  {t('myAccount.support.emailSupport')}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t('myAccount.support.emailResponse')}
                </p>
              </div>
            </div>
            <p className="text-sm sm:text-base mb-2">{t('myAccount.support.emailAddress')}</p>
            <Button variant="outline" className="w-full">
              {t('myAccount.support.sendEmail')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            {t('myAccount.support.faq')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 sm:p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm sm:text-base">
              {t('myAccount.support.faq1.question')}
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {t('myAccount.support.faq1.answer')}
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm sm:text-base">
              {t('myAccount.support.faq2.question')}
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {t('myAccount.support.faq2.answer')}
            </p>
          </div>
          <div className="p-3 sm:p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-sm sm:text-base">
              {t('myAccount.support.faq3.question')}
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {t('myAccount.support.faq3.answer')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return renderOverview();
      case "orders":
        return renderOrders();
      case "wishlist":
        return renderWishlist();
      case "settings":
        return renderSettings();
      case "support":
        return renderSupport();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Mobile Menu Button */}
        <div className="lg:hidden mb-4">
          <Button
            variant="ghost"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center space-x-2"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
            <span className="text-sm sm:text-base">{t('myAccount.mobileMenu')}</span>
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Sidebar */}
          <div
            className={`lg:w-64 ${
              isMobileMenuOpen ? "block" : "hidden lg:block"
            }`}
          >
            <Card>
              <CardContent className="p-4">
                {/* User Profile */}
                <div className="flex items-center space-x-3 mb-6 pb-6 border-b">
                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                    <AvatarImage
                      src={userData.profilePicture}
                      alt={userData.name}
                    />
                    <AvatarFallback>{userData.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm sm:text-base truncate">
                      {userData.name}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {userData.email}
                    </p>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={
                          activeSection === item.id ? "default" : "ghost"
                        }
                        onClick={() => {
                          setActiveSection(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full justify-start text-sm sm:text-base"
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 mr-3" />
                        {item.label}
                      </Button>
                    );
                  })}

                  <Separator className="my-4" />

                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 text-sm sm:text-base"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5 mr-3" />
                    {t('myAccount.logout')}
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountDashboard;