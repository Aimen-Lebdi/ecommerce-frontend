import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import {
  DataTable,
  type ServerQueryParams,
} from "../../components/admin/global/data-table";
import {
  OrderEditDialog,
  type OrderEditSavePayload,
} from "../../components/admin/global/OrderEditDialog";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchOrders,
  updateOrder,
  confirmOrder,
  cancelOrder,
  getOrderTracking,
  clearError,
  setQueryParams,
  type Order,
} from "../../features/orders/ordersSlice";
import { IconEye } from "@tabler/icons-react";
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { getErrorMessage } from '../../utils/errorMessage';
import { formatPrice } from '../../utils/formatPrice';

// Status badge helper functions
const getDeliveryStatusBadge = (status: string, t: TFunction) => {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
    pending: { label: t('orders.status.pending'), variant: "secondary" },
    confirmed: { label: t('orders.status.confirmed'), variant: "default" },
    shipped: { label: t('orders.status.shipped'), variant: "default" },
    in_transit: { label: t('orders.status.inTransit'), variant: "default" },
    out_for_delivery: { label: t('orders.status.outForDelivery'), variant: "default" },
    delivered: { label: t('orders.status.delivered'), variant: "default" },
    completed: { label: t('orders.status.completed'), variant: "default" },
    failed: { label: t('orders.status.failed'), variant: "destructive" },
    returned: { label: t('orders.status.returned'), variant: "destructive" },
    cancelled: { label: t('orders.status.cancelled'), variant: "destructive" },
  };
  return statusConfig[status] || statusConfig.pending;
};

const getPaymentStatusBadge = (status: string, t: TFunction) => {
  const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
    pending: { label: t('orders.paymentStatus.pending'), variant: "secondary" },
    authorized: { label: t('orders.paymentStatus.authorized'), variant: "default" },
    confirmed: { label: t('orders.paymentStatus.confirmed'), variant: "default" },
    completed: { label: t('orders.paymentStatus.completed'), variant: "default" },
    failed: { label: t('orders.paymentStatus.failed'), variant: "destructive" },
    refunded: { label: t('orders.paymentStatus.refunded'), variant: "destructive" },
    partially_refunded: { label: t('orders.paymentStatus.partiallyRefunded'), variant: "destructive" },
    cancelled: { label: t('orders.paymentStatus.cancelled'), variant: "destructive" },
  };
  return statusConfig[status] || statusConfig.pending;
};

export default function Orders() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Define columns
  const ordersColumns: ColumnDef<Order>[] = [
    {
      accessorKey: "_id",
      header: t('orders.columns.orderId'),
      cell: ({ row }) => (
        <div className="font-mono text-sm font-medium">
          #{t('orders.orderNumber', { id: (row.getValue("_id") as string).slice(-8).toUpperCase() })}
        </div>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "user.name",
      header: t('orders.columns.customer'),
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
      header: t('orders.columns.deliveryStatus'),
      cell: ({ row }) => {
        const status = row.getValue("deliveryStatus") as string;
        const config = getDeliveryStatusBadge(status, t);
        return (
          <Badge variant={config.variant} className="text-xs">
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "paymentStatus",
      header: t('orders.columns.payment'),
      cell: ({ row }) => {
        const status = row.getValue("paymentStatus") as string;
        const config = getPaymentStatusBadge(status, t);
        return (
          <Badge variant={config.variant} className="text-xs">
            {config.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "paymentMethodType",
      header: t('orders.columns.method'),
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
      header: t('orders.columns.items'),
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
      header: t('orders.columns.total'),
      cell: ({ row }) => {
        const total = row.getValue("totalOrderPrice") as number;
        return (
          <div className="text-right font-medium">
            {formatPrice(total)}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: t('orders.columns.orderDate'),
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
        label: t('orders.filters.totalPrice'),
        placeholder: t('orders.filters.amountPlaceholder'),
      },
    },
    date: {
      createdAt: {
        label: t('orders.filters.orderDate'),
      },
      paidAt: {
        label: t('orders.filters.paymentDate'),
      },
      deliveredAt: {
        label: t('orders.filters.deliveryDate'),
      },
    },
  };

  const {
    orders,
    pagination,
    loading,
    error,
    isUpdatingOrder,
    currentQueryParams,
  } = useAppSelector((state) => state.orders);

  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);

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
      const isNoResults = /there are no .+ to get/i.test(error);
      if (!isNoResults) {
        toast.error(error);
      }
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Load tracking info when the edit dialog opens
  React.useEffect(() => {
    if (editDialogOpen && selectedOrder?.trackingNumber) {
      dispatch(getOrderTracking(selectedOrder._id));
    }
  }, [editDialogOpen, selectedOrder, dispatch]);

  const handleQueryParamsChange = React.useCallback(
    (params: ServerQueryParams) => {
      dispatch(setQueryParams(params));
      dispatch(fetchOrders(params));
    },
    [dispatch]
  );

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setEditDialogOpen(true);
  };

  const handleSaveOrder = async (payload: OrderEditSavePayload) => {
    if (!selectedOrder) return;
    try {
      const id = selectedOrder._id;
      let updated: Order;

      // Route by the target delivery status: `confirmed` and `cancelled` are
      // owned by dedicated endpoints (confirm = create parcel + auto-simulate,
      // cancel = restock + refund + cancel parcel). Everything else is a plain
      // data edit via PUT /:id.
      if (payload.deliveryStatus === "confirmed") {
        updated = await dispatch(confirmOrder(id)).unwrap();
      } else if (payload.deliveryStatus === "cancelled") {
        updated = await dispatch(cancelOrder({ id })).unwrap();
      } else {
        updated = await dispatch(updateOrder({ id, payload })).unwrap();
      }

      setSelectedOrder(updated);
      toast.success(t('orders.toasts.updateSuccess'));
      // Refresh the server-side table and keep the selected order in sync.
      dispatch(fetchOrders(currentQueryParams));
    } catch (err) {
      console.error("Failed to update order:", err);
      const message = getErrorMessage(err, t('orders.toasts.updateError'));
      toast.error(message);
      // Re-throw so the dialog stays open and the seller can retry.
      throw err;
    }
  };

  // Create enhanced columns with actions
  const enhancedColumns: ColumnDef<Order>[] = [
    ...ordersColumns,
    {
      id: "actions",
      header: t('orders.columns.actions'),
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
            {t('dataTable.actions.viewEdit')}
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
            <h1 className="text-2xl font-semibold">{t('orders.title')}</h1>
            <p className="text-muted-foreground">
              {t('orders.subtitle')}
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

      {/* Order Edit Dialog */}
      {selectedOrder && (
        <OrderEditDialog
          mode="edit"
          existingData={selectedOrder}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={handleSaveOrder}
          isLoading={isUpdatingOrder}
        />
      )}
    </div>
  );
}