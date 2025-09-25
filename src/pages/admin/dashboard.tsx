/* eslint-disable @typescript-eslint/no-unused-expressions */
import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "../../components/ui/badge";
import { ChartAreaInteractive } from "../../components/admin/dashboard/chart-area-interactive";
import { DashboardTables } from "../../components/admin/dashboard/dashboardTables";
import {
  DataTable,
  type ServerQueryParams,
} from "../../components/admin/global/data-table";
import { SectionCards } from "../../components/admin/dashboard/section-cards";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import useSocket from "../../socket/useSocket";
import {
  fetchDashboardActivities,
  setQueryParams,
  clearDashboardError,
  type Activity,
} from "../../features/activities/activitiesSlice";
import { toast } from "sonner";

// Helper function to get relative time
const getRelativeTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

// Helper function to get activity type configuration
const getActivityTypeConfig = (type: string) => {
  const typeConfig = {
    order: { variant: "default" as const, label: "Order" },
    user: { variant: "secondary" as const, label: "User" },
    product: { variant: "default" as const, label: "Product" },
    category: { variant: "secondary" as const, label: "Category" },
    subcategory: { variant: "secondary" as const, label: "SubCategory" },
    brand: { variant: "default" as const, label: "Brand" },
    review: { variant: "secondary" as const, label: "Review" },
    coupon: { variant: "default" as const, label: "Coupon" },
    cart: { variant: "secondary" as const, label: "Cart" },
  };

  return (
    typeConfig[type as keyof typeof typeConfig] || {
      variant: "default" as const,
      label: type,
    }
  );
};

// Helper function to get status configuration
const getStatusConfig = (status: string) => {
  const variants = {
    success: "default" as const,
    pending: "secondary" as const,
    failed: "destructive" as const,
  };

  return variants[status as keyof typeof variants] || "default";
};

// Define columns specific to Recent Activities on Dashboard
const recentActivitiesColumns: ColumnDef<Activity>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const config = getActivityTypeConfig(type);

      return (
        <Badge variant={config.variant} className="text-xs">
          {config.label}
        </Badge>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "activity",
    header: "Activity",
    cell: ({ row }) => {
      const activity = row.original;
      return (
        <div>
          <div className="font-medium text-sm">{activity.activity}</div>
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
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="text-sm">
          <div className="font-medium">{user.name}</div>
          <div className="text-xs text-muted-foreground capitalize">
            {user.role}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant = getStatusConfig(status);

      return (
        <Badge variant={variant} className="text-xs capitalize">
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
      if (amount === undefined || amount === null) {
        return <div className="text-center text-muted-foreground">-</div>;
      }

      return (
        <div
          className={`text-center font-medium text-sm ${
            amount < 0 ? "text-red-600" : "text-green-600"
          }`}
        >
          {amount < 0 ? "-" : ""}${Math.abs(amount).toFixed(2)}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Time",
    cell: ({ row }) => {
      const timestamp = row.getValue("createdAt") as string;
      return (
        <div className="text-xs text-muted-foreground">
          {getRelativeTime(timestamp)}
        </div>
      );
    },
  },
];

// Advanced filter configuration for activities
const advancedFilterConfig = {
  select: {
    type: {
      label: "Activity Type",
      options: [
        { value: "all", label: "All Types" },
        { value: "order", label: "Order" },
        { value: "user", label: "User" },
        { value: "product", label: "Product" },
        { value: "category", label: "Category" },
        { value: "subcategory", label: "SubCategory" },
        { value: "brand", label: "Brand" },
        { value: "review", label: "Review" },
        { value: "coupon", label: "Coupon" },
        { value: "cart", label: "Cart" },
      ],
    },
    status: {
      label: "Status",
      options: [
        { value: "all", label: "All Statuses" },
        { value: "success", label: "Success" },
        { value: "pending", label: "Pending" },
        { value: "failed", label: "Failed" },
      ],
    },
    timeframe: {
      label: "Time Range",
      options: [
        { value: "all", label: "All Time" },
        { value: "1h", label: "Last Hour" },
        { value: "24h", label: "Last 24 Hours" },
        { value: "7d", label: "Last 7 Days" },
        { value: "30d", label: "Last 30 Days" },
      ],
    },
  },
  numeric: {
    amount: {
      label: "Amount",
      placeholder: "Enter amount",
    },
  },
  date: {
    createdAt: {
      label: "Created Date",
    },
  },
};

export default function Dashboard() {
  const dispatch = useAppDispatch();

  // Get activities from Redux store
  const {
    dashboardActivities,
    realtimeActivities,
    dashboardLoading,
    dashboardError,
    isConnected,
    currentQueryParams,
  } = useAppSelector((state) => state.activities);

  const { user } = useAppSelector((state) => state.auth);

  // Initialize socket connection
  const {
    connect,
    disconnect,
    joinDashboard,
    leaveDashboard,
    filterActivities,
    requestActivityStats,
  } = useSocket({
    autoConnect: true,
    joinDashboard: user?.role === "admin",
    onConnect: () => {
      console.log("Dashboard socket connected");
      toast.success("Connected to live updates");
    },
    onDisconnect: () => {
      console.log("Dashboard socket disconnected");
      toast.error("Disconnected from live updates");
    },
    onError: (error) => {
      console.error("Dashboard socket error:", error);
      toast.error("Connection error occurred");
    },
  });

  // Combine dashboard activities with realtime activities
  // Realtime activities appear at the top, followed by dashboard activities
  const combinedActivities = React.useMemo(() => {
  const activityMap = new Map<string, Activity>();
  
  // Add realtime activities first (priority)
  realtimeActivities.forEach(activity => {
    activityMap.set(activity._id, activity);
  });
  
  // Add dashboard activities only if not already present
  dashboardActivities.forEach(activity => {
    if (!activityMap.has(activity._id)) {
      activityMap.set(activity._id, activity);
    }
  });
  
  // Convert to array and sort by date
  return Array.from(activityMap.values()).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}, [realtimeActivities, dashboardActivities]);

  // Load initial dashboard activities on component mount
  React.useEffect(() => {
    dispatch(fetchDashboardActivities());
  }, [dispatch]);

  // Handle errors
  React.useEffect(() => {
    if (dashboardError) {
      toast.error(dashboardError);
      dispatch(clearDashboardError());
    }
  }, [dashboardError, dispatch]);

  // Handle query parameter changes from the DataTable
  const handleQueryParamsChange = React.useCallback(
    (params: ServerQueryParams) => {
      // Store the parameters in Redux state for future reference
      dispatch(setQueryParams(params));

      // For dashboard, we mainly use socket filters for real-time filtering
      if (params.type || params.timeframe) {
        const filters: { type?: string; timeframe?: string } = {};

        if (params.type && params.type !== "all") {
          filters.type = params.type as string;
        }

        if (params.timeframe && params.timeframe !== "all") {
          filters.timeframe = params.timeframe as string;
        }

        // Use socket filtering for real-time updates
        if (isConnected && Object.keys(filters).length > 0) {
          filterActivities(filters);
        }
      }

      // Also fetch fresh dashboard activities with new params
      dispatch(fetchDashboardActivities());
    },
    [dispatch, isConnected, filterActivities]
  );

  // Handle refresh button
  const handleRefresh = React.useCallback(() => {
    // Refresh dashboard activities
    dispatch(fetchDashboardActivities());

    // Request fresh stats if connected
    if (isConnected) {
      requestActivityStats();
    }

    toast.success("Activities refreshed");
  }, [dispatch, isConnected, requestActivityStats]);

  // Join dashboard room when component mounts (for admins)
  React.useEffect(() => {
    if (isConnected && user?.role === "admin") {
      joinDashboard;
    }

    return () => {
      if (isConnected) {
        leaveDashboard;
      }
    };
  }, [isConnected, user?.role, joinDashboard, leaveDashboard]);

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
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      Latest activities across your store
                    </p>
                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600">Live</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                          <span className="text-xs text-red-600">Offline</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={dashboardLoading}
                  className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {dashboardLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>

            <DataTable
              // Client-side table since we're managing data through socket and Redux
              serverSide={false}
              data={combinedActivities || []}
              loading={dashboardLoading}
              onQueryParamsChange={handleQueryParamsChange}
              currentQueryParams={currentQueryParams}
              error={dashboardError}
              // Table configuration
              columns={recentActivitiesColumns}
              // Table features configuration
              enableRowSelection={false} // No selection needed for dashboard
              enableGlobalFilter={true}
              enableColumnFilter={false}
              enableAdvancedFilter={true}
              advancedFilterConfig={advancedFilterConfig}
              enableDragAndDrop={false} // Activities shouldn't be reorderable
              filterColumn="type"
              filterPlaceholder="Filter by activity type..."
              pageSize={10} // Smaller page size for dashboard
              // Disable row actions
              showRowActions={false}
            />
          </div>

          <DashboardTables />
        </div>
      </div>
    </div>
  );
}
