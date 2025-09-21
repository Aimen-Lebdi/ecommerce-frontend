/* eslint-disable react-hooks/rules-of-hooks */
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
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchOrders,
  updateOrderToPaid,
  updateOrderToDelivered,
  clearError,
  setQueryParams,
  type Order,
} from "../../features/orders/ordersSlice";

// Define columns specific to Orders
const ordersColumns: ColumnDef<Order>[] = [
  {
    accessorKey: "_id",
    header: "Order ID",
    cell: ({ row }) => (
      <div className="font-mono text-sm font-medium">
        #{(row.getValue("_id") as string).toString().slice(-8).toUpperCase()}
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
    accessorKey: "isDelivered",
    header: "Order Status",
    cell: ({ row }) => {
      const order = row.original;
      let status = "pending";
      let variant: "default" | "secondary" | "destructive" = "secondary";
      
      if (order.isDelivered) {
        status = "delivered";
        variant = "default";
      } else if (order.isPaid) {
        status = "processing";
        variant = "default";
      }
      
      return (
        <Badge variant={variant}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isPaid",
    header: "Payment",
    cell: ({ row }) => {
      const order = row.original;
      const paymentStatus = order.isPaid ? "paid" : "pending";
      const variant = order.isPaid ? "default" : "secondary";
      
      return (
        <Badge variant={variant} className="text-xs">
          {paymentStatus}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paymentMethodType",
    header: "Payment Method",
    cell: ({ row }) => {
      const paymentMethod = row.getValue("paymentMethodType") as string;
      return (
        <div className="text-sm font-medium capitalize">
          {paymentMethod}
        </div>
      );
    },
  },
  {
    accessorKey: "cartItems",
    header: "Items",
    cell: ({ row }) => {
      const cartItems = row.getValue("cartItems") as Order['cartItems'];
      const itemCount = cartItems.length;
      
      return (
        <div className="text-center font-medium">
          {itemCount}
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
          ${total.toFixed(2)}
        </div>
      );
    },
  },
  {
    accessorKey: "shippingAddress",
    header: "Shipping Address",
    cell: ({ row }) => {
      const shippingAddress = row.getValue("shippingAddress") as Order['shippingAddress'];
      const addressString = [
        shippingAddress.details,
        shippingAddress.city,
        shippingAddress.postalCode
      ].filter(Boolean).join(", ");
      
      return (
        <div className="max-w-[200px] truncate text-muted-foreground text-xs">
          {addressString || "No address provided"}
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
        <div className="text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const order = row.original;
      const dispatch = useAppDispatch();
      const { isUpdatingPayment, isUpdatingDelivery } = useAppSelector((state) => state.orders);
      
      const handleMarkAsPaid = async () => {
        try {
          await dispatch(updateOrderToPaid(order._id)).unwrap();
          toast.success("Order marked as paid");
        } catch (error) {
          toast.error("Failed to update payment status");
        }
      };
      
      const handleMarkAsDelivered = async () => {
        try {
          await dispatch(updateOrderToDelivered(order._id)).unwrap();
          toast.success("Order marked as delivered");
        } catch (error) {
          toast.error("Failed to update delivery status");
        }
      };
      
      return (
        <div className="flex items-center gap-2">
          {!order.isPaid && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAsPaid}
              disabled={isUpdatingPayment}
              className="text-xs"
            >
              {isUpdatingPayment ? "..." : "Mark Paid"}
            </Button>
          )}
          {order.isPaid && !order.isDelivered && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAsDelivered}
              disabled={isUpdatingDelivery}
              className="text-xs"
            >
              {isUpdatingDelivery ? "..." : "Mark Delivered"}
            </Button>
          )}
        </div>
      );
    },
  },
];

// Advanced filter configuration for orders
const advancedFilterConfig = {
  numeric: {
    totalOrderPrice: {
      label: "Total Order Price",
      placeholder: "Enter order total",
    },
    taxPrice: {
      label: "Tax Price",
      placeholder: "Enter tax amount",
    },
    shippingPrice: {
      label: "Shipping Price",
      placeholder: "Enter shipping cost",
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
    // isUpdatingPayment,
    // isUpdatingDelivery,
    currentQueryParams,
  } = useAppSelector((state) => state.orders);

  // Load initial data on component mount
  React.useEffect(() => {
    // Load orders with default parameters on mount
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

  // Handle query parameter changes from the DataTable
  const handleQueryParamsChange = React.useCallback(
    (params: ServerQueryParams) => {
      // Store the parameters in Redux state for future reference
      dispatch(setQueryParams(params));
      // Fetch data with new parameters
      dispatch(fetchOrders(params));
    },
    [dispatch]
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-semibold">Orders</h1>
            <p className="text-muted-foreground">
              Manage customer orders and their statuses.
            </p>
          </div>

          <DataTable<Order>
            // Server-side specific props
            serverSide={true}
            data={orders || []}
            pagination={pagination}
            loading={loading}
            onQueryParamsChange={handleQueryParamsChange}
            currentQueryParams={currentQueryParams}
            error={error}
            // Table configuration
            columns={ordersColumns}
            // Table features configuration
            enableRowSelection={false} // Orders shouldn't be bulk selectable for deletion
            enableGlobalFilter={true}
            enableColumnFilter={false} // Disable simple column filter since we're using search
            enableAdvancedFilter={true}
            advancedFilterConfig={advancedFilterConfig}
            enableDragAndDrop={false} // Orders shouldn't be reorderable
            // Set page size for initial load
            pageSize={15}
          />
        </div>
      </div>
    </div>
  );
}