import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { toast } from "sonner";
import { DataTable } from "../../components/admin/dashboard/data-table";
import { createEditProductDialog, ProductDialog } from "../../components/ProductDialog";

// Define the Product entity type
export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
  image?: string;
  createdAt: string;
}

// Sample data - in a real app, this would come from your API
const productsData: Product[] = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    sku: "APL-IP15PM-256",
    category: "Smartphones",
    brand: "Apple",
    price: 1199.99,
    stock: 45,
    status: "in-stock",
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=40&h=40&fit=crop&crop=entropy",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    sku: "SAM-GS24U-512",
    category: "Smartphones",
    brand: "Samsung",
    price: 1299.99,
    stock: 23,
    status: "in-stock",
    image:
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=40&h=40&fit=crop&crop=entropy",
    createdAt: "2024-01-18",
  },
  {
    id: 3,
    name: 'MacBook Pro 16"',
    sku: "APL-MBP16-1TB",
    category: "Laptops",
    brand: "Apple",
    price: 2499.99,
    stock: 12,
    status: "in-stock",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=40&h=40&fit=crop&crop=entropy",
    createdAt: "2024-01-20",
  },
  {
    id: 4,
    name: "Dell XPS 13",
    sku: "DEL-XPS13-512",
    category: "Laptops",
    brand: "Dell",
    price: 1299.99,
    stock: 8,
    status: "low-stock",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=40&h=40&fit=crop&crop=entropy",
    createdAt: "2024-01-22",
  },
  {
    id: 5,
    name: "Nike Air Max 270",
    sku: "NK-AM270-BLK",
    category: "Footwear",
    brand: "Nike",
    price: 149.99,
    stock: 0,
    status: "out-of-stock",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=40&h=40&fit=crop&crop=entropy",
    createdAt: "2024-01-25",
  },
  {
    id: 6,
    name: "Sony WH-1000XM5",
    sku: "SNY-WH1000XM5",
    category: "Audio",
    brand: "Sony",
    price: 399.99,
    stock: 34,
    status: "in-stock",
    image:
      "https://images.unsplash.com/photo-1493020258366-be3ead61c638?w=40&h=40&fit=crop&crop=entropy",
    createdAt: "2024-01-28",
  },
  {
    id: 7,
    name: "Adidas Ultraboost 22",
    sku: "ADI-UB22-WHT",
    category: "Footwear",
    brand: "Adidas",
    price: 189.99,
    stock: 5,
    status: "low-stock",
    image:
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=40&h=40&fit=crop&crop=entropy",
    createdAt: "2024-02-01",
  },
  {
    id: 8,
    name: "Microsoft Surface Pro 9",
    sku: "MST-SP9-256",
    category: "Tablets",
    brand: "Microsoft",
    price: 999.99,
    stock: 18,
    status: "in-stock",
    createdAt: "2024-02-05",
  },
];

// Define columns specific to Products
const productsColumns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-md">
            <AvatarImage src={product.image} alt={product.name} />
            <AvatarFallback className="text-xs rounded-md">
              {product.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{product.name}</div>
            <div className="text-xs text-muted-foreground font-mono">
              SKU: {product.sku}
            </div>
          </div>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-muted-foreground">
        {row.getValue("category")}
      </Badge>
    ),
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => (
      <div className="font-medium text-sm">{row.getValue("brand")}</div>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("price") as number;
      return <div className="text-right font-medium">${price.toFixed(2)}</div>;
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number;
      const status = row.original.status;
      return (
        <div
          className={`text-center font-medium ${
            status === "out-of-stock"
              ? "text-red-600"
              : status === "low-stock"
              ? "text-orange-600"
              : "text-green-600"
          }`}
        >
          {stock}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variants = {
        "in-stock": "default",
        "low-stock": "destructive",
        "out-of-stock": "secondary",
      } as const;
      return (
        <Badge variant={variants[status as keyof typeof variants]}>
          {status.replace("-", " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-muted-foreground">{date.toLocaleDateString()}</div>
      );
    },
  },
];

export default function Products() {
  const [products, setProducts] = React.useState(productsData);

  // Handle adding new Product
  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [...prev, newProduct]);
    console.log("Added new Product:", newProduct);
  };

  // Handle updating existing Product
  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((cat) => (cat.id === updatedProduct.id ? updatedProduct : cat))
    );
    console.log("Updated Product:", updatedProduct);
  };

  const handleDataChange = (newData: Product[]) => {
    setProducts(newData);
    // Here you would typically sync with your backend
    toast.success("Products reordered successfully");
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <DataTable
            data={products}
            columns={productsColumns}
            dialogComponent={
              <ProductDialog mode="add" onSave={handleAddProduct} />
            }
            editDialogComponent={createEditProductDialog}
            onRowUpdate={handleUpdateProduct}
            enableDragAndDrop={true}
            enableRowSelection={true}
            enableGlobalFilter={true}
            enableColumnFilter={true}
            filterColumn="category"
            filterPlaceholder="Filter by category..."
            onDataChange={handleDataChange}
            pageSize={12}
          />
        </div>
      </div>
    </div>
  );
}
