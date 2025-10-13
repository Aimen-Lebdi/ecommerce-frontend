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
  const dispatch = useAppDispatch();
  const { revenue, customers, orders, topProduct, cardsLoading, cardsError } = 
    useAppSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchDashboardCards());
  }, [dispatch]);

  if (cardsLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (cardsError) {
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

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
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
              ? `${revenue.percentageChange > 0 ? "+" : ""}${revenue.percentageChange}% compared to last month`
              : "No change"}
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
          <CardTitle className="text-sm font-medium">New Customers</CardTitle>
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
              ? `${customers.percentageChange > 0 ? "+" : ""}${customers.percentageChange}% this period`
              : "No change"}
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
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
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
              ? `${orders.percentageChange > 0 ? "+" : ""}${orders.percentageChange}% order flow this month`
              : "Steady order flow"}
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
          <CardTitle className="text-sm font-medium">Top Product</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate" title={topProduct?.name}>
            {topProduct?.name || "No sales yet"}
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
              ? `${topProduct.percentageChange > 0 ? "+" : ""}${topProduct.percentageChange}% this month`
              : "No data"}
          </p>
          <MiniChart 
            data={productData} 
            color={topProduct?.trend === "up" ? "#f59e0b" : topProduct?.trend === "down" ? "#ef4444" : "#6b7280"} 
          />
        </CardContent>
      </Card>
    </div>
  );
}