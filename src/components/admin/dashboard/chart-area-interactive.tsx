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

const chartConfig = {
  desktop: {
    label: "Revenue",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
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
          <CardTitle>Growth Rate</CardTitle>
          <CardDescription>Loading chart data...</CardDescription>
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
          <CardTitle>Growth Rate</CardTitle>
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
        <CardTitle>Growth Rate</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total revenue: ${totalRevenue.toLocaleString()}
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
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
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