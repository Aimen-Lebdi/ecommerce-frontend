import * as React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Skeleton } from "../../ui/skeleton";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  fetchOrderStatus,
  fetchPaymentMethods,
} from "../../../features/analytics/analyticsSlice";
import { useTranslation } from "react-i18next";

// Five-hue data-viz palette from DESIGN.md, mapped semantically:
// steel = in motion, lagoon = settled/positive, gold = attention,
// rust = ended badly, ember = card payments.
const STATUS_COLORS: Record<string, string> = {
  inProgress: "oklch(0.398 0.07 227.392)", // steel
  completed: "oklch(0.6 0.118 184.704)", // lagoon
  failedReturned: "oklch(0.828 0.189 84.429)", // gold
  cancelled: "oklch(0.769 0.188 70.08)", // rust
};

const METHOD_COLORS: Record<string, string> = {
  card: "oklch(0.646 0.222 41.116)", // ember
  cash: "oklch(0.6 0.118 184.704)", // lagoon
};

interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

function Donut({
  title,
  total,
  data,
  emptyLabel,
}: {
  title: string;
  total: number;
  data: DonutSlice[];
  emptyLabel: string;
}) {
  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-6">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative h-[180px] w-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={2}
            >
              {data.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--popover)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{total}</span>
          <span className="text-xs text-muted-foreground">{title}</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {data.map((slice) => (
          <div key={slice.name} className="flex items-center gap-1.5 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-muted-foreground">{slice.name}</span>
            <span className="font-medium">{slice.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * M3 — Order-status + payment-method donuts. Fetched on mount, when the global
 * date range changes, and refreshed in realtime via `refreshSignal`.
 */
export function OrderStatusChart({
  refreshSignal = 0,
}: {
  refreshSignal?: number;
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    orderStatus,
    paymentMethods,
    orderStatusLoading,
    paymentMethodsLoading,
    dateRange,
  } = useAppSelector((state) => state.analytics);

  React.useEffect(() => {
    dispatch(fetchOrderStatus(dateRange || undefined));
    dispatch(fetchPaymentMethods(dateRange || undefined));
  }, [dispatch, dateRange, refreshSignal]);

  const loading = orderStatusLoading || paymentMethodsLoading;
  const isInitialLoading =
    loading && !orderStatus && !paymentMethods;

  const statusData: DonutSlice[] = (orderStatus?.buckets || []).map(
    (bucket) => ({
      name: t(`charts.orderStatus.buckets.${bucket.key}`),
      value: bucket.count,
      color: STATUS_COLORS[bucket.key],
    })
  );

  const methodData: DonutSlice[] = paymentMethods
    ? [
        {
          name: t("charts.paymentMethods.card"),
          value: paymentMethods.card.count,
          color: METHOD_COLORS.card,
        },
        {
          name: t("charts.paymentMethods.cash"),
          value: paymentMethods.cash.count,
          color: METHOD_COLORS.cash,
        },
      ]
    : [];

  if (isInitialLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Skeleton className="h-[180px] w-[180px] rounded-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Skeleton className="h-[180px] w-[180px] rounded-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            {t("charts.orderStatus.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <Donut
            title={t("charts.orderStatus.totalLabel")}
            total={orderStatus?.totalOrders || 0}
            data={statusData}
            emptyLabel={t("charts.orderStatus.empty")}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            {t("charts.paymentMethods.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <Donut
            title={t("charts.paymentMethods.totalLabel")}
            total={(paymentMethods?.card.count || 0) + (paymentMethods?.cash.count || 0)}
            data={methodData}
            emptyLabel={t("charts.paymentMethods.empty")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
