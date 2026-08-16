import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { KpiChange } from "./kpi-change";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchDashboardCards } from "../../../features/analytics/analyticsSlice";
import { Skeleton } from "../../../components/ui/skeleton";
import { useTranslation } from 'react-i18next';

function CardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-40" />
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

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">{t('cards.revenue.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {revenue?.total.toLocaleString() || "0"} DZD
          </div>
          <KpiChange
            total={revenue?.total ?? 0}
            percentageChange={revenue?.percentageChange}
            trend={revenue?.trend ?? "neutral"}
            changeTextKey="cards.revenue.changeText"
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
          <KpiChange
            total={customers?.total ?? 0}
            percentageChange={customers?.percentageChange}
            trend={customers?.trend ?? "neutral"}
            changeTextKey="cards.customers.changeText"
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
          <KpiChange
            total={orders?.total ?? 0}
            percentageChange={orders?.percentageChange}
            trend={orders?.trend ?? "neutral"}
            changeTextKey="cards.orders.changeText"
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
          <KpiChange
            total={topProduct?.totalRevenue ?? 0}
            percentageChange={topProduct?.percentageChange}
            trend={topProduct?.trend ?? "neutral"}
            changeTextKey="cards.topProduct.changeText"
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
            {aov?.total.toLocaleString() || "0"} DZD
          </div>
          <KpiChange
            total={aov?.total ?? 0}
            percentageChange={aov?.percentageChange}
            trend={aov?.trend ?? "neutral"}
            changeTextKey="cards.aov.changeText"
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
          <KpiChange
            total={conversion?.total ?? 0}
            percentageChange={conversion?.percentageChange}
            trend={conversion?.trend ?? "neutral"}
            changeTextKey="cards.conversion.changeText"
          />
        </CardContent>
      </Card>
    </div>
  );
}