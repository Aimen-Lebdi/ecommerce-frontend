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
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Helper function to get relative time
  const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return t('dashboard.time.justNow');
    if (diffInMinutes < 60) return t('dashboard.time.minutesAgo', { minutes: diffInMinutes });

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return t('dashboard.time.hoursAgo', { hours: diffInHours });

    const diffInDays = Math.floor(diffInHours / 24);
    return t('dashboard.time.daysAgo', { days: diffInDays });
  };

  // Helper function to get activity type configuration
  const getActivityTypeConfig = (type: string) => {
    const typeConfig = {
      order: { variant: "default" as const, label: t('dashboard.activityTypes.order') },
      user: { variant: "secondary" as const, label: t('dashboard.activityTypes.user') },
      product: { variant: "default" as const, label: t('dashboard.activityTypes.product') },
      category: { variant: "secondary" as const, label: t('dashboard.activityTypes.category') },
      subcategory: { variant: "secondary" as const, label: t('dashboard.activityTypes.subcategory') },
      brand: { variant: "default" as const, label: t('dashboard.activityTypes.brand') },
      review: { variant: "secondary" as const, label: t('dashboard.activityTypes.review') },
      coupon: { variant: "default" as const, label: t('dashboard.activityTypes.coupon') },
      cart: { variant: "secondary" as const, label: t('dashboard.activityTypes.cart') },
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
      header: t('dashboard.columns.type'),
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
      header: t('dashboard.columns.activity'),
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
      header: t('dashboard.columns.user'),
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
      header: t('dashboard.columns.status'),
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
      header: t('dashboard.columns.amount'),
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
      header: t('dashboard.columns.time'),
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
        label: t('dashboard.filters.activityType'),
        options: [
          { value: "all", label: t('dashboard.filters.allTypes') },
          { value: "order", label: t('dashboard.activityTypes.order') },
          { value: "user", label: t('dashboard.activityTypes.user') },
          { value: "product", label: t('dashboard.activityTypes.product') },
          { value: "category", label: t('dashboard.activityTypes.category') },
          { value: "subcategory", label: t('dashboard.activityTypes.subcategory') },
          { value: "brand", label: t('dashboard.activityTypes.brand') },
          { value: "review", label: t('dashboard.activityTypes.review') },
          { value: "coupon", label: t('dashboard.activityTypes.coupon') },
          { value: "cart", label: t('dashboard.activityTypes.cart') },
        ],
      },
      status: {
        label: t('dashboard.filters.status'),
        options: [
          { value: "all", label: t('dashboard.filters.allStatuses') },
          { value: "success", label: t('dashboard.statuses.success') },
          { value: "pending", label: t('dashboard.statuses.pending') },
          { value: "failed", label: t('dashboard.statuses.failed') },
        ],
      },
      timeframe: {
        label: t('dashboard.filters.timeRange'),
        options: [
          { value: "all", label: t('dashboard.filters.allTime') },
          { value: "1h", label: t('dashboard.filters.lastHour') },
          { value: "24h", label: t('dashboard.filters.last24Hours') },
          { value: "7d", label: t('dashboard.filters.last7Days') },
          { value: "30d", label: t('dashboard.filters.last30Days') },
        ],
      },
    },
    numeric: {
      amount: {
        label: t('dashboard.filters.amount'),
        placeholder: t('dashboard.filters.amountPlaceholder'),
      },
    },
    date: {
      createdAt: {
        label: t('dashboard.filters.createdDate'),
      },
    },
  };

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
      toast.success(t('dashboard.socket.connected'));
    },
    onDisconnect: () => {
      console.log("Dashboard socket disconnected");
      toast.error(t('dashboard.socket.disconnected'));
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      console.error("Dashboard socket error:", error);
      toast.error(t('dashboard.socket.error'));
    },
  });

  // Combine dashboard activities with realtime activities
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
      dispatch(setQueryParams(params));

      if (params.type || params.timeframe) {
        const filters: { type?: string; timeframe?: string } = {};

        if (params.type && params.type !== "all") {
          filters.type = params.type as string;
        }

        if (params.timeframe && params.timeframe !== "all") {
          filters.timeframe = params.timeframe as string;
        }

        if (isConnected && Object.keys(filters).length > 0) {
          filterActivities(filters);
        }
      }

      dispatch(fetchDashboardActivities());
    },
    [dispatch, isConnected, filterActivities]
  );

  // Handle refresh button
  const handleRefresh = React.useCallback(() => {
    dispatch(fetchDashboardActivities());

    if (isConnected) {
      requestActivityStats();
    }

    toast.success(t('dashboard.refreshSuccess'));
  }, [dispatch, isConnected, requestActivityStats, t]);

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
          {/* Dashboard Cards - Revenue, Customers, Orders, Top Product */}
          <SectionCards />

          {/* Growth Rate Chart */}
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>

          {/* Recent Activities Table */}
          <div className="flex flex-col gap-2">
            <div className="px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{t('dashboard.recentActivities.title')}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      {t('dashboard.recentActivities.subtitle')}
                    </p>
                    <div className="flex items-center gap-2">
                      {isConnected ? (
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600">{t('dashboard.status.live')}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                          <span className="text-xs text-red-600">{t('dashboard.status.offline')}</span>
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
                  {dashboardLoading ? t('dashboard.refreshing') : t('dashboard.refresh')}
                </button>
              </div>
            </div>

            <DataTable
              serverSide={false}
              data={combinedActivities || []}
              loading={dashboardLoading}
              onQueryParamsChange={handleQueryParamsChange}
              currentQueryParams={currentQueryParams}
              error={dashboardError}
              columns={recentActivitiesColumns}
              enableRowSelection={false}
              enableGlobalFilter={true}
              enableColumnFilter={false}
              enableAdvancedFilter={true}
              advancedFilterConfig={advancedFilterConfig}
              enableDragAndDrop={false}
              filterColumn="type"
              filterPlaceholder={t('dashboard.filterPlaceholder')}
              pageSize={10}
              showRowActions={false}
            />
          </div>

          {/* Dashboard Tables - Best Orders, Top Customers, Best Products */}
          <DashboardTables />
        </div>
      </div>
    </div>
  );
}