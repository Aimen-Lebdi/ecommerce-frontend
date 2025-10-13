import { useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchDashboardTables } from "../../../features/analytics/analyticsSlice";
import { IconTrophy, IconShoppingCart, IconPackage } from "@tabler/icons-react";

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function DashboardTables() {
  const dispatch = useAppDispatch();
  const { 
    bestOrders, 
    topCustomers, 
    bestProducts, 
    tablesLoading, 
    tablesError 
  } = useAppSelector((state) => state.analytics);

  useEffect(() => {
    dispatch(fetchDashboardTables());
  }, [dispatch]);

  if (tablesError) {
    return (
      <div className="px-4 lg:px-6 mt-4">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{tablesError}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 px-4 mt-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      {/* Best Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <IconShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg font-semibold">Best Orders</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            Top 5
          </Badge>
        </CardHeader>
        <CardContent>
          {tablesLoading ? (
            <TableSkeleton />
          ) : bestOrders.length === 0 ? (
            <EmptyState message="No orders yet" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bestOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline" className="font-mono text-xs">
                        {order.id}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {order.customer}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {order.total}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(order.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Top Customers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <IconTrophy className="w-5 h-5 text-blue-500" />
            </div>
            <CardTitle className="text-lg font-semibold">Top Customers</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            Top 5
          </Badge>
        </CardHeader>
        <CardContent>
          {tablesLoading ? (
            <TableSkeleton />
          ) : topCustomers.length === 0 ? (
            <EmptyState message="No customers yet" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-center">Orders</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topCustomers.map((customer, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-xs font-semibold">
                          {index + 1}
                        </div>
                        <span>{customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-xs">
                        {customer.products}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {customer.revenue}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Best Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <IconPackage className="w-5 h-5 text-orange-500" />
            </div>
            <CardTitle className="text-lg font-semibold">Best Products</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            Top 5
          </Badge>
        </CardHeader>
        <CardContent>
          {tablesLoading ? (
            <TableSkeleton />
          ) : bestProducts.length === 0 ? (
            <EmptyState message="No products sold yet" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Units Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bestProducts.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-500/10 text-xs font-semibold">
                          {index + 1}
                        </div>
                        <span className="truncate max-w-[150px]" title={product.name}>
                          {product.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-xs">
                        {product.sold}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {product.revenue}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}