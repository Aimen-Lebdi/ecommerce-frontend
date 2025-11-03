/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Lock,
  CreditCard,
  Truck,
  Shield,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  User,
  Home,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/ui/collapsible";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchCart } from "../../features/cart/cartSlice";
import {
  createCashOrder,
  clearError,
  clearCheckoutSession,
} from "../../features/orders/ordersSlice";
import { toast } from "sonner";
import axiosInstance from "../../utils/axiosInstance";

const Checkout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const {
    cartItems,
    totalCartPrice,
    totalPriceAfterDiscount,
    loading: cartLoading,
    cartId,
  } = useAppSelector((state) => state.cart);

  const {
    isCreatingOrder,
    isCreatingCheckout,
    checkoutSession,
    error: orderError,
    currentOrder,
  } = useAppSelector((state) => state.orders);

  const { user } = useAppSelector((state) => state.auth);

  // Form state
  const [customerInfo, setCustomerInfo] = useState({
    email: user?.email || "",
    userName: user?.name || "",
  });

  const [shippingAddress, setShippingAddress] = useState({
    details: "",
    phone: "",
    dayra: "",
    wilaya: "",
    country: "DZ",
  });

  // Checkout state
  // const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("cash");
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);

  // Fetch cart on mount
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Redirect if cart is empty
  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      toast.error(t('checkout.cartEmpty'));
      navigate("/cart");
    }
  }, [cartItems, cartLoading, navigate, t]);

  // Handle checkout session redirect
  useEffect(() => {
    if (checkoutSession && checkoutSession.url) {
      window.location.href = checkoutSession.url;
    }
  }, [checkoutSession]);

  // Handle successful order creation
  useEffect(() => {
    if (currentOrder && !isCreatingOrder) {
      toast.success(t('checkout.orderPlacedSuccess'));
      navigate(`/order-confirmation/${currentOrder._id}`);
      dispatch(clearCheckoutSession());
    }
  }, [currentOrder, isCreatingOrder, navigate, dispatch, t]);

  // Show errors
  useEffect(() => {
    if (orderError) {
      toast.error(orderError);
      dispatch(clearError());
    }
  }, [orderError, dispatch]);

  // Calculate totals
  const subtotal = totalPriceAfterDiscount || totalCartPrice;
  const shippingCost = 500;
  const total = subtotal + shippingCost;

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error(t('checkout.fillRequiredFields'));
      return;
    }

    if (!cartId) {
      toast.error(t('checkout.cartNotFound'));
      return;
    }

    try {
      if (paymentMethod === "cash") {
        const orderData = {
          shippingAddress: {
            details: shippingAddress.details,
            phone: shippingAddress.phone,
            wilaya: shippingAddress.wilaya,
            dayra: shippingAddress.dayra,
          },
        };

        await dispatch(createCashOrder({ cartId, orderData })).unwrap();
      } else {
        const response = await axiosInstance.post(
          `/api/orders/checkout-session/${cartId}`,
          {
            shippingAddress: {
              details: shippingAddress.details,
              phone: shippingAddress.phone,
              wilaya: shippingAddress.wilaya,
              dayra: shippingAddress.dayra,
            },
          }
        );

        if (response.data.session && response.data.session.url) {
          window.location.href = response.data.session.url;
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('checkout.orderCreationFailed'));
      console.error("Order creation failed:", error);
    }
  };

  const validateForm = () => {
    if (paymentMethod === "card") {
      return (
        customerInfo.email &&
        customerInfo.userName &&
        shippingAddress.details &&
        shippingAddress.wilaya &&
        shippingAddress.dayra &&
        shippingAddress.phone
      );
    } else {
      return (
        customerInfo.email &&
        customerInfo.userName &&
        shippingAddress.details &&
        shippingAddress.wilaya &&
        shippingAddress.dayra &&
        shippingAddress.phone
      );
    }
  };

  // Loading state
  if (cartLoading && cartItems.length === 0) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('checkout.loadingCheckout')}</p>
        </div>
      </div>
    );
  }

  const isProcessing = isCreatingOrder || isCreatingCheckout;

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="container py-4 px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/cart")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-600" />
              <h1 className="text-xl md:text-2xl font-bold">{t('checkout.secureCheckout')}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 md:py-8 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mobile Order Summary Toggle */}
            <div className="lg:hidden">
              <Collapsible
                open={isOrderSummaryOpen}
                onOpenChange={setIsOrderSummaryOpen}
              >
                <CollapsibleTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">
                            {t('checkout.orderSummary')}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {cartItems.reduce(
                              (sum, item) => sum + item.quantity,
                              0
                            )}{" "}
                            {t('checkout.items')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">
                            DA{total.toFixed(2)}
                          </span>
                          {isOrderSummaryOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card className="mt-2">
                    <CardContent className="p-4 space-y-4">
                      {cartItems.map((item) => (
                        <div key={item._id} className="flex gap-3">
                          <div className="relative">
                            <img
                              src={item.product.mainImage}
                              alt={item.product.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                              {item.quantity}
                            </Badge>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">
                              {item.product.name}
                            </p>
                            {item.color && (
                              <p className="text-xs text-muted-foreground">
                                {item.color}
                              </p>
                            )}
                          </div>
                          <div className="text-sm font-semibold">
                            DA{(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                      <Separator />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>{t('checkout.subtotal')}</span>
                          <span>DA{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('checkout.shipping')}</span>
                          <span>DA{shippingCost.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>{t('checkout.total')}</span>
                          <span>DA{total.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('checkout.contactInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('checkout.userName')} *</Label>
                    <Input
                      id="firstName"
                      value={customerInfo.userName}
                      onChange={(e) =>
                        setCustomerInfo((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      placeholder={t('checkout.userNamePlaceholder')}
                      disabled={isProcessing}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t('checkout.emailAddress')} *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      value={customerInfo.email}
                      onChange={(e) =>
                        setCustomerInfo((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      placeholder={t('checkout.emailPlaceholder')}
                      disabled={isProcessing}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {t('checkout.phoneNumber')} {paymentMethod === "cash" && "*"}
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      className="pl-10"
                      value={shippingAddress.phone}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      placeholder={t('checkout.phonePlaceholder')}
                      disabled={isProcessing}
                    />
                  </div>
                  {paymentMethod === "cash" && (
                    <p className="text-xs text-muted-foreground">
                      {t('checkout.phoneRequiredCOD')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  {t('checkout.shippingAddress')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wilaya">{t('checkout.wilaya')}</Label>
                    <Input
                      value={shippingAddress.wilaya}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          wilaya: e.target.value,
                        }))
                      }
                      placeholder={t('checkout.wilayaPlaceholder')}
                      disabled={isProcessing}
                    ></Input>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dayra">{t('checkout.dayra')}</Label>
                    <Input
                      value={shippingAddress.dayra}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          dayra: e.target.value,
                        }))
                      }
                      placeholder={t('checkout.dayraPlaceholder')}
                      disabled={isProcessing}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">{t('checkout.streetAddress')} *</Label>
                  <Input
                    value={shippingAddress.details}
                    onChange={(e) =>
                      setShippingAddress((prev) => ({
                        ...prev,
                        details: e.target.value,
                      }))
                    }
                    placeholder={t('checkout.streetAddressPlaceholder')}
                    disabled={isProcessing}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  {t('checkout.shippingMethod')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
  <div className="w-4 h-4 rounded-full border border-primary flex items-center justify-center">
    <div className="w-2 h-2 bg-primary rounded-full" />
  </div>
  <div className="flex-1">
    <Label className="font-medium">
      {t('checkout.yalidineExpress')}
    </Label>
    <p className="text-sm text-muted-foreground">
      {t('checkout.businessDays')}
    </p>
  </div>
  <span className="font-semibold">500 DA</span>
</div>

              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  {t('checkout.paymentInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) =>
                    setPaymentMethod(value as "card" | "cash")
                  }
                  disabled={isProcessing}
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="cash" id="cash" />
                    <div className="flex-1">
                      <Label htmlFor="cash" className="font-medium">
                        {t('checkout.cashOnDelivery')}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t('checkout.payOnReceive')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="card" id="card" />
                    <div className="flex-1">
                      <Label htmlFor="card" className="font-medium">
                        {t('checkout.creditDebitCard')}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t('checkout.securePaymentStripe')}
                      </p>
                    </div>
                  </div>
                </RadioGroup>

                {paymentMethod === "cash" && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex gap-3">
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900 text-sm">
                          {t('checkout.cashOnDelivery')}
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          {t('checkout.codDescription')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "card" && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex gap-3">
                      <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900 text-sm">
                          {t('checkout.secureCardPayment')}
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          {t('checkout.stripeRedirectInfo')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary - Right Column (Desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('checkout.orderSummary')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex gap-3">
                      <div className="relative">
                        <img
                          src={item.product.mainImage}
                          alt={item.product.name}
                          className="w-16 h-16 rounded object-cover"
                        />
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {item.quantity}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-2">
                          {item.product.name}
                        </p>
                        {item.color && (
                          <p className="text-sm text-muted-foreground">
                            {item.color}
                          </p>
                        )}
                        <p className="text-sm font-semibold">
                          {(item.price * item.quantity).toFixed(2)} DA
                        </p>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t('checkout.subtotal')}</span>
                      <span>{subtotal.toFixed(2)} DA</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t('checkout.shipping')}</span>
                      <span>{shippingCost.toFixed(2)} DA</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>{t('checkout.total')}</span>
                      <span>{total.toFixed(2)} DA</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Indicators */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>{t('checkout.sslSecured')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span>{t('checkout.moneyBackGuarantee')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-purple-600" />
                    <span>{t('checkout.freeReturns')}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-3">{t('checkout.weAccept')}</p>
                  <div className="flex gap-2 flex-wrap">
                    {["Visa", "Mastercard", "COD", "Stripe"].map((method) => (
                      <Badge key={method} variant="outline" className="text-xs">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Bar (Mobile) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-10 shadow-lg">
          <Button
            size="lg"
            className="w-full"
            onClick={handlePlaceOrder}
            disabled={!validateForm() || isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('checkout.processing')}
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                {t('checkout.placeOrder')} • DA{total.toFixed(2)}
              </>
            )}
          </Button>
        </div>

        {/* Desktop Place Order Button */}
        <div className="hidden lg:block mt-8">
          <div className="max-w-2xl">
            <Button
              size="lg"
              className="w-full"
              onClick={handlePlaceOrder}
              disabled={!validateForm() || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('checkout.processingOrder')}
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  {t('checkout.placeOrder')} • DA{total.toFixed(2)}
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              {t('checkout.termsAgreement')}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile bottom spacing */}
      <div className="lg:hidden h-20"></div>
    </div>
  );
};

export default Checkout;