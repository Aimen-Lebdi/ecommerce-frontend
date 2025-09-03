import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { DataTable } from "../../components/admin/dashboard/data-table";

// Define the Order entity type
export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  total: number;
  itemCount: number;
  shippingAddress: string;
  createdAt: string;
}

// Sample data - in a real app, this would come from your API
const ordersData: Order[] = [
  {
    id: 1,
    orderNumber: "ORD-2024-001",
    customerName: "John Doe",
    customerEmail: "john.doe@email.com",
    status: "shipped",
    paymentStatus: "paid",
    total: 1299.99,
    itemCount: 2,
    shippingAddress: "123 Main St, New York, NY",
    createdAt: "2024-02-15"
  },
  {
    id: 2,
    orderNumber: "ORD-2024-002",
    customerName: "Sarah Wilson",
    customerEmail: "sarah.wilson@email.com",
    status: "delivered",
    paymentStatus: "paid",
    total: 299.99,
    itemCount: 1,
    shippingAddress: "456 Oak Ave, Los Angeles, CA",
    createdAt: "2024-02-14"
  },
  {
    id: 3,
    orderNumber: "ORD-2024-003",
    customerName: "Mike Johnson",
    customerEmail: "mike.johnson@email.com",
    status: "processing",
    paymentStatus: "paid",
    total: 2499.99,
    itemCount: 1,
    shippingAddress: "789 Pine St, Chicago, IL",
    createdAt: "2024-02-16"
  },
  {
    id: 4,
    orderNumber: "ORD-2024-004",
    customerName: "Emily Davis",
    customerEmail: "emily.davis@email.com",
    status: "pending",
    paymentStatus: "pending",
    total: 149.99,
    itemCount: 1,
    shippingAddress: "321 Elm Dr, Houston, TX",
    createdAt: "2024-02-17"
  },
  {
    id: 5,
    orderNumber: "ORD-2024-005",
    customerName: "David Brown",
    customerEmail: "david.brown@email.com",
    status: "cancelled",
    paymentStatus: "refunded",
    total: 399.99,
    itemCount: 1,
    shippingAddress: "654 Maple Ln, Phoenix, AZ",
    createdAt: "2024-02-13"
  },
  {
    id: 6,
    orderNumber: "ORD-2024-006",
    customerName: "Lisa Martinez",
    customerEmail: "lisa.martinez@email.com",
    status: "confirmed",
    paymentStatus: "paid",
    total: 189.99,
    itemCount: 1,
    shippingAddress: "987 Cedar St, Philadelphia, PA",
    createdAt: "2024-02-18"
  },
  {
    id: 7,
    orderNumber: "ORD-2024-007",
    customerName: "Robert Taylor",
    customerEmail: "robert.taylor@email.com",
    status: "shipped",
    paymentStatus: "paid",
    total: 999.99,
    itemCount: 3,
    shippingAddress: "159 Birch Ave, San Antonio, TX",
    createdAt: "2024-02-12"
  },
  {
    id: 8,
    orderNumber: "ORD-2024-008",
    customerName: "Jennifer White",
    customerEmail: "jennifer.white@email.com",
    status: "processing",
    paymentStatus: "paid",
    total: 599.98,
    itemCount: 2,
    shippingAddress: "753 Spruce St, San Diego, CA",
    createdAt: "2024-02-19"
  }
];

// Define columns specific to Orders
const ordersColumns: ColumnDef<Order>[] = [
  {
    accessorKey: "orderNumber",
    header: "Order #",
    cell: ({ row }) => (
      <div className="font-mono text-sm font-medium">
        {row.getValue("orderNumber")}
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => {
      const order = row.original;
      const initials = order.customerName
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
            <div className="font-medium">{order.customerName}</div>
            <div className="text-xs text-muted-foreground">
              {order.customerEmail}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Order Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variants = {
        pending: 'secondary',
        confirmed: 'default',
        processing: 'default',
        shipped: 'default',
        delivered: 'default',
        cancelled: 'destructive',
        refunded: 'destructive'
      } as const;
      return (
        <Badge variant={variants[status as keyof typeof variants]}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const paymentStatus = row.getValue("paymentStatus") as string;
      const variants = {
        pending: 'secondary',
        paid: 'default',
        failed: 'destructive',
        refunded: 'destructive'
      } as const;
      return (
        <Badge variant={variants[paymentStatus as keyof typeof variants]} className="text-xs">
          {paymentStatus}
        </Badge>
      );
    },
  },
  {
    accessorKey: "itemCount",
    header: "Items",
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {row.getValue("itemCount")}
      </div>
    ),
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const total = row.getValue("total") as number;
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
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-muted-foreground text-xs">
        {row.getValue("shippingAddress")}
      </div>
    ),
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
];

// Advanced filter configuration for categories
const advancedFilterConfig = {
  numeric: {
    itemCount: {
      label: "Item Count",
      placeholder: "Enter number of items",
    },
    total: {
      label: "Total",
      placeholder: "Enter order total",
    },
  },
  date: {
    createdAt: {
      label: "Created Date",
    },
  },
};

export default function Orders() {
  const [orders] = React.useState(ordersData);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <DataTable
            data={orders}
            columns={ordersColumns}
            enableDragAndDrop={false} // Orders shouldn't be reorderable
            enableRowSelection={true}
            enableGlobalFilter={true}
            enableColumnFilter={true}
            enableAdvancedFilter={true}
            advancedFilterConfig={advancedFilterConfig}
            filterColumn="status"
            filterPlaceholder="Filter by status..."
            pageSize={15}
          />
        </div>
      </div>
    </div>
  );
}