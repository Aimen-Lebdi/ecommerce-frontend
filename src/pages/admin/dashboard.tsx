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
import { DateRangePicker } from "../../components/admin/dashboard/date-range-picker";
import { ExportButton } from "../../components/admin/dashboard/export-button";
import { QuickActions } from "../../components/admin/dashboard/quick-actions";
import { OrderStatusChart } from "../../components/admin/dashboard/order-status-chart";
import { CategoryBrandChart } from "../../components/admin/dashboard/category-brand-chart";
import { LowStockList } from "../../components/admin/dashboard/low-stock-list";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useSocketContext } from "../../socket/useSocket";
import {
  fetchDashboardCards,
  fetchLowStock,
  fetchSalesBy,
  fetchDashboardTables,
} from "../../features/analytics/analyticsSlice";
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
  const { socketService, isConnected } = useSocketContext();

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
      payment: { variant: "default" as const, label: t('dashboard.activityTypes.payment') },
      stock: { variant: "secondary" as const, label: t('dashboard.activityTypes.stock') },
      auth: { variant: "destructive" as const, label: t('dashboard.activityTypes.auth') },
      delivery: { variant: "default" as const, label: t('dashboard.activityTypes.delivery') },
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
        const metadata = activity.metadata;
        
        // Build metadata details to display
        const metadataDetails: { label: string; value: string }[] = [];
        if (metadata) {
          if (metadata.orderShortId) metadataDetails.push({ label: t('dashboard.metadata.orderId'), value: `#${metadata.orderShortId}` });
          if (metadata.customerName) metadataDetails.push({ label: t('dashboard.metadata.customer'), value: metadata.customerName });
          if (metadata.paymentMethod) metadataDetails.push({ label: t('dashboard.metadata.paymentMethod'), value: metadata.paymentMethod });
          if (metadata.productTitle) metadataDetails.push({ label: t('dashboard.metadata.product'), value: metadata.productTitle });
          if (metadata.targetUserEmail) metadataDetails.push({ label: t('dashboard.metadata.email'), value: metadata.targetUserEmail });
          if (metadata.ipAddress) metadataDetails.push({ label: t('dashboard.metadata.ip'), value: metadata.ipAddress });
          if (metadata.quantityBefore !== undefined && metadata.quantityAfter !== undefined) {
            metadataDetails.push({ label: t('dashboard.metadata.stock'), value: `${metadata.quantityBefore} → ${metadata.quantityAfter}` });
          }
          if (metadata.itemsCount) metadataDetails.push({ label: t('dashboard.metadata.items'), value: String(metadata.itemsCount) });
        }

        return (
          <div>
            <div className="font-medium text-sm">{activity.activity}</div>
            <div className="text-xs text-muted-foreground line-clamp-1">
              {activity.description}
            </div>
            {metadataDetails.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {metadataDetails.slice(0, 3).map((detail, i) => (
                  <span key={i} className="text-[10px] text-muted-foreground bg-muted px-1 py-0.5 rounded">
                    {detail.label}: {detail.value}
                  </span>
                ))}
              </div>
            )}
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
            {(amount < 0 ? "-" : "") + Math.abs(amount).toFixed(2)} DZD
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
    select: {
      status: {
        label: t('dashboard.filters.status'),
        options: [
          { value: "success", label: t('dashboard.statuses.success') },
          { value: "pending", label: t('dashboard.statuses.pending') },
          { value: "failed", label: t('dashboard.statuses.failed') },
        ],
      },
    },
  };

  // Get activities from Redux store
  const {
    dashboardActivities,
    realtimeActivities,
    dashboardLoading,
    dashboardError,
    currentQueryParams,
    metricsActivityCount,
  } = useAppSelector((state) => state.activities);

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

  // FIXED (M6): Keep the dashboard cards live. When a realtime activity that
  // affects the metrics arrives (e.g. an order is placed/updated or a user
  // registers), refresh the analytics cards so revenue/orders/customers tick
  // up in real time instead of only after a manual refresh. The current global
  // date range is passed through so the live refresh respects the filter.
  const dateRange = useAppSelector((state) => state.analytics.dateRange);
  const salesByGroupBy = useAppSelector((state) => state.analytics.salesByGroupBy);

  React.useEffect(() => {
    if (metricsActivityCount > 0) {
      dispatch(fetchDashboardCards(dateRange || undefined));
    }
  }, [metricsActivityCount, dispatch, dateRange]);

  // Handle errors
  React.useEffect(() => {
    if (dashboardError) {
      toast.error(dashboardError);
      dispatch(clearDashboardError());
    }
  }, [dashboardError, dispatch]);

  // NOTE: Joining the dashboard room is handled by socketService (single
  // source of truth) - it re-emits join_dashboard on every connect for admins,
  // so the dashboard automatically re-joins after a reconnect. No local guard
  // is needed here anymore.

  // Handle query parameter changes from the DataTable
  const handleQueryParamsChange = React.useCallback(
    (params: ServerQueryParams) => {
      dispatch(setQueryParams(params));
      dispatch(fetchDashboardActivities());
    },
    [dispatch]
  );

  // Handle refresh button
  const handleRefresh = React.useCallback(() => {
    // M3: Refetch every dashboard widget, not just the activities table.
    dispatch(fetchDashboardActivities());

    dispatch(fetchLowStock());
    dispatch(fetchSalesBy({ groupBy: salesByGroupBy, range: dateRange || undefined }));
    dispatch(fetchDashboardTables(dateRange || undefined));

    if (isConnected) {
      socketService.requestActivityStats();
    }

    toast.success(t('dashboard.refreshSuccess'));
  }, [dispatch, isConnected, socketService, t, salesByGroupBy, dateRange]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Page header: title + export + global date range picker (M1/M6) */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 lg:px-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t('dashboard.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('dashboard.subtitle')}</p>
            </div>
            <div className="flex items-center gap-2">
              <ExportButton />
              <DateRangePicker />
            </div>
          </div>

          {/* Quick actions (M6) */}
          <div className="px-4 lg:px-6">
            <QuickActions />
          </div>

          {/* Dashboard Cards - Revenue, Customers, Orders, Top Product, AOV, Conversion */}
          <SectionCards />

          {/* Growth Rate Chart */}
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive refreshSignal={metricsActivityCount} />
          </div>

          {/* Order status + payment method donuts (M3) */}
          <div className="px-4 lg:px-6">
            <OrderStatusChart refreshSignal={metricsActivityCount} />
          </div>

          {/* Category/brand revenue + low-stock alerts (M4/M5) */}
          <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2">
            <CategoryBrandChart />
            <LowStockList />
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
            />
          </div>

          {/* Dashboard Tables - Best Orders, Top Customers, Best Products */}
          <DashboardTables />
        </div>
      </div>
    </div>
  );
}