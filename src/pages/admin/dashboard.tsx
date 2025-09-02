import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "../../components/ui/badge";
import { ChartAreaInteractive } from "../../components/admin/dashboard/chart-area-interactive";
import { DashboardTables } from "../../components/admin/dashboard/dashboardTables";
import { DataTable } from "../../components/admin/dashboard/data-table";
import { SectionCards } from "../../components/admin/dashboard/section-cards";

// Define the Recent Activity entity type for Dashboard
export interface RecentActivity {
  id: number;
  type: 'order' | 'user' | 'product' | 'review' | 'payment' | 'refund';
  title: string;
  description: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  amount?: number;
  user: string;
  timestamp: string;
}

// Sample data for Recent Activities - this would typically come from your API
const recentActivitiesData: RecentActivity[] = [
  {
    id: 1,
    type: "order",
    title: "New Order Placed",
    description: "Order #ORD-2024-089 placed by John Doe",
    status: "completed",
    amount: 299.99,
    user: "John Doe",
    timestamp: "2024-02-20T14:30:00Z"
  },
  {
    id: 2,
    type: "user",
    title: "New User Registration",
    description: "Sarah Wilson registered a new account",
    status: "completed",
    user: "Sarah Wilson",
    timestamp: "2024-02-20T13:45:00Z"
  },
  {
    id: 3,
    type: "payment",
    title: "Payment Received",
    description: "Payment for Order #ORD-2024-087",
    status: "completed",
    amount: 1299.99,
    user: "Mike Johnson",
    timestamp: "2024-02-20T12:20:00Z"
  },
  {
    id: 4,
    type: "product",
    title: "Product Updated",
    description: "iPhone 15 Pro stock updated to 45 units",
    status: "completed",
    user: "Admin User",
    timestamp: "2024-02-20T11:15:00Z"
  },
  {
    id: 5,
    type: "refund",
    title: "Refund Processed",
    description: "Refund processed for Order #ORD-2024-085",
    status: "completed",
    amount: -149.99,
    user: "Emily Davis",
    timestamp: "2024-02-20T10:30:00Z"
  },
  {
    id: 6,
    type: "review",
    title: "New Product Review",
    description: "5-star review for MacBook Pro 16\"",
    status: "pending",
    user: "David Brown",
    timestamp: "2024-02-20T09:45:00Z"
  },
  {
    id: 7,
    type: "order",
    title: "Order Shipped",
    description: "Order #ORD-2024-086 has been shipped",
    status: "completed",
    amount: 599.98,
    user: "Lisa Martinez",
    timestamp: "2024-02-20T08:30:00Z"
  },
  {
    id: 8,
    type: "payment",
    title: "Payment Failed",
    description: "Payment failed for Order #ORD-2024-088",
    status: "failed",
    amount: 89.99,
    user: "Robert Taylor",
    timestamp: "2024-02-20T07:15:00Z"
  },
  {
    id: 9,
    type: "user",
    title: "User Account Suspended",
    description: "Account suspended due to policy violation",
    status: "completed",
    user: "Jennifer White",
    timestamp: "2024-02-20T06:00:00Z"
  },
  {
    id: 10,
    type: "order",
    title: "Order Cancelled",
    description: "Order #ORD-2024-084 cancelled by customer",
    status: "cancelled",
    amount: -199.99,
    user: "Alex Johnson",
    timestamp: "2024-02-19T22:30:00Z"
  }
];

// Helper function to get relative time
const getRelativeTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

// Define columns specific to Recent Activities on Dashboard
const recentActivitiesColumns: ColumnDef<RecentActivity>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const typeConfig = {
        order: { variant: 'default', label: 'Order' },
        user: { variant: 'secondary', label: 'User' },
        product: { variant: 'default', label: 'Product' },
        review: { variant: 'secondary', label: 'Review' },
        payment: { variant: 'default', label: 'Payment' },
        refund: { variant: 'destructive', label: 'Refund' }
      } as const;
      
      const config = typeConfig[type as keyof typeof typeConfig];
      return (
        <Badge variant={config.variant} className="text-xs">
          {config.label}
        </Badge>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: "Activity",
    cell: ({ row }) => {
      const activity = row.original;
      return (
        <div>
          <div className="font-medium text-sm">{activity.title}</div>
          <div className="text-xs text-muted-foreground line-clamp-1">
            {activity.description}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.getValue("user")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variants = {
        completed: 'default',
        pending: 'secondary',
        failed: 'destructive',
        cancelled: 'destructive'
      } as const;
      return (
        <Badge variant={variants[status as keyof typeof variants]} className="text-xs">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number | undefined;
      if (amount === undefined) return <div className="text-center text-muted-foreground">-</div>;
      
      return (
        <div className={`text-center font-medium text-sm ${
          amount < 0 ? 'text-red-600' : 'text-green-600'
        }`}>
          {amount < 0 ? '-' : ''}${Math.abs(amount).toFixed(2)}
        </div>
      );
    },
  },
  {
    accessorKey: "timestamp",
    header: "Time",
    cell: ({ row }) => {
      const timestamp = row.getValue("timestamp") as string;
      return (
        <div className="text-xs text-muted-foreground">
          {getRelativeTime(timestamp)}
        </div>
      );
    },
  },
];

export default function Dashboard() {
  const [recentActivities] = React.useState(recentActivitiesData);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />

          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>

          {/* Recent Activities Table */}
          <div className="flex flex-col gap-2">
            <div className="px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Recent Activities</h3>
                  <p className="text-sm text-muted-foreground">
                    Latest activities across your store
                  </p>
                </div>
              </div>
            </div>
            
            <DataTable
              data={recentActivities}
              columns={recentActivitiesColumns}
              enableDragAndDrop={false} // Activities shouldn't be reorderable
              enableRowSelection={false} // No need for selection on dashboard
              enableGlobalFilter={true}
              enableColumnFilter={true}
              filterColumn="type"
              filterPlaceholder="Filter by activity type..."
              pageSize={8} // Smaller page size for dashboard
            />
          </div>

          <DashboardTables />
        </div>
      </div>
    </div>
  );
}