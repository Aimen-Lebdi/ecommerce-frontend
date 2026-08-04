/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
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
import { Checkbox } from "../../components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/ui/collapsible";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchCart } from "../../features/cart/cartSlice";
import {
  createCashOrder,
  createCheckoutSession,
  clearError,
  clearCheckoutSession,
} from "../../features/orders/ordersSlice";
import {
  fetchAddresses,
  createAddress,
} from "../../features/addresses/addressesSlice";
import { fetchPhones, createPhone } from "../../features/phones/phonesSlice";
import { toast } from "sonner";

const Checkout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Redux state
  const {
    cartItems,
    totalCartPrice,
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

  const {
    addresses,
    loading: addressesLoading,
  } = useAppSelector((state) => state.addresses);
  const { phones, loading: phonesLoading } = useAppSelector(
    (state) => state.phones
  );

  // Form state
  const [customerInfo, setCustomerInfo] = useState({
    email: user?.email || "",
    userName: user?.name || "",
  });
  

  const [shippingAddress, setShippingAddress] = useState({
    phone: "",
    dayra: "",
    wilaya: "",
    baladiya: "",
  });

  // Saved-address / phone selectors: "new" means the user is typing a fresh entry
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [selectedPhoneId, setSelectedPhoneId] = useState<string>("new");
  const [saveToProfile, setSaveToProfile] = useState(false);

  // One-shot prefill guards (avoid overriding the user after a later save)
  const prefilledAddressRef = useRef(false);
  const prefilledPhoneRef = useRef(false);

  // Checkout state
  // const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("cash");
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);

  // Fetch cart + saved addresses/phones on mount (only if authenticated)
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
      dispatch(fetchAddresses());
      dispatch(fetchPhones());
    }
  }, [dispatch, isAuthenticated]);

  // Prefill the address form from the default saved address once loaded
  useEffect(() => {
    if (!addressesLoading && !prefilledAddressRef.current) {
      prefilledAddressRef.current = true;
      const defaultAddress = addresses.find((a) => a.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
        setShippingAddress((prev) => ({
          ...prev,
          wilaya: defaultAddress.wilaya,
          dayra: defaultAddress.dayra,
          baladiya: defaultAddress.baladiya,
        }));
      }
    }
  }, [addresses, addressesLoading]);

  // Prefill the phone field from the default saved phone once loaded
  useEffect(() => {
    if (!phonesLoading && !prefilledPhoneRef.current) {
      prefilledPhoneRef.current = true;
      const defaultPhone = phones.find((p) => p.isDefault);
      if (defaultPhone) {
        setSelectedPhoneId(defaultPhone._id);
        setShippingAddress((prev) => ({ ...prev, phone: defaultPhone.phone }));
      }
    }
  }, [phones, phonesLoading]);

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
  const subtotal = totalCartPrice;
  const shippingCost = 500;
  const total = subtotal + shippingCost;

  // Select a saved address (or "new") and reflect its values in the form
  const handleAddressSelect = (value: string) => {
    setSelectedAddressId(value);
    if (value === "new") {
      setShippingAddress((prev) => ({
        ...prev,
        wilaya: "",
        dayra: "",
        baladiya: "",
      }));
      return;
    }
    const address = addresses.find((a) => a._id === value);
    if (address) {
      setShippingAddress((prev) => ({
        ...prev,
        wilaya: address.wilaya,
        dayra: address.dayra,
        baladiya: address.baladiya,
      }));
    }
  };

  // Select a saved phone (or "new") and reflect its value in the form
  const handlePhoneSelect = (value: string) => {
    setSelectedPhoneId(value);
    if (value === "new") {
      setShippingAddress((prev) => ({ ...prev, phone: "" }));
      return;
    }
    const phone = phones.find((p) => p._id === value);
    if (phone) {
      setShippingAddress((prev) => ({ ...prev, phone: phone.phone }));
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error(t('checkout.fillRequiredFields'));
      return;
    }

    if (!cartId) {
      toast.error(t('checkout.cartNotFound'));
      return;
    }

    // Final snapshot: always the currently selected/typed values
    const finalShippingAddress = {
      wilaya: shippingAddress.wilaya,
      dayra: shippingAddress.dayra,
      baladiya: shippingAddress.baladiya,
      phone: shippingAddress.phone,
    };

    try {
      // Save only brand-new entries to the profile when requested
      if (saveToProfile) {
        try {
          if (selectedAddressId === "new") {
            await dispatch(
              createAddress({
                wilaya: shippingAddress.wilaya,
                dayra: shippingAddress.dayra,
                baladiya: shippingAddress.baladiya,
              })
            ).unwrap();
          }
          if (selectedPhoneId === "new") {
            await dispatch(
              createPhone({ phone: shippingAddress.phone })
            ).unwrap();
          }
        } catch (saveError: any) {
          toast.error(
            saveError.response?.data?.message ||
              t('checkout.saveToProfileFailed')
          );
          console.error("Failed to save to profile:", saveError);
        }
      }

      if (paymentMethod === "cash") {
        await dispatch(
          createCashOrder({
            cartId,
            orderData: { shippingAddress: finalShippingAddress },
          })
        ).unwrap();
      } else {
        await dispatch(
          createCheckoutSession({
            cartId,
            shippingAddress: finalShippingAddress,
          })
        ).unwrap();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('checkout.orderCreationFailed'));
      console.error("Order creation failed:", error);
    }
  };

  const validateForm = () => {
    return (
      customerInfo.email &&
      customerInfo.userName &&
      shippingAddress.wilaya &&
      shippingAddress.dayra &&
      shippingAddress.baladiya &&
      shippingAddress.phone
    );
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

                {/* Saved phone selector */}
                <div className="space-y-3">
                  <Label>{t('checkout.savedPhones')}</Label>
                  <RadioGroup
                    value={selectedPhoneId}
                    onValueChange={handlePhoneSelect}
                    disabled={isProcessing}
                  >
                    {phones.map((phone) => (
                      <div
                        key={phone._id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={phone._id}
                            id={`phone-${phone._id}`}
                          />
                          <Label
                            htmlFor={`phone-${phone._id}`}
                            className="font-medium"
                          >
                            {phone.phone}
                          </Label>
                        </div>
                        {phone.isDefault && (
                          <Badge variant="secondary">
                            {t('checkout.default')}
                          </Badge>
                        )}
                      </div>
                    ))}
                    <div className="flex items-center p-3 border rounded-lg">
                      <RadioGroupItem value="new" id="new-phone" />
                      <Label htmlFor="new-phone" className="font-medium ml-2">
                        {t('checkout.newPhone')}
                      </Label>
                    </div>
                  </RadioGroup>
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
                {/* Saved address selector */}
                <div className="space-y-3">
                  <Label>{t('checkout.savedAddresses')}</Label>
                  <RadioGroup
                    value={selectedAddressId}
                    onValueChange={handleAddressSelect}
                    disabled={isProcessing}
                  >
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem
                            value={address._id}
                            id={`address-${address._id}`}
                          />
                          <Label
                            htmlFor={`address-${address._id}`}
                            className="font-medium"
                          >
                            {address.wilaya} - {address.dayra} -{" "}
                            {address.baladiya}
                          </Label>
                        </div>
                        {address.isDefault && (
                          <Badge variant="secondary">
                            {t('checkout.default')}
                          </Badge>
                        )}
                      </div>
                    ))}
                    <div className="flex items-center p-3 border rounded-lg">
                      <RadioGroupItem value="new" id="new-address" />
                      <Label htmlFor="new-address" className="font-medium ml-2">
                        {t('checkout.newAddress')}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wilaya">{t('checkout.wilaya')} *</Label>
                    <Input
                      value={shippingAddress.wilaya}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          wilaya: e.target.value,
                        }))
                      }
                      placeholder={t('checkout.wilayaPlaceholder')}
                      disabled={isProcessing || selectedAddressId !== "new"}
                    ></Input>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dayra">{t('checkout.dayra')} *</Label>
                    <Input
                      value={shippingAddress.dayra}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          dayra: e.target.value,
                        }))
                      }
                      placeholder={t('checkout.dayraPlaceholder')}
                      disabled={isProcessing || selectedAddressId !== "new"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="baladiya">{t('checkout.baladiya')} *</Label>
                    <Input
                      value={shippingAddress.baladiya}
                      onChange={(e) =>
                        setShippingAddress((prev) => ({
                          ...prev,
                          baladiya: e.target.value,
                        }))
                      }
                      placeholder={t('checkout.baladiyaPlaceholder')}
                      disabled={isProcessing || selectedAddressId !== "new"}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save to profile (only when a new address/phone is being typed) */}
            {(selectedAddressId === "new" || selectedPhoneId === "new") && (
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Checkbox
                    id="saveToProfile"
                    checked={saveToProfile}
                    onCheckedChange={(checked) =>
                      setSaveToProfile(checked === true)
                    }
                    disabled={isProcessing}
                  />
                  <Label
                    htmlFor="saveToProfile"
                    className="text-sm font-normal"
                  >
                    {t('checkout.saveToProfile')}
                  </Label>
                </CardContent>
              </Card>
            )}

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

        {/* Desktop Place Order Button — sticky, centered */}
<div className="hidden lg:block fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t p-4 z-10 shadow-lg">
  <div className="max-w-2xl mx-auto">
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
      <div className="h-20"></div>
    </div>
  );
};

export default Checkout;