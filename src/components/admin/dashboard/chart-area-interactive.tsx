"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardAction,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../ui/toggle-group"
import { useAppDispatch, useAppSelector } from "../../../app/hooks"
import { fetchGrowthRate } from "../../../features/analytics/analyticsSlice"
import { Skeleton } from "../../ui/skeleton"
import { useTranslation } from 'react-i18next';

const chartConfig = {
  desktop: {
    label: "Revenue",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch()
  const { growthRateData, growthRateLoading, growthRateError } = 
    useAppSelector((state) => state.analytics)
  
  const [timeRange, setTimeRange] = React.useState("90d")

  // Fetch growth rate data when component mounts or timeRange changes
  React.useEffect(() => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90
    dispatch(fetchGrowthRate(days))
  }, [timeRange, dispatch])

  const handleTimeRangeChange = (value: string) => {
    if (value) {
      setTimeRange(value)
    }
  }

  // Calculate total revenue for the period
  const totalRevenue = React.useMemo(() => {
    return growthRateData.reduce((sum, item) => sum + item.desktop, 0)
  }, [growthRateData])

  if (growthRateLoading) {
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

  if (growthRateError) {
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
            {t('chart.growthRate.totalRevenue')}: ${totalRevenue.toLocaleString()}
          </span>
          <span className="@[540px]/card:hidden">
            ${totalRevenue.toLocaleString()}
          </span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={handleTimeRangeChange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">{t('chart.timeRange.last3Months')}</ToggleGroupItem>
            <ToggleGroupItem value="30d">{t('chart.timeRange.last30Days')}</ToggleGroupItem>
            <ToggleGroupItem value="7d">{t('chart.timeRange.last7Days')}</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label={t('chart.timeRange.selectAriaLabel')}
            >
              <SelectValue placeholder={t('chart.timeRange.last3Months')} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                {t('chart.timeRange.last3Months')}
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                {t('chart.timeRange.last30Days')}
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                {t('chart.timeRange.last7Days')}
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
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