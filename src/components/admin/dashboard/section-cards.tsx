import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchDashboardCards } from "../../../features/analytics/analyticsSlice";
import { Skeleton } from "../../../components/ui/skeleton";
import { useTranslation } from 'react-i18next';

// Generate mini chart data based on trend
const generateMiniChartData = (trend: "up" | "down" | "neutral") => {
  const baseValues = trend === "up" 
    ? [20, 45, 30, 70, 50]
    : trend === "down"
    ? [60, 30, 50, 20, 40]
    : [40, 45, 40, 45, 40];
  
  return baseValues.map(value => ({ value }));
};

function MiniChart({ data, color }: { data: unknown[]; color: string }) {
  return (
    <div className="h-[80px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function CardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-40 mb-4" />
        <Skeleton className="h-[80px] w-full" />
      </CardContent>
    </Card>
  );
}

export function SectionCards() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { revenue, customers, orders, topProduct, aov, conversion, cardsLoading, cardsError, dateRange } = 
    useAppSelector((state) => state.analytics);

  // Refetch whenever the global date range changes, passing the range through
  // so the backend filters all cards by the selected period (M1/M2).
  useEffect(() => {
    dispatch(fetchDashboardCards(dateRange || undefined));
  }, [dispatch, dateRange]);

  // FIXED (M6): Only show skeletons on the very first load. During live
  // refreshes (triggered by realtime activity) keep the last known values
  // visible instead of flickering to skeletons.
  const isInitialLoading =
    cardsLoading &&
    !revenue &&
    !orders &&
    !customers &&
    !topProduct &&
    !aov &&
    !conversion;

  if (isInitialLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  // Only show the error state when there is nothing to display yet.
  if (cardsError && !revenue && !orders && !customers && !topProduct && !aov && !conversion) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{cardsError}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const revenueData = generateMiniChartData(revenue?.trend || "neutral");
  const customersData = generateMiniChartData(customers?.trend || "neutral");
  const ordersData = generateMiniChartData(orders?.trend || "neutral");
  const productData = generateMiniChartData(topProduct?.trend || "neutral");
  const aovData = generateMiniChartData(aov?.trend || "neutral");
  const conversionData = generateMiniChartData(conversion?.trend || "neutral");

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">{t('cards.revenue.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${revenue?.total.toLocaleString() || "0"}
          </div>
          <p className={`text-xs flex items-center gap-1 ${
            revenue?.trend === "up" ? "text-green-500" : 
            revenue?.trend === "down" ? "text-red-500" : 
            "text-muted-foreground"
          }`}>
            {revenue?.trend === "up" ? (
              <IconTrendingUp className="w-4 h-4" />
            ) : revenue?.trend === "down" ? (
              <IconTrendingDown className="w-4 h-4" />
            ) : null}
            {revenue?.percentageChange !== undefined 
              ? t('cards.revenue.changeText', { 
                  percentage: revenue.percentageChange > 0 ? `+${revenue.percentageChange}` : revenue.percentageChange.toString()
                })
              : t('cards.noChange')}
          </p>
          <MiniChart 
            data={revenueData} 
            color={revenue?.trend === "up" ? "#22c55e" : revenue?.trend === "down" ? "#ef4444" : "#6b7280"} 
          />
        </CardContent>
      </Card>

      {/* New Customers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">{t('cards.customers.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {customers?.total.toLocaleString() || "0"}
          </div>
          <p className={`text-xs flex items-center gap-1 ${
            customers?.trend === "up" ? "text-green-500" : 
            customers?.trend === "down" ? "text-red-500" : 
            "text-muted-foreground"
          }`}>
            {customers?.trend === "up" ? (
              <IconTrendingUp className="w-4 h-4" />
            ) : customers?.trend === "down" ? (
              <IconTrendingDown className="w-4 h-4" />
            ) : null}
            {customers?.percentageChange !== undefined 
              ? t('cards.customers.changeText', { 
                  percentage: customers.percentageChange > 0 ? `+${customers.percentageChange}` : customers.percentageChange.toString()
                })
              : t('cards.noChange')}
          </p>
          <MiniChart 
            data={customersData} 
            color={customers?.trend === "up" ? "#22c55e" : customers?.trend === "down" ? "#ef4444" : "#6b7280"} 
          />
        </CardContent>
      </Card>

      {/* Total Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">{t('cards.orders.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {orders?.total.toLocaleString() || "0"}
          </div>
          <p className={`text-xs flex items-center gap-1 ${
            orders?.trend === "up" ? "text-green-500" : 
            orders?.trend === "down" ? "text-red-500" : 
            "text-muted-foreground"
          }`}>
            {orders?.trend === "up" ? (
              <IconTrendingUp className="w-4 h-4" />
            ) : orders?.trend === "down" ? (
              <IconTrendingDown className="w-4 h-4" />
            ) : null}
            {orders?.percentageChange !== undefined 
              ? t('cards.orders.changeText', { 
                  percentage: orders.percentageChange > 0 ? `+${orders.percentageChange}` : orders.percentageChange.toString()
                })
              : t('cards.orders.steadyFlow')}
          </p>
          <MiniChart 
            data={ordersData} 
            color={orders?.trend === "up" ? "#22c55e" : orders?.trend === "down" ? "#ef4444" : "#6b7280"} 
          />
        </CardContent>
      </Card>

      {/* Top Product */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">{t('cards.topProduct.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate" title={topProduct?.name}>
            {topProduct?.name || t('cards.topProduct.noSales')}
          </div>
          <p className={`text-xs flex items-center gap-1 ${
            topProduct?.trend === "up" ? "text-green-500" : 
            topProduct?.trend === "down" ? "text-red-500" : 
            "text-muted-foreground"
          }`}>
            {topProduct?.trend === "up" ? (
              <IconTrendingUp className="w-4 h-4" />
            ) : topProduct?.trend === "down" ? (
              <IconTrendingDown className="w-4 h-4" />
            ) : null}
            {topProduct?.percentageChange !== undefined 
              ? t('cards.topProduct.changeText', { 
                  percentage: topProduct.percentageChange > 0 ? `+${topProduct.percentageChange}` : topProduct.percentageChange.toString()
                })
              : t('cards.noData')}
          </p>
          <MiniChart 
            data={productData} 
            color={topProduct?.trend === "up" ? "#f59e0b" : topProduct?.trend === "down" ? "#ef4444" : "#6b7280"} 
          />
        </CardContent>
      </Card>

      {/* Average Order Value (M2) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">{t('cards.aov.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${aov?.total.toLocaleString() || "0"}
          </div>
          <p className={`text-xs flex items-center gap-1 ${
            aov?.trend === "up" ? "text-green-500" : 
            aov?.trend === "down" ? "text-red-500" : 
            "text-muted-foreground"
          }`}>
            {aov?.trend === "up" ? (
              <IconTrendingUp className="w-4 h-4" />
            ) : aov?.trend === "down" ? (
              <IconTrendingDown className="w-4 h-4" />
            ) : null}
            {aov?.percentageChange !== undefined 
              ? t('cards.aov.changeText', { 
                  percentage: aov.percentageChange > 0 ? `+${aov.percentageChange}` : aov.percentageChange.toString()
                })
              : t('cards.noChange')}
          </p>
          <MiniChart 
            data={aovData} 
            color={aov?.trend === "up" ? "#22c55e" : aov?.trend === "down" ? "#ef4444" : "#6b7280"} 
          />
        </CardContent>
      </Card>

      {/* Conversion (M2) — orders per registered user in the selected range */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">{t('cards.conversion.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {conversion?.total !== undefined && conversion?.total !== null
              ? conversion.total.toFixed(2)
              : "0.00"}
          </div>
          <p className={`text-xs flex items-center gap-1 ${
            conversion?.trend === "up" ? "text-green-500" : 
            conversion?.trend === "down" ? "text-red-500" : 
            "text-muted-foreground"
          }`}>
            {conversion?.trend === "up" ? (
              <IconTrendingUp className="w-4 h-4" />
            ) : conversion?.trend === "down" ? (
              <IconTrendingDown className="w-4 h-4" />
            ) : null}
            {conversion?.percentageChange !== undefined 
              ? t('cards.conversion.changeText', { 
                  percentage: conversion.percentageChange > 0 ? `+${conversion.percentageChange}` : conversion.percentageChange.toString()
                })
              : t('cards.noChange')}
          </p>
          <MiniChart 
            data={conversionData} 
            color={conversion?.trend === "up" ? "#22c55e" : conversion?.trend === "down" ? "#ef4444" : "#6b7280"} 
          />
        </CardContent>
      </Card>
    </div>
  );
}