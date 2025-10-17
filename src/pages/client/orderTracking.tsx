import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Phone,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  getOrderTracking,
  clearTrackingInfo,
  clearError,
} from "../../features/orders/ordersSlice";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";

const OrderTracking = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { trackingInfo, loadingTracking, error } = useAppSelector(
    (state) => state.orders
  );

  useEffect(() => {
    if (id) {
      dispatch(getOrderTracking(id));
    }

    return () => {
      dispatch(clearTrackingInfo());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  if (loadingTracking) {
    return (
      <div className="container py-10 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {t('orderTracking.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (!trackingInfo) {
    return (
      <div className="container py-10">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {t('orderTracking.trackingNotAvailable')}
          </h1>
          <p className="text-muted-foreground mb-6">
            {t('orderTracking.unableToLoad')}
          </p>
          <Button onClick={() => navigate("/orders")}>{t('orderTracking.viewAllOrders')}</Button>
        </div>
      </div>
    );
  }

  const order = trackingInfo.order;

  const formatDate = (dateString?: Date) => {
    if (!dateString) return t('orderTracking.notAvailable');
    try {
      return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
    } catch {
      return String(dateString);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
      case "confirmed":
        return <Clock className="w-5 h-5" />;
      case "shipped":
      case "in_transit":
      case "out_for_delivery":
        return <Truck className="w-5 h-5" />;
      case "delivered":
      case "completed":
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "confirmed":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "shipped":
      case "in_transit":
      case "out_for_delivery":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "delivered":
      case "completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "failed":
      case "returned":
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const statusSteps = [
    { key: "pending", label: t('orderTracking.statusSteps.orderPlaced') },
    { key: "confirmed", label: t('orderTracking.statusSteps.confirmed') },
    { key: "shipped", label: t('orderTracking.statusSteps.shipped') },
    { key: "in_transit", label: t('orderTracking.statusSteps.inTransit') },
    { key: "out_for_delivery", label: t('orderTracking.statusSteps.outForDelivery') },
    { key: "delivered", label: t('orderTracking.statusSteps.delivered') },
  ];

  const getCurrentStepIndex = () => {
    return statusSteps.findIndex((step) => step.key === order.deliveryStatus);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-muted/20 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('orderTracking.back')}
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">{t('orderTracking.trackYourOrder')}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {t('orderTracking.orderNumber', { number: order.orderNumber })}
          </p>
        </div>

        {/* Current Status Card */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div
                className={`p-3 sm:p-4 rounded-full ${getStatusColor(
                  order.deliveryStatus
                )}`}
              >
                {getStatusIcon(order.deliveryStatus)}
              </div>
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-bold mb-1">
                  {order.deliveryStatus.replace("_", " ").toUpperCase()}
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {order.trackingNumber
                    ? t('orderTracking.trackingNumber', { number: order.trackingNumber })
                    : t('orderTracking.orderBeingProcessed')}
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Badge
                  variant={order.isPaid ? "default" : "secondary"}
                  className="flex-1 sm:flex-none justify-center"
                >
                  {order.isPaid ? t('orderTracking.paid') : t('orderTracking.paymentPending')}
                </Badge>
                <Badge
                  variant={order.isDelivered ? "default" : "secondary"}
                  className="flex-1 sm:flex-none justify-center"
                >
                  {order.isDelivered ? t('orderTracking.delivered') : t('orderTracking.inProgress')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Timeline */}
        {!["cancelled", "failed", "returned"].includes(
          order.deliveryStatus
        ) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">
                {t('orderTracking.deliveryProgress')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 hidden sm:block" />

                <div className="space-y-4 sm:space-y-6">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                      <div
                        key={step.key}
                        className="relative flex items-start gap-3 sm:gap-4"
                      >
                        {/* Step Icon */}
                        <div
                          className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            isCompleted
                              ? "bg-primary border-primary text-primary-foreground"
                              : "bg-background border-gray-300 text-gray-400"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-300" />
                          )}
                        </div>

                        {/* Step Content */}
                        <div className="flex-1 pb-4">
                          <p
                            className={`font-medium text-sm sm:text-base ${
                              isCurrent
                                ? "text-primary"
                                : isCompleted
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {step.label}
                          </p>
                          {isCurrent &&
                            order.statusHistory[
                              order.statusHistory.length - 1
                            ] && (
                              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                {
                                  order.statusHistory[
                                    order.statusHistory.length - 1
                                  ].note
                                }
                              </p>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status History */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              {t('orderTracking.orderHistory')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {order.statusHistory
                .slice()
                .reverse()
                .map((history, index) => (
                  <div key={index}>
                    <div className="flex gap-3 sm:gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-primary" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                          <p className="font-medium text-sm sm:text-base">
                            {history.status.replace("_", " ").toUpperCase()}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {formatDate(history.timestamp)}
                          </p>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                          {history.note}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t('orderTracking.updatedBy', { name: history.updatedBy })}
                        </p>
                      </div>
                    </div>
                    {index < order.statusHistory.length - 1 && (
                      <Separator className="my-3 sm:my-4" />
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t('orderTracking.deliveryAddress')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-medium">{t('orderTracking.shippingAddress')}</p>
                <p className="text-muted-foreground">
                  {t('orderTracking.contactForDelivery')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <Package className="w-4 h-4" />
                {t('orderTracking.orderSummary')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('orderTracking.totalAmount')}</span>
                  <span className="font-semibold">
                    {order.totalOrderPrice.toFixed(2)} DA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('orderTracking.paymentStatus')}</span>
                  <Badge variant={order.isPaid ? "default" : "secondary"}>
                    {order.isPaid ? t('orderTracking.paid') : t('orderTracking.pending')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Need Help Section */}
        <Card className="mt-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base sm:text-lg mb-1">
                  {t('orderTracking.needHelp')}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {t('orderTracking.contactSupportDescription')}
                </p>
              </div>
              <Button variant="outline" className="w-full sm:w-auto" asChild>
                <Link to=''>{t('orderTracking.contactSupport')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button className="flex-1" asChild>
            <Link to={`/order-confirmation/${id}`}>
              <Package className="w-4 h-4 mr-2" />
              {t('orderTracking.viewOrderDetails')}
            </Link>
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <Link to="/my-account?tab=orders">{t('orderTracking.viewAllOrders')}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;