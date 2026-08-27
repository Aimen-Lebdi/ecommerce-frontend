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
  Banknote,
  Loader2,
  AlertTriangle,
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
import AddressCascadeFields from "../../components/client/AddressCascadeFields";
import { Separator } from "../../components/ui/separator";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/ui/collapsible";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { responsiveImageProps } from "../../utils/responsiveImage";
import { SHIPPING_COST_DZD } from "../../utils/shippingCost";
import { formatPrice } from "../../utils/formatPrice";
import { fetchCart, resetCart } from "../../features/cart/cartSlice";
import {
  createCashOrder,
  createCheckoutSession,
  clearError,
  clearCurrentOrder,
} from "../../features/orders/ordersSlice";
import {
  fetchAddresses,
  createAddress,
  updateAddress,
} from "../../features/addresses/addressesSlice";
import {
  fetchPhones,
  createPhone,
  updatePhone,
} from "../../features/phones/phonesSlice";
import {
  formatPhoneForDisplay,
  formatPhoneMask,
  isCompleteLocalPhone,
  maskPhoneChange,
  phoneToLocalDigits,
} from "../../utils/phoneFormat";
import { toast } from "sonner";
import { getErrorMessage } from "../../utils/errorMessage";

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
  const [savePhoneToProfile, setSavePhoneToProfile] = useState(false);
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(false);

  // Label for a brand-new entry being saved to the profile (shown only when saving)
  const [newAddressLabel, setNewAddressLabel] = useState("");
  const [newPhoneLabel, setNewPhoneLabel] = useState("");
  // Inline label: required when the user selects a saved entry that lacks a label
  const [inlineAddressLabel, setInlineAddressLabel] = useState("");
  const [inlinePhoneLabel, setInlinePhoneLabel] = useState("");
  // Field-level errors for the active label input (inline or save-to-profile)
  const [labelErrors, setLabelErrors] = useState<{
    address?: "required" | "tooLong";
    phone?: "required" | "tooLong";
  }>({});

  // Inline error for an incomplete phone number
  const [phoneError, setPhoneError] = useState(false);

  // Set on a failed Place Order click so missing fields surface inline
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // One-shot prefill guards (avoid overriding the user after a later save)
  const prefilledAddressRef = useRef(false);
  const prefilledPhoneRef = useRef(false);

  // Set once an order has been placed successfully, so the empty-cart
  // redirect effect below doesn't kick in while we navigate to confirmation.
  const orderPlacedRef = useRef(false);

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
        setShippingAddress((prev) => ({
          ...prev,
          phone: formatPhoneMask(phoneToLocalDigits(defaultPhone.phone)),
        }));
      }
    }
  }, [phones, phonesLoading]);

  // Redirect if cart is empty (skip after a successful order so we land on
  // /order-confirmation instead of bouncing back to /cart)
  useEffect(() => {
    if (orderPlacedRef.current) return;
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

  // M4: Clear the stale currentOrder when leaving /checkout so the next visit
  // starts clean (no redirect back to a previously placed order).
  useEffect(() => {
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch]);

  // Show errors
  useEffect(() => {
    if (orderError) {
      toast.error(orderError);
      dispatch(clearError());
    }
  }, [orderError, dispatch]);

  // Calculate totals
  const subtotal = totalCartPrice;
  const shippingCost = SHIPPING_COST_DZD;
  const total = subtotal + shippingCost;

  // Select a saved address (or "new") and reflect its values in the form
  const handleAddressSelect = (value: string) => {
    setSelectedAddressId(value);
    setLabelErrors((prev) => ({ ...prev, address: undefined }));
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
    setLabelErrors((prev) => ({ ...prev, phone: undefined }));
    setPhoneError(false);
    if (value === "new") {
      setShippingAddress((prev) => ({ ...prev, phone: "" }));
      return;
    }
    const phone = phones.find((p) => p._id === value);
    if (phone) {
      setShippingAddress((prev) => ({
        ...prev,
        phone: formatPhoneMask(phoneToLocalDigits(phone.phone)),
      }));
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      setAttemptedSubmit(true);
      setLabelErrors(getLabelErrors());
      setPhoneError(!isCompleteLocalPhone(shippingAddress.phone));
      toast.error(t('checkout.fillRequiredFields'));
      // Bring the first blocking field into view so the user can fix it
      if (!customerInfo.userName.trim()) {
        document.getElementById("userName")?.focus();
      } else if (!customerInfo.email.trim()) {
        document.getElementById("email")?.focus();
      }
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
      phone: phoneToLocalDigits(shippingAddress.phone),
    };

    try {
      // Address-label/create and phone-label/create touch independent profile
      // domains, so run them concurrently — placing the order then waits on
      // one round-trip instead of two. Each task keeps its own error handling.
      const persistAddressProfile = async () => {
        // Persist an inline label for a selected saved address that lacked one
        // (also unblocks the My Account hard gate).
        if (selectedAddressId !== "new") {
          const selectedAddress = addresses.find(
            (a) => a._id === selectedAddressId
          );
          if (
            selectedAddress &&
            !(selectedAddress.label && selectedAddress.label.trim()) &&
            inlineAddressLabel.trim()
          ) {
            try {
              await dispatch(
                updateAddress({
                  addressId: selectedAddressId,
                  label: inlineAddressLabel.trim(),
                })
              ).unwrap();
              toast.success(t('checkout.labelSaved'));
            } catch (saveError) {
              toast.error(
                getErrorMessage(saveError, t('checkout.labelSaveFailed'))
              );
              console.error("Failed to save address label:", saveError);
            }
          }
        }

        // Save a brand-new address to the profile when requested
        if (saveAddressToProfile && selectedAddressId === "new") {
          try {
            await dispatch(
              createAddress({
                label: newAddressLabel.trim(),
                wilaya: shippingAddress.wilaya,
                dayra: shippingAddress.dayra,
                baladiya: shippingAddress.baladiya,
              })
            ).unwrap();
          } catch (saveError) {
            toast.error(
              getErrorMessage(saveError, t('checkout.saveToProfileFailed'))
            );
            console.error("Failed to save address:", saveError);
          }
        }
      };

      const persistPhoneProfile = async () => {
        // Persist an inline label for a selected saved phone that lacked one
        if (selectedPhoneId !== "new") {
          const selectedPhone = phones.find((p) => p._id === selectedPhoneId);
          if (
            selectedPhone &&
            !(selectedPhone.label && selectedPhone.label.trim()) &&
            inlinePhoneLabel.trim()
          ) {
            try {
              await dispatch(
                updatePhone({
                  phoneId: selectedPhoneId,
                  label: inlinePhoneLabel.trim(),
                })
              ).unwrap();
              toast.success(t('checkout.labelSaved'));
            } catch (saveError) {
              toast.error(
                getErrorMessage(saveError, t('checkout.labelSaveFailed'))
              );
              console.error("Failed to save phone label:", saveError);
            }
          }
        }

        // Save a brand-new phone to the profile when requested
        if (savePhoneToProfile && selectedPhoneId === "new") {
          try {
            await dispatch(
              createPhone({
                phone: phoneToLocalDigits(shippingAddress.phone),
                label: newPhoneLabel.trim(),
              })
            ).unwrap();
          } catch (saveError) {
            toast.error(
              getErrorMessage(saveError, t('checkout.saveToProfileFailed'))
            );
            console.error("Failed to save phone:", saveError);
          }
        }
      };

      await Promise.all([persistAddressProfile(), persistPhoneProfile()]);

      if (paymentMethod === "cash") {
        const order = await dispatch(
          createCashOrder({
            cartId,
            orderData: { shippingAddress: finalShippingAddress },
          })
        ).unwrap();
        // The backend already deleted this cart when the order was created, so
        // clear the local Redux cart state to keep the badge and /cart in sync.
        // Mark the order as placed first so the empty-cart redirect is skipped.
        orderPlacedRef.current = true;
        dispatch(resetCart());
        toast.success(t('checkout.orderPlacedSuccess'));
        navigate(`/order-confirmation/${order._id}`);
      } else {
        await dispatch(
          createCheckoutSession({
            cartId,
            shippingAddress: finalShippingAddress,
          })
        ).unwrap();
      }
    } catch (error) {
      toast.error(getErrorMessage(error, t('checkout.orderCreationFailed')));
      console.error("Order creation failed:", error);
    }
  };

  // Compute label-input errors for the currently active label field:
  // the inline prompt for a selected saved entry that lacks a label, or the
  // label shown only when a brand-new entry is being saved to the profile.
  const getLabelErrors = () => {
    const errors: {
      address?: "required" | "tooLong";
      phone?: "required" | "tooLong";
    } = {};

    // Address label is required when the selected saved address has no label,
    // or when a new address is being saved to the profile.
    const selectedAddress = addresses.find((a) => a._id === selectedAddressId);
    const needsAddressLabel =
      (selectedAddress !== undefined &&
        !(selectedAddress.label && selectedAddress.label.trim())) ||
      (selectedAddressId === "new" && saveAddressToProfile);
    if (needsAddressLabel) {
      const addressLabel =
        selectedAddress !== undefined ? inlineAddressLabel : newAddressLabel;
      if (!addressLabel.trim()) errors.address = "required";
      else if (addressLabel.trim().length > 30) errors.address = "tooLong";
    }

    // Phone label: same rules, applied to phones.
    const selectedPhone = phones.find((p) => p._id === selectedPhoneId);
    const needsPhoneLabel =
      (selectedPhone !== undefined &&
        !(selectedPhone.label && selectedPhone.label.trim())) ||
      (selectedPhoneId === "new" && savePhoneToProfile);
    if (needsPhoneLabel) {
      const phoneLabel =
        selectedPhone !== undefined ? inlinePhoneLabel : newPhoneLabel;
      if (!phoneLabel.trim()) errors.phone = "required";
      else if (phoneLabel.trim().length > 30) errors.phone = "tooLong";
    }

    return errors;
  };

  const validateForm = () => {
    const baseValid =
      Boolean(customerInfo.email) &&
      Boolean(customerInfo.userName) &&
      Boolean(shippingAddress.wilaya) &&
      Boolean(shippingAddress.dayra) &&
      Boolean(shippingAddress.baladiya) &&
      isCompleteLocalPhone(shippingAddress.phone);
    const labelErrors = getLabelErrors();
    return baseValid && !labelErrors.address && !labelErrors.phone;
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

  // Names of the fields still blocking submission (shown after a failed attempt)
  const missingFields = (() => {
    if (!attemptedSubmit) return [] as string[];
    const missing: string[] = [];
    if (!customerInfo.userName.trim()) missing.push(t('checkout.userName'));
    if (!customerInfo.email.trim()) missing.push(t('checkout.emailAddress'));
    if (!shippingAddress.wilaya) missing.push(t('checkout.wilaya'));
    if (!shippingAddress.dayra) missing.push(t('checkout.dayra'));
    if (!shippingAddress.baladiya) missing.push(t('checkout.baladiya'));
    if (!isCompleteLocalPhone(shippingAddress.phone))
      missing.push(t('checkout.phoneNumber'));
    return missing;
  })();

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
              <Lock className="h-4 w-4 text-success" />
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
                  <Card className="cursor-pointer hover:shadow-sm transition-shadow">
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
                            {formatPrice(total)}
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
                              {...responsiveImageProps(
                                item.product.mainImage,
                                [48, 72, 96],
                                "48px"
                              )}
                              alt={item.product.name}
                              loading="lazy"
                              decoding="async"
                              className="w-12 h-12 rounded object-contain bg-muted"
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
                            {formatPrice(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                      <Separator />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>{t('checkout.subtotal')}</span>
                          <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('checkout.shipping')}</span>
                          <span>{formatPrice(shippingCost)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>{t('checkout.total')}</span>
                          <span>{formatPrice(total)}</span>
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
                    <Label htmlFor="userName">{t('checkout.userName')} *</Label>
                    <Input
                      id="userName"
                      value={customerInfo.userName}
                      onChange={(e) =>
                        setCustomerInfo((prev) => ({
                          ...prev,
                          userName: e.target.value,
                        }))
                      }
                      placeholder={t('checkout.userNamePlaceholder')}
                      disabled={isProcessing}
                      aria-invalid={
                        attemptedSubmit && !customerInfo.userName.trim()
                      }
                      aria-describedby={
                        attemptedSubmit && !customerInfo.userName.trim()
                          ? "userName-error"
                          : undefined
                      }
                      className={
                        attemptedSubmit && !customerInfo.userName.trim()
                          ? "border-destructive"
                          : ""
                      }
                    />
                    {attemptedSubmit && !customerInfo.userName.trim() && (
                      <p
                        id="userName-error"
                        role="alert"
                        className="text-xs text-destructive"
                      >
                        {t('checkout.fieldRequired')}
                      </p>
                    )}
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
              </CardContent>
            </Card>

            {/* Phone Number */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {t('checkout.phoneNumber')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Saved phone selector */}
                <div className="space-y-3">
                  <Label>{t('checkout.savedPhones')}</Label>
                  <RadioGroup
                    value={selectedPhoneId}
                    onValueChange={handlePhoneSelect}
                    disabled={isProcessing}
                  >
                    {phones.map((phone) => {
                      const hasLabel = Boolean(
                        phone.label && phone.label.trim()
                      );
                      return (
                        <div
                          key={phone._id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={phone._id}
                              id={`phone-${phone._id}`}
                            />
                            <div>
                              {hasLabel ? (
                                <>
                                  <Label
                                    htmlFor={`phone-${phone._id}`}
                                    className="font-medium"
                                  >
                                    {phone.label}
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    {formatPhoneForDisplay(phone.phone)}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <Label
                                    htmlFor={`phone-${phone._id}`}
                                    className="font-medium"
                                  >
                                    {formatPhoneForDisplay(phone.phone)}
                                  </Label>
                                  <Badge variant="secondary" className="mt-1">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    {t('checkout.labelMissing')}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                          {phone.isDefault && (
                            <Badge variant="secondary">
                              {t('checkout.default')}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                    <div className="flex items-center p-3 border rounded-lg">
                      <RadioGroupItem value="new" id="new-phone" />
                      <Label htmlFor="new-phone" className="font-medium ml-2">
                        {t('checkout.newPhone')}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Inline label prompt for a selected saved phone missing a label */}
                {selectedPhoneId !== "new" &&
                  (() => {
                    const selectedPhone = phones.find(
                      (p) => p._id === selectedPhoneId
                    );
                    if (
                      !selectedPhone ||
                      (selectedPhone.label && selectedPhone.label.trim())
                    ) {
                      return null;
                    }
                    return (
                      <div className="space-y-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm">
                        <p className="text-xs text-muted-foreground">
                          {t('checkout.labelNeededPrompt')}
                        </p>
                        <Label htmlFor="inline-phone-label">
                          {t('checkout.label')} *
                        </Label>
                        <Input
                          id="inline-phone-label"
                          value={inlinePhoneLabel}
                          onChange={(e) => setInlinePhoneLabel(e.target.value)}
                          placeholder={t('checkout.labelPlaceholder')}
                          maxLength={30}
                          disabled={isProcessing}
                          aria-invalid={Boolean(labelErrors.phone)}
                          aria-describedby={
                            labelErrors.phone
                              ? "inline-phone-label-error"
                              : undefined
                          }
                          className={
                            labelErrors.phone ? "border-destructive" : ""
                          }
                        />
                        {labelErrors.phone === "required" && (
                          <p
                            id="inline-phone-label-error"
                            role="alert"
                            className="text-xs text-destructive"
                          >
                            {t('checkout.labelRequired')}
                          </p>
                        )}
                        {labelErrors.phone === "tooLong" && (
                          <p
                            id="inline-phone-label-error"
                            role="alert"
                            className="text-xs text-destructive"
                          >
                            {t('checkout.labelMaxLength')}
                          </p>
                        )}
                      </div>
                    );
                  })()}

                {/* Phone number input */}
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('checkout.phoneNumber')} *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      className={`pl-10 ${phoneError ? "border-destructive" : ""}`}
                      aria-invalid={phoneError}
                      aria-describedby={phoneError ? "phone-error" : undefined}
                      value={shippingAddress.phone}
                      onChange={(e) => {
                        setPhoneError(false);
                        setShippingAddress((prev) => ({
                          ...prev,
                          phone: maskPhoneChange(e.target.value),
                        }));
                      }}
                      placeholder={t('checkout.phonePlaceholder')}
                      disabled={isProcessing || selectedPhoneId !== "new"}
                    />
                  </div>
                  {phoneError && (
                    <p
                      id="phone-error"
                      role="alert"
                      className="text-xs text-destructive"
                    >
                      {t('checkout.phoneInvalid')}
                    </p>
                  )}
                  {paymentMethod === "cash" && (
                    <p className="text-xs text-muted-foreground">
                      {t('checkout.phoneRequiredCOD')}
                    </p>
                  )}
                </div>

                {/* Save new phone to profile (only when typing a new phone) */}
                {selectedPhoneId === "new" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="savePhoneToProfile"
                        checked={savePhoneToProfile}
                        onCheckedChange={(checked) =>
                          setSavePhoneToProfile(checked === true)
                        }
                        disabled={isProcessing}
                      />
                      <Label
                        htmlFor="savePhoneToProfile"
                        className="text-sm font-normal"
                      >
                        {t('checkout.savePhoneToProfile')}
                      </Label>
                    </div>
                    {savePhoneToProfile && (
                      <div className="space-y-2">
                        <Label htmlFor="new-phone-label">
                          {t('checkout.label')} *
                        </Label>
                        <Input
                          id="new-phone-label"
                          value={newPhoneLabel}
                          onChange={(e) => setNewPhoneLabel(e.target.value)}
                          placeholder={t('checkout.labelPlaceholder')}
                          maxLength={30}
                          disabled={isProcessing}
                          aria-invalid={Boolean(labelErrors.phone)}
                          aria-describedby={
                            labelErrors.phone
                              ? "new-phone-label-error"
                              : undefined
                          }
                          className={
                            labelErrors.phone ? "border-destructive" : ""
                          }
                        />
                        {labelErrors.phone === "required" && (
                          <p
                            id="new-phone-label-error"
                            role="alert"
                            className="text-xs text-destructive"
                          >
                            {t('checkout.labelRequired')}
                          </p>
                        )}
                        {labelErrors.phone === "tooLong" && (
                          <p
                            id="new-phone-label-error"
                            role="alert"
                            className="text-xs text-destructive"
                          >
                            {t('checkout.labelMaxLength')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
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
                    {addresses.map((address) => {
                      const hasLabel = Boolean(
                        address.label && address.label.trim()
                      );
                      return (
                        <div
                          key={address._id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value={address._id}
                              id={`address-${address._id}`}
                            />
                            <div>
                              {hasLabel ? (
                                <>
                                  <Label
                                    htmlFor={`address-${address._id}`}
                                    className="font-medium"
                                  >
                                    {address.label}
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    {address.wilaya} - {address.dayra} -{" "}
                                    {address.baladiya}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <Label
                                    htmlFor={`address-${address._id}`}
                                    className="font-medium"
                                  >
                                    {address.wilaya} - {address.dayra} -{" "}
                                    {address.baladiya}
                                  </Label>
                                  <Badge variant="secondary" className="mt-1">
                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                    {t('checkout.labelMissing')}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                          {address.isDefault && (
                            <Badge variant="secondary">
                              {t('checkout.default')}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                    <div className="flex items-center p-3 border rounded-lg">
                      <RadioGroupItem value="new" id="new-address" />
                      <Label htmlFor="new-address" className="font-medium ml-2">
                        {t('checkout.newAddress')}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Inline label prompt for a selected saved address missing a label */}
                {selectedAddressId !== "new" &&
                  (() => {
                    const selectedAddress = addresses.find(
                      (a) => a._id === selectedAddressId
                    );
                    if (
                      !selectedAddress ||
                      (selectedAddress.label && selectedAddress.label.trim())
                    ) {
                      return null;
                    }
                    return (
                      <div className="space-y-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm">
                        <p className="text-xs text-muted-foreground">
                          {t('checkout.labelNeededPrompt')}
                        </p>
                        <Label htmlFor="inline-address-label">
                          {t('checkout.label')} *
                        </Label>
                        <Input
                          id="inline-address-label"
                          value={inlineAddressLabel}
                          onChange={(e) =>
                            setInlineAddressLabel(e.target.value)
                          }
                          placeholder={t('checkout.labelPlaceholder')}
                          maxLength={30}
                          disabled={isProcessing}
                          aria-invalid={Boolean(labelErrors.address)}
                          aria-describedby={
                            labelErrors.address
                              ? "inline-address-label-error"
                              : undefined
                          }
                          className={
                            labelErrors.address ? "border-destructive" : ""
                          }
                        />
                        {labelErrors.address === "required" && (
                          <p
                            id="inline-address-label-error"
                            role="alert"
                            className="text-xs text-destructive"
                          >
                            {t('checkout.labelRequired')}
                          </p>
                        )}
                        {labelErrors.address === "tooLong" && (
                          <p
                            id="inline-address-label-error"
                            role="alert"
                            className="text-xs text-destructive"
                          >
                            {t('checkout.labelMaxLength')}
                          </p>
                        )}
                      </div>
                    );
                  })()}

                <AddressCascadeFields
                  value={{
                    wilaya: shippingAddress.wilaya,
                    dayra: shippingAddress.dayra,
                    baladiya: shippingAddress.baladiya,
                  }}
                  onChange={(field, value) =>
                    setShippingAddress((prev) => ({ ...prev, [field]: value }))
                  }
                  disabled={isProcessing || selectedAddressId !== "new"}
                  idPrefix="co"
                />

                {/* Save new address to profile (only when typing a new address) */}
                {selectedAddressId === "new" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="saveAddressToProfile"
                        checked={saveAddressToProfile}
                        onCheckedChange={(checked) =>
                          setSaveAddressToProfile(checked === true)
                        }
                        disabled={isProcessing}
                      />
                      <Label
                        htmlFor="saveAddressToProfile"
                        className="text-sm font-normal"
                      >
                        {t('checkout.saveAddressToProfile')}
                      </Label>
                    </div>
                    {saveAddressToProfile && (
                      <div className="space-y-2">
                        <Label htmlFor="new-address-label">
                          {t('checkout.label')} *
                        </Label>
                        <Input
                          id="new-address-label"
                          value={newAddressLabel}
                          onChange={(e) => setNewAddressLabel(e.target.value)}
                          placeholder={t('checkout.labelPlaceholder')}
                          maxLength={30}
                          disabled={isProcessing}
                          aria-invalid={Boolean(labelErrors.address)}
                          aria-describedby={
                            labelErrors.address
                              ? "new-address-label-error"
                              : undefined
                          }
                          className={
                            labelErrors.address ? "border-destructive" : ""
                          }
                        />
                        {labelErrors.address === "required" && (
                          <p
                            id="new-address-label-error"
                            role="alert"
                            className="text-xs text-destructive"
                          >
                            {t('checkout.labelRequired')}
                          </p>
                        )}
                        {labelErrors.address === "tooLong" && (
                          <p
                            id="new-address-label-error"
                            role="alert"
                            className="text-xs text-destructive"
                          >
                            {t('checkout.labelMaxLength')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
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
  <span className="font-semibold">{formatPrice(shippingCost)}</span>
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
                          {...responsiveImageProps(
                            item.product.mainImage,
                            [64, 96, 128],
                            "64px"
                          )}
                          alt={item.product.name}
                          loading="lazy"
                          decoding="async"
                          className="w-16 h-16 rounded object-contain bg-muted"
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
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t('checkout.subtotal')}</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{t('checkout.shipping')}</span>
                      <span>{formatPrice(shippingCost)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>{t('checkout.total')}</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Indicators */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-success" />
                    <span>{t('checkout.sslSecured')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Banknote className="h-4 w-4 text-info" />
                    <span>{t('checkout.codAvailable')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-info" />
                    <span>{t('checkout.liveTracking')}</span>
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
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-background border-t p-4 z-10 shadow-sm">
          {missingFields.length > 0 && (
            <div
              role="alert"
              className="mb-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm"
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
              <div>
                <p className="font-medium">
                  {t('checkout.completeRequiredFields')}
                </p>
                <p className="text-muted-foreground">{missingFields.join(" · ")}</p>
              </div>
            </div>
          )}
          <Button
            size="lg"
            className="w-full"
            onClick={handlePlaceOrder}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('checkout.processing')}
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                {t('checkout.placeOrder')} • {formatPrice(total)}
              </>
            )}
          </Button>
        </div>

        {/* Desktop Place Order Button — sticky, centered */}
<div className="hidden lg:block fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t p-4 z-10 shadow-sm">
  <div className="max-w-2xl mx-auto">
    {missingFields.length > 0 && (
      <div
        role="alert"
        className="mb-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm"
      >
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
        <div>
          <p className="font-medium">{t('checkout.completeRequiredFields')}</p>
          <p className="text-muted-foreground">{missingFields.join(" · ")}</p>
        </div>
      </div>
    )}
    <Button
      size="lg"
      className="w-full"
      onClick={handlePlaceOrder}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {t('checkout.processingOrder')}
        </>
      ) : (
        <>
          <Lock className="h-4 w-4 mr-2" />
          {t('checkout.placeOrder')} • {formatPrice(total)}
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