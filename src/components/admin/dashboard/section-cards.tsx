import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../..//components/ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";

const revenueData = [
  { value: 20 },
  { value: 45 },
  { value: 30 },
  { value: 70 },
  { value: 50 },
];

const customersData = [
  { value: 60 },
  { value: 30 },
  { value: 50 },
  { value: 20 },
  { value: 40 },
];

const ordersData = [
  { value: 15 },
  { value: 35 },
  { value: 55 },
  { value: 40 },
  { value: 65 },
];

const productData = [
  { value: 25 },
  { value: 60 },
  { value: 40 },
  { value: 80 },
  { value: 55 },
];

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

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$1,250.00</div>
          <p className="text-xs text-green-500 flex items-center gap-1">
            <IconTrendingUp className="w-4 h-4" /> +12.5% compared to last month
          </p>
          <MiniChart data={revenueData} color="#22c55e" /> {/* green */}
        </CardContent>
      </Card>

      {/* New Customers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">New Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,234</div>
          <p className="text-xs text-red-500 flex items-center gap-1">
            <IconTrendingDown className="w-4 h-4" /> -20% this period
          </p>
          <MiniChart data={customersData} color="#ef4444" /> {/* red */}
        </CardContent>
      </Card>

      {/* Total Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">45,678</div>
          <p className="text-xs text-green-500 flex items-center gap-1">
            <IconTrendingUp className="w-4 h-4" /> Steady order flow this month
          </p>
          <MiniChart data={ordersData} color="#22c55e" /> {/* green */}
        </CardContent>
      </Card>

      {/* Top Product */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Top Product</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">#1 Sneakers</div>
          <p className="text-xs text-green-500 flex items-center gap-1">
            <IconTrendingUp className="w-4 h-4" /> +35% this month
          </p>
          <MiniChart data={productData} color="#f59e0b" /> {/* orange */}
        </CardContent>
      </Card>
    </div>
  );
}
