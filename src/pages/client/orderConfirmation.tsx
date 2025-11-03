import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  clearError,
} from "../../features/orders/ordersSlice";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import { downloadInvoiceAPI } from "../../features/orders/ordersAPI";

const OrderConfirmationPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { currentOrder, loadingOrder, orderError } = useAppSelector(
    (state) => state.orders
  );
  const [emailSent] = useState(true);

  useEffect(() => {
    if (id) {
      dispatch(getOrder(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (orderError) {
      toast.error(orderError);
      dispatch(clearError());
      navigate("/checkout");
    }
  }, [orderError, dispatch, navigate]);

  if (loadingOrder || !currentOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">
            {t("orderConfirmation.loading.message")}
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
      case "in_transit":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
      case "authorized":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
      case "refunded":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentMethodColor = (status: string) => {
    switch (status) {
      case "cash":
        return "bg-green-100 text-green-800 border-green-200";
      case "card":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4 sm:p-6 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {t("orderConfirmation.header.title")}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              {t("orderConfirmation.header.subtitle")}
            </p>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 inline-block">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                {t("orderConfirmation.header.orderNumberLabel")}
              </p>
              <p className="text-base sm:text-lg font-mono font-semibold text-gray-900 break-all">
                {order._id}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Badge
                className={`${getStatusColor(
                  order.deliveryStatus
                )} border px-3 py-1`}
              >
                {order.deliveryStatus.replace("_", " ").toUpperCase()}
              </Badge>
              <Badge
                className={`${getPaymentStatusColor(
                  order.paymentStatus
                )} border px-3 py-1`}
              >
                {t("orderConfirmation.header.paymentStatus", {
                  status: order.paymentStatus.toUpperCase(),
                })}
              </Badge>
              <Badge className={`${getPaymentMethodColor(
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

        {emailSent && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-6 flex items-start space-x-3">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-blue-800 font-medium text-sm sm:text-base">
                {t("orderConfirmation.emailBanner.title")}
              </p>
              <p
                className="text-blue-700 text-xs sm:text-sm break-words"
                dangerouslySetInnerHTML={{
                  __html: t("orderConfirmation.emailBanner.confirmationSentTo", {
                    email: order.user.email,
                  }),
                }}
              />
            </div>
          </div>
        )}

        {order.paymentMethodType === "cash" && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4 mb-6 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-amber-800 font-medium text-sm sm:text-base">
                {t("orderConfirmation.payment.cod")}
              </p>
              <p
                className="text-amber-700 text-xs sm:text-sm"
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
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Package className="w-5 h-5 text-gray-600" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  {t("orderConfirmation.items.title")}
                </h2>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {order.cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={item.product.mainImage}
                      alt={item.product.title}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base line-clamp-2">
                        {item.product.title}
                      </h3>
                      {item.color && (
                        <p className="text-xs sm:text-sm text-gray-600">
                          {t("orderConfirmation.items.color", {
                            color: item.color,
                          })}
                        </p>
                      )}
                      <p className="text-xs sm:text-sm text-gray-600">
                        {t("orderConfirmation.items.quantity", {
                          qty: item.quantity,
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base">
                        {item.price.toFixed(2)} DA
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Truck className="w-5 h-5 text-gray-600" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  {t("orderConfirmation.shipping.title")}
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                    {t("orderConfirmation.shipping.deliveryAddress")}
                  </h3>
                  <div className="text-xs sm:text-sm text-gray-600 space-y-1">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p>{order.user.name}</p>
                        {order.shippingAddress.details && (
                          <p>{order.shippingAddress.details}</p>
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
                  <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                    {t("orderConfirmation.shipping.deliveryStatus")}
                  </h3>
                  <div className="space-y-2">
                    <Badge
                      className={`${getStatusColor(
                        order.deliveryStatus
                      )} border`}
                    >
                      {order.deliveryStatus.replace("_", " ").toUpperCase()}
                    </Badge>
                    {order.trackingNumber && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs sm:text-sm font-medium text-blue-800">
                          {t("orderConfirmation.shipping.trackingNumber")}
                        </p>
                        <p className="text-xs sm:text-sm text-blue-700 font-mono mt-1">
                          {order.trackingNumber}
                        </p>
                      </div>
                    )}
                    {order.deliveryAgency && (
                      <div className="text-xs sm:text-sm text-gray-600">
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
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
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
                          <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {history.status.replace("_", " ").toUpperCase()}
                            </p>
                            <p className="text-gray-600">{history.note}</p>
                            <p className="text-gray-500 text-xs">
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

            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  {t("orderConfirmation.payment.title")}
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">
                        {t(
                          order.paymentMethodType === "cash"
                            ? "orderConfirmation.payment.cod"
                            : "orderConfirmation.payment.cardPayment"
                        )}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {t("orderConfirmation.payment.statusLabel")}
                        <span
                          className={
                            order.isPaid ? "text-green-600" : "text-yellow-600"
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
                    className={`${getPaymentStatusColor(
                      order.paymentStatus
                    )} border`}
                  >
                    {order.paymentStatus.toUpperCase()}
                  </Badge>
                </div>
                {order.paymentMethodType === "cash" && order.codAmount && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs sm:text-sm font-medium text-amber-900">
                      {t("orderConfirmation.payment.amountToPay", {
                        amount: order.codAmount.toFixed(2),
                      })}
                    </p>
                  </div>
                )}
                {order.isPaid && order.paidAt && (
                  <p className="text-xs sm:text-sm text-gray-600">
                    {t("orderConfirmation.payment.paidOn", {
                      date: formatDate(order.paidAt),
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                {t("orderConfirmation.summary.title")}
              </h2>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">
                    {t("orderConfirmation.summary.subtotal")}
                  </span>
                  <span className="text-gray-900">{subtotal.toFixed(2)} DA</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">
                    {t("orderConfirmation.summary.shipping")}
                  </span>
                  <span className="text-gray-900">{shipping.toFixed(2)} DA</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">
                    {t("orderConfirmation.summary.tax")}
                  </span>
                  <span className="text-gray-900">{tax.toFixed(2)} DA</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base sm:text-lg font-semibold">
                  <span className="text-gray-900">
                    {t("orderConfirmation.summary.total")}
                  </span>
                  <span className="text-gray-900">{total.toFixed(2)} DA</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                {t("orderConfirmation.summary.placedOn", {
                  date: formatDate(order.createdAt),
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
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

            <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
                {t("orderConfirmation.support.title")}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      {t("orderConfirmation.support.customerSupport")}
                    </p>
                    <p className="text-xs text-gray-600">1-800-SUPPORT</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      {t("orderConfirmation.support.emailSupport")}
                    </p>
                    <p className="text-xs text-gray-600 break-all">
                      support@store.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-sm p-4 sm:p-6">
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

        <div className="mt-4 sm:mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <h3 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">
            {t("orderConfirmation.nextSteps.title")}
          </h3>
          <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
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