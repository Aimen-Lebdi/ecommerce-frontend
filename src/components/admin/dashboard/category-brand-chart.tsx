import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Skeleton } from "../../ui/skeleton";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "../../ui/toggle-group";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchSalesBy } from "../../../features/analytics/analyticsSlice";
import { useTranslation } from "react-i18next";

const COLORS = [
  "#3b82f6",
  "#22c55e",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#f97316",
  "#14b8a6",
];

/**
 * M5 — Category/brand revenue chart. Horizontal bar chart with a category/brand
 * toggle. Fetched on mount, on range change and on group toggle change.
 */
export function CategoryBrandChart() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { salesBy, salesByLoading, salesByError, dateRange } =
    useAppSelector((state) => state.analytics);
  const [groupBy, setGroupBy] = React.useState<"category" | "brand">("category");

  React.useEffect(() => {
    dispatch(fetchSalesBy({ groupBy, range: dateRange || undefined }));
  }, [dispatch, groupBy, dateRange]);

  const handleGroupChange = (value: string) => {
    if (value === "category" || value === "brand") {
      setGroupBy(value);
    }
  };

  const data = salesBy.map((item, index) => ({
    name: item.name,
    revenue: item.revenue,
    fill: COLORS[index % COLORS.length],
  }));

  if (salesByLoading && salesBy.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">
          {t("charts.salesBy.title")}
        </CardTitle>
        <ToggleGroup
          type="single"
          value={groupBy}
          onValueChange={handleGroupChange}
          variant="outline"
          className="*:data-[slot=toggle-group-item]:!px-3"
        >
          <ToggleGroupItem value="category">{t("charts.salesBy.category")}</ToggleGroupItem>
          <ToggleGroupItem value="brand">{t("charts.salesBy.brand")}</ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent className="pt-2">
        {salesByError && data.length === 0 ? (
          <p className="text-sm text-destructive text-center py-10">
            {salesByError}
          </p>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            {t("charts.salesBy.empty")}
          </p>
        ) : (
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                    background: "var(--popover)",
                  }}
                  formatter={(value: number) =>
                    `${value.toLocaleString()} DZD`
                  }
                />
                <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
