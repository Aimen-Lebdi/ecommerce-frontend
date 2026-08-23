import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Check,
  Package,
  Truck,
  CreditCard,
  Mail,
  Phone,
  ArrowRight,
  Download,
  Share,
  Loader2,
  AlertCircle,
  MapPin,
  Clock,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  getOrder,
  getOrderBySession,
  clearError,
} from "../../features/orders/ordersSlice";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import { downloadInvoiceAPI } from "../../features/orders/ordersAPI";
import {
  deliveryStatusBadgeClass,
  paymentStatusBadgeClass,
  paymentMethodBadgeClass,
} from "../../utils/orderStatusStyles";

const OrderConfirmationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  // M2: Stripe redirects here with ?session_id=... after a successful card
  // payment. We poll until the webhook creates the order.
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const { currentOrder, loadingOrder, orderError } = useAppSelector(
    (state) => state.orders
  );

  // M3: When the Stripe webhook hasn't created the order within the poll
  // window, show an inline "payment still processing" state instead of
  // bouncing the user back to /checkout.
  const [timedOut, setTimedOut] = useState(false);
  // Incrementing re-runs the session poll (used by the timeout "Try again").
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (id) {
      dispatch(getOrder(id));
    }
  }, [id, dispatch]);

  // M2/M3: Poll getOrderBySession every 2s (timeout ~30s) while the checkout
  // webhook creates the order. Keep /:id direct path for cash orders. On
  // timeout we set `timedOut` and render the inline retry UI (no redirect).
  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 15; // 15 * 2s = 30s timeout
    const POLL_INTERVAL_MS = 2000;

    const poll = async () => {
      try {
        await dispatch(getOrderBySession(sessionId)).unwrap();
      } catch {
        if (cancelled) return;
        attempts += 1;
        if (attempts >= MAX_ATTEMPTS) {
          setTimedOut(true);
          return;
        }
        window.setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [sessionId, dispatch, retryKey]);

  // M3: Once the order is found via the Stripe session, replace the URL with
  // the canonical /order-confirmation/<id> (drops ?session_id=) so a refresh
  // loads the order directly instead of re-polling a stale session.
  useEffect(() => {
    if (currentOrder && sessionId) {
      navigate(`/order-confirmation/${currentOrder._id}`, { replace: true });
    }
  }, [currentOrder, sessionId, navigate]);

  // Re-run the session poll from the inline timeout UI.
  const handleRetry = () => {
    setTimedOut(false);
    setRetryKey((key) => key + 1);
  };

  useEffect(() => {
    if (orderError) {
      toast.error(orderError);
      dispatch(clearError());
      navigate("/checkout");
    }
  }, [orderError, dispatch, navigate]);

  // M3: Inline "payment still processing" state shown after the poll window
  // expires — lets the user retry or go back without losing their session.
  if (timedOut) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-lg shadow-sm border p-6 sm:p-8 text-center">
          <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-warning" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground mb-2">
            {t("orderConfirmation.timeout.title")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            {t("orderConfirmation.timeout.body")}
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={handleRetry}>
              {t("orderConfirmation.timeout.retry")}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/checkout">
                {t("orderConfirmation.timeout.backToCheckout")}
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            {t("orderConfirmation.timeout.supportNote")}
          </p>
        </div>
      </div>
    );
  }

  if (loadingOrder || !currentOrder) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            {t(
              sessionId
                ? "orderConfirmation.loading.processing"
                : "orderConfirmation.loading.message"
            )}
          </p>
        </div>
      </div>
    );
  }

  const order = currentOrder;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  const subtotal = order.cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = order.shippingPrice || 500;
  const tax = order.taxPrice || 0;
  const total = order.totalOrderPrice;

  const handleDownloadInvoice = async () => {
    try {
      const blob = await downloadInvoiceAPI(order._id);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${order._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(t("orderConfirmation.toasts.invoiceSuccess"));
    } catch (error) {
      toast.error(t("orderConfirmation.toasts.invoiceError"));
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-sm border border-success/30 p-4 sm:p-6 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">
              {t("orderConfirmation.header.title")}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              {t("orderConfirmation.header.subtitle")}
            </p>
            <div className="bg-muted/50 rounded-lg p-3 sm:p-4 inline-block">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                {t("orderConfirmation.header.orderNumberLabel")}
              </p>
              <p className="text-base sm:text-lg font-mono font-semibold text-foreground break-all">
                {order._id}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Badge
                className={`${deliveryStatusBadgeClass(
                  order.deliveryStatus
                )} border px-3 py-1`}
              >
                {order.deliveryStatus.replace("_", " ").toUpperCase()}
              </Badge>
              <Badge
                className={`${paymentStatusBadgeClass(
                  order.paymentStatus
                )} border px-3 py-1`}
              >
                {t("orderConfirmation.header.paymentStatus", {
                  status: order.paymentStatus.toUpperCase(),
                })}
              </Badge>
              <Badge className={`${paymentMethodBadgeClass(
                  order.paymentMethodType
                )} border px-3 py-1`}>
                {t(
                  order.paymentMethodType === "cash"
                    ? "orderConfirmation.payment.cod"
                    : "orderConfirmation.payment.cardPayment"
                )}
              </Badge>
            </div>
          </div>
        </div>

        {order.paymentMethodType === "cash" && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 sm:p-4 mb-6 flex items-start space-x-3 rtl:space-x-reverse">
            <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-foreground font-medium text-sm sm:text-base">
                {t("orderConfirmation.payment.cod")}
              </p>
              <p
                className="text-muted-foreground text-xs sm:text-sm"
                dangerouslySetInnerHTML={{
                  __html: t("orderConfirmation.codBanner.prepareCash", {
                    amount: total.toFixed(2),
                  }),
                }}
              />
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="bg-card rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                <Package className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-base sm:text-lg font-semibold text-foreground">
                  {t("orderConfirmation.items.title")}
                </h2>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {order.cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex space-x-3 sm:space-x-4 rtl:space-x-reverse p-3 sm:p-4 bg-muted/50 rounded-lg"
                  >
                    <img
                      src={item.product.mainImage}
                      alt={item.product.name}
                      loading="lazy"
                      decoding="async"
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.png";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground text-sm sm:text-base line-clamp-2">
                        {item.product.name}
                      </h3>
                      {item.color && (
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {t("orderConfirmation.items.color", {
                            color: item.color,
                          })}
                        </p>
                      )}
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t("orderConfirmation.items.quantity", {
                          qty: item.quantity,
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-foreground text-sm sm:text-base">
                        {item.price.toFixed(2)} DZD
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                <Truck className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-base sm:text-lg font-semibold text-foreground">
                  {t("orderConfirmation.shipping.title")}
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-foreground mb-2 text-sm sm:text-base">
                    {t("orderConfirmation.shipping.deliveryAddress")}
                  </h3>
                  <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p>{order.user.name}</p>
                        {order.shippingAddress.baladiya && (
                          <p>{order.shippingAddress.baladiya}</p>
                        )}
                        <p>
                          {order.shippingAddress.wilaya},{" "}
                          {order.shippingAddress.dayra}
                        </p>
                      </div>
                    </div>
                    {order.shippingAddress.phone && (
                      <div className="flex items-center gap-2 mt-2">
                        <Phone className="w-4 h-4" />
                        <p>{order.shippingAddress.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-2 text-sm sm:text-base">
                    {t("orderConfirmation.shipping.deliveryStatus")}
                  </h3>
                  <div className="space-y-2">
                    <Badge
                      className={`${deliveryStatusBadgeClass(
                        order.deliveryStatus
                      )} border`}
                    >
                      {order.deliveryStatus.replace("_", " ").toUpperCase()}
                    </Badge>
                    {order.trackingNumber && (
                      <div className="mt-3 p-3 bg-info/10 border border-info/30 rounded-lg">
                        <p className="text-xs sm:text-sm font-medium text-info">
                          {t("orderConfirmation.shipping.trackingNumber")}
                        </p>
                        <p className="text-xs sm:text-sm text-info font-mono mt-1">
                          {order.trackingNumber}
                        </p>
                      </div>
                    )}
                    {order.deliveryAgency && (
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        <p>
                          {t("orderConfirmation.shipping.deliveryPartner", {
                            name: order.deliveryAgency.name,
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="font-medium text-foreground mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Clock className="w-4 h-4" />
                    {t("orderConfirmation.shipping.timelineTitle")}
                  </h3>
                  <div className="space-y-3">
                    {order.statusHistory
                      .slice()
                      .reverse()
                      .map((history, index) => (
                        <div
                          key={index}
                          className="flex gap-3 text-xs sm:text-sm"
                        >
                          <div className="w-2 h-2 mt-1.5 rounded-full bg-primary flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-foreground">
                              {history.status.replace("_", " ").toUpperCase()}
                            </p>
                            <p className="text-muted-foreground">{history.note}</p>
                            <p className="text-muted-foreground/80 text-xs">
                              {formatDate(history.timestamp?.toString())} •{" "}
                              {history.updatedBy}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-card rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-base sm:text-lg font-semibold text-foreground">
                  {t("orderConfirmation.payment.title")}
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-8 h-8 bg-primary rounded flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm sm:text-base">
                        {t(
                          order.paymentMethodType === "cash"
                            ? "orderConfirmation.payment.cod"
                            : "orderConfirmation.payment.cardPayment"
                        )}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t("orderConfirmation.payment.statusLabel")}
                        <span
                          className={
                            order.isPaid
                              ? "text-success"
                              : "text-warning"
                          }
                        >
                          {t(
                            order.isPaid
                              ? "orderConfirmation.payment.paid"
                              : "orderConfirmation.payment.pending"
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={`${paymentStatusBadgeClass(
                      order.paymentStatus
                    )} border`}
                  >
                    {order.paymentStatus.toUpperCase()}
                  </Badge>
                </div>
                {order.paymentMethodType === "cash" && order.codAmount && (
                  <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
                    <p className="text-xs sm:text-sm font-medium text-foreground">
                      {t("orderConfirmation.payment.amountToPay", {
                        amount: order.codAmount.toFixed(2),
                      })}
                    </p>
                  </div>
                )}
                {order.isPaid && order.paidAt && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t("orderConfirmation.payment.paidOn", {
                      date: formatDate(order.paidAt),
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-card rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">
                {t("orderConfirmation.summary.title")}
              </h2>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">
                    {t("orderConfirmation.summary.subtotal")}
                  </span>
                  <span className="text-foreground">{subtotal.toFixed(2)} DZD</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">
                    {t("orderConfirmation.summary.shipping")}
                  </span>
                  <span className="text-foreground">{shipping.toFixed(2)} DZD</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">
                    {t("orderConfirmation.summary.tax")}
                  </span>
                  <span className="text-foreground">{tax.toFixed(2)} DZD</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base sm:text-lg font-semibold">
                  <span className="text-foreground">
                    {t("orderConfirmation.summary.total")}
                  </span>
                  <span className="text-foreground">{total.toFixed(2)} DZD</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                {t("orderConfirmation.summary.placedOn", {
                  date: formatDate(order.createdAt),
                })}
              </div>
            </div>

            <div className="bg-card rounded-lg shadow-sm p-4 sm:p-6">
              <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">
                {t("orderConfirmation.actions.title")}
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {order.trackingNumber && (
                  <Button
                    // variant="outline"
                    className="w-full justify-between text-xs sm:text-sm"
                    asChild
                  >
                    <Link to={`/orders/${order._id}/tracking`}>
                      <span>{t("orderConfirmation.actions.trackOrder")}</span>
                      <Truck className="w-4 h-4" />
                    </Link>
                  </Button>
                )}
                <Button
                  // variant="outline"
                  className="w-full justify-between text-xs sm:text-sm"
                  onClick={handleDownloadInvoice}
                >
                  <span>
                    {t("orderConfirmation.actions.downloadInvoice")}
                  </span>
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  // variant="outline"
                  className="w-full justify-between text-xs sm:text-sm"
                  onClick={() => {
                    navigator.share?.({
                      title: t("orderConfirmation.actions.shareTitle"),
                      text: t("orderConfirmation.actions.shareText", { id: order._id }),
                      url: window.location.href,
                    });
                  }}
                >
                  <span>{t("orderConfirmation.actions.shareOrder")}</span>
                  <Share className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 sm:p-6">
              <h3 className="font-semibold text-foreground mb-3 text-sm sm:text-base">
                {t("orderConfirmation.support.title")}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                {t("orderConfirmation.support.description")}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/contact">
                  <Mail className="w-4 h-4" />
                  {t("header.nav.contact")}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 bg-card rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {order.trackingNumber && (
              <Button className="flex-1 text-sm sm:text-base" asChild>
                <Link to={`/orders/${order._id}/tracking`}>
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {t("orderConfirmation.actions.trackYourOrder")}
                </Link>
              </Button>
            )}
            <Button
              // variant="outline"
              className="flex-1 text-sm sm:text-base"
              asChild
            >
              <Link to="/my-account?tab=orders">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {t("orderConfirmation.actions.viewAllOrders")}
              </Link>
            </Button>
            <Button
              variant="default"
              className="flex-1 text-sm sm:text-base"
              asChild
            >
              <Link to="/shop">
                <span>{t("orderConfirmation.actions.continueShopping")}</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 bg-info/10 border border-info/30 rounded-lg p-3 sm:p-4">
          <h3 className="font-medium text-info mb-2 text-sm sm:text-base">
            {t("orderConfirmation.nextSteps.title")}
          </h3>
          <ul className="text-xs sm:text-sm text-info space-y-1">
            <li>
              •{" "}
              {t(
                order.paymentMethodType === "cash"
                  ? "orderConfirmation.nextSteps.codConfirmation"
                  : "orderConfirmation.nextSteps.cardConfirmation"
              )}
            </li>
            <li>• {t("orderConfirmation.nextSteps.shippingUpdates")}</li>
            <li>• {t("orderConfirmation.nextSteps.trackPackage")}</li>
            <li>• {t("orderConfirmation.nextSteps.contactUs")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;