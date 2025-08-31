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

const orders = [
  { id: "ORD-1001", customer: "Alice", total: "$500", date: "2025-08-01" },
  { id: "ORD-1002", customer: "Bob", total: "$420", date: "2025-08-02" },
  { id: "ORD-1003", customer: "Charlie", total: "$390", date: "2025-08-03" },
];

const sellers = [
  { name: "Seller A", products: 120, revenue: "$12,000" },
  { name: "Seller B", products: 95, revenue: "$9,500" },
  { name: "Seller C", products: 80, revenue: "$8,000" },
];

const products = [
  { name: "iPhone 17", sold: 300, revenue: "$300,000" },
  { name: "Samsung S25", sold: 250, revenue: "$200,000" },
  { name: "MacBook Pro 2025", sold: 150, revenue: "$225,000" },
];

export function DashboardTables() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 mt-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      {/* Best Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Best Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.total}</TableCell>
                  <TableCell>{order.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Customers */}
      <Card>
        <CardHeader>
          <CardTitle>New Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seller</TableHead>
                <TableHead>Products Sold</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers.map((seller, idx) => (
                <TableRow key={idx}>
                  <TableCell>{seller.name}</TableCell>
                  <TableCell>{seller.products}</TableCell>
                  <TableCell>{seller.revenue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Best Products */}
      <Card>
        <CardHeader>
          <CardTitle>Best Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Units Sold</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, idx) => (
                <TableRow key={idx}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.sold}</TableCell>
                  <TableCell>{product.revenue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
