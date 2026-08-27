"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui/chart"
import { useAppDispatch, useAppSelector } from "../../../app/hooks"
import { fetchGrowthRate } from "../../../features/analytics/analyticsSlice"
import { Skeleton } from "../../ui/skeleton"
import { useTranslation } from 'react-i18next';import { formatPrice } from "../../../utils/formatPrice";
const chartConfig = {
  desktop: {
    label: "Revenue",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive({
  refreshSignal = 0,
}: {
  refreshSignal?: number;
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch()
  const { growthRateData, growthRateLoading, growthRateError, dateRange } = 
    useAppSelector((state) => state.analytics)
  
  // Fetch growth rate data when the component mounts, the global date range
  // changes, or a live activity arrives (refreshSignal). The global date range
  // (M1) is the single source of truth for the period; when none is selected we
  // fall back to a default rolling 90-day window.
  React.useEffect(() => {
    dispatch(fetchGrowthRate({ days: 90, range: dateRange || undefined }))
  }, [refreshSignal, dispatch, dateRange])

  // Calculate total revenue for the period
  const totalRevenue = React.useMemo(() => {
    return growthRateData.reduce((sum, item) => sum + item.desktop, 0)
  }, [growthRateData])

  // FIXED (M6): Only show the skeleton on the very first load; during live
  // refreshes keep the last chart visible so it doesn't flicker.
  const isInitialLoading = growthRateLoading && growthRateData.length === 0

  if (isInitialLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>{t('chart.growthRate.title')}</CardTitle>
          <CardDescription>{t('chart.growthRate.loading')}</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (growthRateError && growthRateData.length === 0) {
    return (
      <Card className="@container/card border-destructive">
        <CardHeader>
          <CardTitle>{t('chart.growthRate.title')}</CardTitle>
          <CardDescription className="text-destructive">
            {growthRateError}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{t('chart.growthRate.title')}</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            {t('chart.growthRate.totalRevenue')}: {formatPrice(totalRevenue)}
          </span>
          <span className="@[540px]/card:hidden">
            {formatPrice(totalRevenue)}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={growthRateData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                  indicator="dot"
                  formatter={(value) => `${value}`}
                />
              }
            />
            <Area
              dataKey="desktop"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}