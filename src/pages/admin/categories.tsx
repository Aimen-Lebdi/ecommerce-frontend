import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import {
  CategoryDialog,
  createEditCategoryDialog,
} from "../../components/admin/global/CategoryDialog";
import { DataTable } from "../../components/admin/global/data-table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";

// Define the Category entity type
export interface Category {
  id: number;
  name: string;
  description: string;
  status: "active" | "inactive";
  productCount: number;
  image?: string;
  createdAt: string;
}

// Sample data - in a real app, this would come from your API
const categoriesData: Category[] = [
  {
    id: 1,
    name: "Electronics",
    description: "Electronic devices and accessories",
    status: "active",
    productCount: 156,
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=40&h=40&fit=crop&crop=entropy",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Clothing",
    description: "Apparel and fashion accessories",
    status: "active",
    productCount: 89,
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=40&h=40&fit=crop&crop=entropy",
    createdAt: "2024-01-20",
  },
  {
    id: 3,
    name: "Home & Garden",
    description: "Home improvement and gardening supplies",
    status: "inactive",
    productCount: 42,
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=40&h=40&fit=crop&crop=entropy",
    createdAt: "2024-02-01",
  },
  {
    id: 4,
    name: "Books",
    description: "Books and educational materials",
    status: "active",
    productCount: 234,
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=40&h=40&fit=crop&crop=entropy",
    createdAt: "2024-02-10",
  },
  {
    id: 5,
    name: "Sports & Outdoors",
    description: "Sports equipment and outdoor gear",
    status: "active",
    productCount: 67,
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=40&h=40&fit=crop&crop=entropy",
    createdAt: "2024-02-15",
  },
  {
    id: 6,
    name: "Beauty & Health",
    description: "Cosmetics and health products",
    status: "active",
    productCount: 123,
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=40&h=40&fit=crop&crop=entropy",
    createdAt: "2024-01-30",
  },
  {
    id: 7,
    name: "Automotive",
    description: "Car parts and accessories",
    status: "inactive",
    productCount: 78,
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=40&h=40&fit=crop&crop=entropy",
    createdAt: "2024-02-20",
  },
  {
    id: 8,
    name: "Toys & Games",
    description: "Children's toys and games",
    status: "active",
    productCount: 34,
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=40&h=40&fit=crop&crop=entropy",
    createdAt: "2024-01-25",
  },
];

// Define columns specific to Categories
const categoriesColumns: ColumnDef<Category>[] = [
  {
    accessorKey: "name",
    header: "Category",
    cell: ({ row }) => {
      const category = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-md">
            <AvatarImage src={category.image} alt={category.name} />
            <AvatarFallback className="text-xs rounded-md">
              {category.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{category.name}</div>
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
        <div className="max-w-[200px] truncate text-muted-foreground">
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

// Advanced filter configuration for categories
const advancedFilterConfig = {
  numeric: {
    productCount: {
      label: "Product Count",
      placeholder: "Enter number of products",
    },
  },
  date: {
    createdAt: {
      label: "Created Date",
    },
  },
};

export default function Categories() {
  const [categories, setCategories] = React.useState(categoriesData);

  // Handle adding new category
  const handleAddCategory = (newCategory: Category) => {
    setCategories((prev) => [...prev, newCategory]);
    console.log("Added new category:", newCategory);
    toast.success("Category added successfully");
  };

  // Handle updating existing category
  const handleUpdateCategory = (updatedCategory: Category) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat))
    );
    console.log("Updated category:", updatedCategory);
    toast.success("Category updated successfully");
  };

  const handleDataChange = (newData: Category[]) => {
    setCategories(newData);
    // Here you would typically sync with your backend
    toast.success("Categories reordered successfully");
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-semibold">Categories</h1>
            <p className="text-muted-foreground">
              Manage your product categories and their details.
            </p>
          </div>

          <DataTable
            data={categories}
            columns={categoriesColumns}
            dialogComponent={
              <CategoryDialog mode="add" onSave={handleAddCategory} />
            }
            editDialogComponent={createEditCategoryDialog}
            onRowUpdate={handleUpdateCategory}
            enableDragAndDrop={true}
            enableRowSelection={true}
            enableGlobalFilter={true}
            enableColumnFilter={true}
            enableAdvancedFilter={true}
            advancedFilterConfig={advancedFilterConfig}
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
