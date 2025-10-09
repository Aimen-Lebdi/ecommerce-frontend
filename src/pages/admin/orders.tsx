/* eslint-disable react-hooks/rules-of-hooks */
import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { 
  DataTable,
  type ServerQueryParams,
} from "../../components/admin/global/data-table";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchOrders,
  confirmOrder,
  confirmCardOrder,
  shipOrder,
  cancelOrder,
  getOrderTracking,
  simulateDelivery,
  clearError,
  setQueryParams,
  type Order,
} from "../../features/orders/ordersSlice";
import {
  IconPackage,
  IconTruck,
  IconCircleCheck,
  IconX,
  IconEye,
  IconMapPin,
  IconCreditCard,
  IconClock,
  IconUser,
  IconPhone,
  IconPlayerPlay,
  IconInfoCircle,
} from "@tabler/icons-react";

// Status badge helper functions
const getDeliveryStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
    pending: { label: "Pending", variant: "secondary" },
    confirmed: { label: "Confirmed", variant: "default" },
    shipped: { label: "Shipped", variant: "default" },
    in_transit: { label: "In Transit", variant: "default" },
    out_for_delivery: { label: "Out for Delivery", variant: "default" },
    delivered: { label: "Delivered", variant: "default" },
    completed: { label: "Completed", variant: "default" },
    failed: { label: "Failed", variant: "destructive" },
    returned: { label: "Returned", variant: "destructive" },
    cancelled: { label: "Cancelled", variant: "destructive" },
  };
  return statusConfig[status] || statusConfig.pending;
};

const getPaymentStatusBadge = (status: string) => {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
    pending: { label: "Pending", variant: "secondary" },
    authorized: { label: "Authorized", variant: "default" },
    confirmed: { label: "Confirmed", variant: "default" },
    completed: { label: "Completed", variant: "default" },
    failed: { label: "Failed", variant: "destructive" },
    refunded: { label: "Refunded", variant: "destructive" },
    partially_refunded: { label: "Partially Refunded", variant: "destructive" },
  };
  return statusConfig[status] || statusConfig.pending;
};

// Order Details Dialog Component
function OrderDetailsDialog({ 
  order, 
  open, 
  onOpenChange, 
  onConfirm, 
  onConfirmCard,
  onCancel, 
  onShip, 
  onSimulate,
  trackingInfo,
  isLoadingTracking,
  isConfirming,
  isShipping,
  isCancelling,
  isSimulating,
}: { 
  order: Order; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onConfirm: (id: string) => void;
  onConfirmCard: (id: string) => void;
  onCancel: (id: string, reason?: string) => void;
  onShip: (id: string) => void;
  onSimulate: (id: string, speed: string, scenario: string) => void;
  trackingInfo: any;
  isLoadingTracking: boolean;
  isConfirming: boolean;
  isShipping: boolean;
  isCancelling: boolean;
  isSimulating: boolean;
}) {
  const [cancelReason, setCancelReason] = React.useState("");
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);
  const [simulationSpeed, setSimulationSpeed] = React.useState("fast");
  const [simulationScenario, setSimulationScenario] = React.useState("success");

  const deliveryStatusConfig = getDeliveryStatusBadge(order.deliveryStatus);
  const paymentStatusConfig = getPaymentStatusBadge(order.paymentStatus);

  const handleCancelConfirm = () => {
    onCancel(order._id, cancelReason);
    setShowCancelDialog(false);
    setCancelReason("");
    onOpenChange(false);
  };

  const canConfirmCash = order.paymentMethodType === "cash" && order.deliveryStatus === "pending";
  const canConfirmCard = order.paymentMethodType === "card" && order.paymentStatus === "authorized";
  const canCancel = ["pending", "confirmed"].includes(order.deliveryStatus);
  const canShip = order.deliveryStatus === "confirmed";
  const canSimulate = order.trackingNumber && ["shipped", "in_transit"].includes(order.deliveryStatus);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Order #{order._id.slice(-8).toUpperCase()}
            </DialogTitle>
            <DialogDescription>
              Created on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Status Section */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Delivery Status</p>
                <Badge variant={deliveryStatusConfig.variant} className="text-sm">
                  <IconClock className="w-4 h-4 mr-1" />
                  {deliveryStatusConfig.label}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                <Badge variant={paymentStatusConfig.variant} className="text-sm">
                  {paymentStatusConfig.label}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                <Badge variant="outline" className="text-sm capitalize">
                  <IconCreditCard className="w-4 h-4 mr-1" />
                  {order.paymentMethodType}
                </Badge>
              </div>
              {order.trackingNumber && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tracking Number</p>
                  <p className="font-mono font-medium">{order.trackingNumber}</p>
                </div>
              )}
            </div>

            {/* Customer Information */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <IconUser className="w-5 h-5" />
                Customer Information
              </h3>
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{order.user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{order.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{order.user.phone || order.shippingAddress.phone}</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <IconMapPin className="w-5 h-5" />
                Shipping Address
              </h3>
              <div className="p-4 border rounded-lg">
                <p className="font-medium">{order.shippingAddress.wilaya}, {order.shippingAddress.dayra}</p>
                <p className="text-muted-foreground">{order.shippingAddress.details}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  <IconPhone className="w-4 h-4 inline mr-1" />
                  {order.shippingAddress.phone}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <IconPackage className="w-5 h-5" />
                Order Items ({order.cartItems.length})
              </h3>
              <div className="space-y-2">
                {order.cartItems.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <img 
                      src={item.product.imageCover} 
                      alt={item.product.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.product.title}</p>
                      {item.color && (
                        <p className="text-sm text-muted-foreground">Color: {item.color}</p>
                      )}
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{item.price} DZD</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-3">
              <h3 className="font-semibold">Order Summary</h3>
              <div className="space-y-2 p-4 border rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{(order.totalOrderPrice - (order.shippingPrice || 0)).toFixed(2)} DZD</span>
                </div>
                {order.shippingPrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{order.shippingPrice} DZD</span>
                  </div>
                )}
                {order.taxPrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{order.taxPrice} DZD</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{order.totalOrderPrice} DZD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status History */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <IconClock className="w-5 h-5" />
                Status History
              </h3>
              <div className="space-y-2">
                {order.statusHistory.map((history, idx) => (
                  <div key={idx} className="flex gap-3 p-3 border-l-2 border-primary">
                    <div className="flex-1">
                      <p className="font-medium capitalize">{history.status.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-muted-foreground">{history.note}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(history.timestamp).toLocaleString()} • Updated by {history.updatedBy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tracking Info */}
            {order.trackingNumber && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <IconTruck className="w-5 h-5" />
                  Delivery Tracking
                </h3>
                {isLoadingTracking ? (
                  <div className="p-4 border rounded-lg">
                    <p className="text-muted-foreground">Loading tracking information...</p>
                  </div>
                ) : trackingInfo ? (
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Tracking information available for: {order.trackingNumber}
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {canConfirmCash && (
                <Button 
                  onClick={() => onConfirm(order._id)}
                  disabled={isConfirming}
                  className="flex-1"
                >
                  <IconCircleCheck className="w-4 h-4 mr-2" />
                  {isConfirming ? "Confirming..." : "Confirm Order (Cash)"}
                </Button>
              )}
              
              {canConfirmCard && (
                <Button 
                  onClick={() => onConfirmCard(order._id)}
                  disabled={isConfirming}
                  className="flex-1"
                >
                  <IconCircleCheck className="w-4 h-4 mr-2" />
                  {isConfirming ? "Confirming..." : "Confirm Payment (Card)"}
                </Button>
              )}

              {canShip && (
                <Button 
                  onClick={() => onShip(order._id)}
                  disabled={isShipping}
                  variant="default"
                  className="flex-1"
                >
                  <IconTruck className="w-4 h-4 mr-2" />
                  {isShipping ? "Shipping..." : "Ship Order"}
                </Button>
              )}

              {canCancel && (
                <Button 
                  onClick={() => setShowCancelDialog(true)}
                  disabled={isCancelling}
                  variant="destructive"
                  className="flex-1"
                >
                  <IconX className="w-4 h-4 mr-2" />
                  Cancel Order
                </Button>
              )}

              {canSimulate && (
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <Select value={simulationSpeed} onValueChange={setSimulationSpeed}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fast">Fast</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="slow">Slow</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={simulationScenario} onValueChange={setSimulationScenario}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={() => onSimulate(order._id, simulationSpeed, simulationScenario)}
                      disabled={isSimulating}
                      variant="outline"
                      className="flex-1"
                    >
                      <IconPlayerPlay className="w-4 h-4 mr-2" />
                      {isSimulating ? "Simulating..." : "Simulate Delivery"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <IconInfoCircle className="w-3 h-3 inline mr-1" />
                    Testing only: Simulates delivery status updates
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="cancel-reason">Cancellation Reason (Optional)</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Enter reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep order</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, cancel order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Define columns
const ordersColumns: ColumnDef<Order>[] = [
  {
    accessorKey: "_id",
    header: "Order ID",
    cell: ({ row }) => (
      <div className="font-mono text-sm font-medium">
        #{(row.getValue("_id") as string).slice(-8).toUpperCase()}
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "user.name",
    header: "Customer",
    cell: ({ row }) => {
      const order = row.original;
      const initials = order.user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
      
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{order.user.name}</div>
            <div className="text-xs text-muted-foreground">
              {order.user.email}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "deliveryStatus",
    header: "Delivery Status",
    cell: ({ row }) => {
      const status = row.getValue("deliveryStatus") as string;
      const config = getDeliveryStatusBadge(status);
      return (
        <Badge variant={config.variant} className="text-xs">
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const status = row.getValue("paymentStatus") as string;
      const config = getPaymentStatusBadge(status);
      return (
        <Badge variant={config.variant} className="text-xs">
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paymentMethodType",
    header: "Method",
    cell: ({ row }) => {
      const method = row.getValue("paymentMethodType") as string;
      return (
        <div className="text-sm font-medium capitalize">
          {method}
        </div>
      );
    },
  },
  {
    accessorKey: "cartItems",
    header: "Items",
    cell: ({ row }) => {
      const cartItems = row.getValue("cartItems") as Order['cartItems'];
      return (
        <div className="text-center font-medium">
          {cartItems.length}
        </div>
      );
    },
  },
  {
    accessorKey: "totalOrderPrice",
    header: "Total",
    cell: ({ row }) => {
      const total = row.getValue("totalOrderPrice") as number;
      return (
        <div className="text-right font-medium">
          {total.toFixed(2)} DZD
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Order Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  },
];

// Advanced filter configuration
const advancedFilterConfig = {
  numeric: {
    totalOrderPrice: {
      label: "Total Price",
      placeholder: "Enter amount",
    },
  },
  date: {
    createdAt: {
      label: "Order Date",
    },
    paidAt: {
      label: "Payment Date",
    },
    deliveredAt: {
      label: "Delivery Date",
    },
  },
};

export default function Orders() {
  const dispatch = useAppDispatch();
  const {
    orders,
    pagination,
    loading,
    error,
    trackingInfo,
    loadingTracking,
    isConfirming,
    isShipping,
    isCancelling,
    isSimulating,
    currentQueryParams,
  } = useAppSelector((state) => state.orders);

  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = React.useState(false);

  // Load initial data
  React.useEffect(() => {
    const initialParams: ServerQueryParams = {
      page: 1,
      limit: 10,
    };
    dispatch(fetchOrders(initialParams));
  }, [dispatch]);

  // Handle errors
  React.useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Load tracking info when dialog opens
  React.useEffect(() => {
    if (detailsDialogOpen && selectedOrder?.trackingNumber) {
      dispatch(getOrderTracking(selectedOrder._id));
    }
  }, [detailsDialogOpen, selectedOrder, dispatch]);

  const handleQueryParamsChange = React.useCallback(
    (params: ServerQueryParams) => {
      dispatch(setQueryParams(params));
      dispatch(fetchOrders(params));
    },
    [dispatch]
  );

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  const handleConfirmOrder = async (id: string) => {
    try {
      await dispatch(confirmOrder(id)).unwrap();
      toast.success("Order confirmed successfully");
      setDetailsDialogOpen(false);
    } catch (error) {
      console.error("Failed to confirm order:", error);
    }
  };

  const handleConfirmCardOrder = async (id: string) => {
    try {
      await dispatch(confirmCardOrder(id)).unwrap();
      toast.success("Card payment confirmed successfully");
      setDetailsDialogOpen(false);
    } catch (error) {
      console.error("Failed to confirm card order:", error);
    }
  };

  const handleShipOrder = async (id: string) => {
    try {
      await dispatch(shipOrder(id)).unwrap();
      toast.success("Order shipped successfully");
      setDetailsDialogOpen(false);
    } catch (error) {
      console.error("Failed to ship order:", error);
    }
  };

  const handleCancelOrder = async (id: string, reason?: string) => {
    try {
      await dispatch(cancelOrder({ id, reason })).unwrap();
      toast.success("Order cancelled successfully");
    } catch (error) {
      console.error("Failed to cancel order:", error);
    }
  };

  const handleSimulateDelivery = async (id: string, speed: string, scenario: string) => {
    try {
      await dispatch(simulateDelivery({ id, speed, scenario })).unwrap();
      toast.success(`Delivery simulation started (${scenario} scenario)`);
    } catch (error) {
      console.error("Failed to simulate delivery:", error);
    }
  };

  // Create enhanced columns with actions
  const enhancedColumns: ColumnDef<Order>[] = [
    ...ordersColumns,
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleRowClick(order)}
            className="text-xs"
          >
            <IconEye className="w-4 h-4 mr-1" />
            View Details
          </Button>
        );
      },
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-semibold">Orders</h1>
            <p className="text-muted-foreground">
              Manage customer orders and track their delivery status.
            </p>
          </div>

          <DataTable<Order>
            serverSide={true}
            data={orders || []}
            pagination={pagination}
            loading={loading}
            onQueryParamsChange={handleQueryParamsChange}
            currentQueryParams={currentQueryParams}
            error={error}
            columns={enhancedColumns}
            enableRowSelection={false}
            enableGlobalFilter={true}
            enableColumnFilter={false}
            enableAdvancedFilter={true}
            advancedFilterConfig={advancedFilterConfig}
            enableDragAndDrop={false}
            pageSize={10}
          />
        </div>
      </div>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <OrderDetailsDialog
          order={selectedOrder}
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          onConfirm={handleConfirmOrder}
          onConfirmCard={handleConfirmCardOrder}
          onCancel={handleCancelOrder}
          onShip={handleShipOrder}
          onSimulate={handleSimulateDelivery}
          trackingInfo={trackingInfo}
          isLoadingTracking={loadingTracking}
          isConfirming={isConfirming}
          isShipping={isShipping}
          isCancelling={isCancelling}
          isSimulating={isSimulating}
        />
      )}
    </div>
  );
}