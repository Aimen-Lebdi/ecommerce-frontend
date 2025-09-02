import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { toast } from "sonner";
import { AddBrandDialog, BrandDialog, createEditBrandDialog } from "../../components/BrandDialog";
import { DataTable } from "../../components/admin/dashboard/data-table";

// Define the Brand entity type
export interface Brand {
  id: number;
  name: string;
  description: string;
  logo?: string;
  website?: string;
  status: "active" | "inactive";
  productCount: number;
  createdAt: string;
}

// Sample data - in a real app, this would come from your API
const brandsData: Brand[] = [
  {
    id: 1,
    name: "Apple",
    description: "Consumer electronics and technology company",
    logo: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=40&h=40&fit=crop&crop=entropy",
    website: "https://apple.com",
    status: "active",
    productCount: 89,
    createdAt: "2024-01-10",
  },
  {
    id: 2,
    name: "Samsung",
    description: "Electronics and home appliances manufacturer",
    logo: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=40&h=40&fit=crop&crop=entropy",
    website: "https://samsung.com",
    status: "active",
    productCount: 156,
    createdAt: "2024-01-12",
  },
  {
    id: 3,
    name: "Nike",
    description: "Athletic footwear and apparel",
    logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=40&h=40&fit=crop&crop=entropy",
    website: "https://nike.com",
    status: "active",
    productCount: 234,
    createdAt: "2024-01-15",
  },
  {
    id: 4,
    name: "Adidas",
    description: "Sports clothing and accessories",
    logo: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=40&h=40&fit=crop&crop=entropy",
    website: "https://adidas.com",
    status: "active",
    productCount: 187,
    createdAt: "2024-01-18",
  },
  {
    id: 5,
    name: "Sony",
    description: "Consumer and professional electronics",
    logo: "https://images.unsplash.com/photo-1493020258366-be3ead61c638?w=40&h=40&fit=crop&crop=entropy",
    website: "https://sony.com",
    status: "inactive",
    productCount: 45,
    createdAt: "2024-01-20",
  },
  {
    id: 6,
    name: "Microsoft",
    description: "Software, hardware, and cloud services",
    website: "https://microsoft.com",
    status: "active",
    productCount: 67,
    createdAt: "2024-01-22",
  },
  {
    id: 7,
    name: "Dell",
    description: "Computer hardware and technology solutions",
    website: "https://dell.com",
    status: "active",
    productCount: 123,
    createdAt: "2024-01-25",
  },
];

// Define columns specific to Brands
const brandsColumns: ColumnDef<Brand>[] = [
  {
    accessorKey: "name",
    header: "Brand",
    cell: ({ row }) => {
      const brand = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={brand.logo} alt={brand.name} />
            <AvatarFallback className="text-xs">
              {brand.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{brand.name}</div>
            {brand.website && (
              <div className="text-xs text-muted-foreground">
                {brand.website.replace("https://", "")}
              </div>
            )}
          </div>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      return (
        <div className="max-w-[250px] truncate text-muted-foreground">
          {row.getValue("description")}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "productCount",
    header: "Products",
    cell: ({ row }) => {
      const count = row.getValue("productCount") as number;
      return (
        <div className="text-center font-medium">{count.toLocaleString()}</div>
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

export default function Brands() {
  const [brands, setBrands] = React.useState(brandsData);

  // Handle adding new Brand
  const handleAddBrand = (newBrand: Brand) => {
    setBrands((prev) => [...prev, newBrand]);
    console.log("Added new Brand:", newBrand);
  };

  // Handle updating existing Brand
  const handleUpdateBrand = (updatedBrand: Brand) => {
    setBrands((prev) =>
      prev.map((cat) => (cat.id === updatedBrand.id ? updatedBrand : cat))
    );
    console.log("Updated Brand:", updatedBrand);
  };

  const handleDataChange = (newData: Brand[]) => {
    setBrands(newData);
    // Here you would typically sync with your backend
    toast.success("Brands reordered successfully");
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <DataTable
            data={brands}
            columns={brandsColumns}
            dialogComponent={
              <BrandDialog mode="add" onSave={handleAddBrand} />
            }
            editDialogComponent={createEditBrandDialog}
            onRowUpdate={handleUpdateBrand}
            enableDragAndDrop={true}
            enableRowSelection={true}
            enableGlobalFilter={true}
            enableColumnFilter={true}
            filterColumn="status"
            filterPlaceholder="Filter by status..."
            onDataChange={handleDataChange}
            pageSize={10}
          />
        </div>
      </div>
    </div>
  );
}
