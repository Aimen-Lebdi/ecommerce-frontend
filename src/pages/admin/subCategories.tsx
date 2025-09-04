import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "../../components/ui/badge";

import { toast } from "sonner";
import {
  createEditSubCategoryDialog,
  SubCategoryDialog,
} from "../../components/admin/global/SubCategoryDialog";
import { DataTable } from "../../components/admin/global/data-table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";

// Define the Subcategory entity type
export interface Subcategory {
  id: number;
  name: string;
  description: string;
  categoryName: string;
  categoryId: number;
  status: "active" | "inactive";
  productCount: number;
  image?: string;
  createdAt: string;
}

// Sample data - in a real app, this would come from your API
const subcategoriesData: Subcategory[] = [
  {
    id: 1,
    name: "Smartphones",
    description: "Mobile phones and accessories",
    categoryName: "Electronics",
    categoryId: 1,
    status: "active",
    productCount: 45,
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=40&h=40&fit=crop&crop=entropy",

    createdAt: "2024-01-16",
  },
  {
    id: 2,
    name: "Laptops",
    description: "Portable computers and laptops",
    categoryName: "Electronics",
    categoryId: 1,
    status: "active",
    productCount: 32,
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=40&h=40&fit=crop&crop=entropy",

    createdAt: "2024-01-18",
  },
  {
    id: 3,
    name: "Men's Clothing",
    description: "Clothing items for men",
    categoryName: "Clothing",
    categoryId: 2,
    status: "active",
    productCount: 56,
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=40&h=40&fit=crop&crop=entropy",

    createdAt: "2024-01-22",
  },
  {
    id: 4,
    name: "Women's Clothing",
    description: "Clothing items for women",
    categoryName: "Clothing",
    categoryId: 2,
    status: "active",
    productCount: 33,
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=40&h=40&fit=crop&crop=entropy",

    createdAt: "2024-01-25",
  },
  {
    id: 5,
    name: "Garden Tools",
    description: "Tools for gardening and landscaping",
    categoryName: "Home & Garden",
    categoryId: 3,
    status: "inactive",
    productCount: 18,
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=40&h=40&fit=crop&crop=entropy",

    createdAt: "2024-02-02",
  },
  {
    id: 6,
    name: "Fiction Books",
    description: "Novels and fictional literature",
    categoryName: "Books",
    categoryId: 4,
    status: "active",
    productCount: 127,
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=40&h=40&fit=crop&crop=entropy",

    createdAt: "2024-02-12",
  },
  {
    id: 7,
    name: "Fitness Equipment",
    description: "Exercise and fitness gear",
    categoryName: "Sports & Outdoors",
    categoryId: 5,
    status: "active",
    productCount: 29,
    image:
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=40&h=40&fit=crop&crop=entropy",

    createdAt: "2024-02-16",
  },
];

// Define columns specific to Subcategories
const subcategoriesColumns: ColumnDef<Subcategory>[] = [
  {
    accessorKey: "name",
    header: "Subcategory",
    cell: ({ row }) => {
      const subcategory = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-md">
            <AvatarImage src={subcategory.image} alt={subcategory.name} />
            <AvatarFallback className="text-xs rounded-md">
              {subcategory.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{subcategory.name}</div>
          </div>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "categoryName",
    header: "Category",
    cell: ({ row }) => {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          {row.getValue("categoryName")}
        </Badge>
      );
    },
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

export default function Subcategories() {
  const [subcategories, setSubcategories] = React.useState(subcategoriesData);

  // Handle adding new category
  const handleAddSubcategory = (newSubcategory: Subcategory) => {
    setSubcategories((prev) => [...prev, newSubcategory]);
    console.log("Added new Subcategory:", newSubcategory);
  };

  // Handle updating existing Subcategory
  const handleUpdateSubcategory = (updatedSubcategory: Subcategory) => {
    setSubcategories((prev) =>
      prev.map((cat) =>
        cat.id === updatedSubcategory.id ? updatedSubcategory : cat
      )
    );
    console.log("Updated Subcategory:", updatedSubcategory);
  };

  const handleDataChange = (newData: Subcategory[]) => {
    setSubcategories(newData);
    // Here you would typically sync with your backend
    toast.success("Subcategories reordered successfully");
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <DataTable
            data={subcategories}
            columns={subcategoriesColumns}
            dialogComponent={
              <SubCategoryDialog mode="add" onSave={handleAddSubcategory} />
            }
            editDialogComponent={createEditSubCategoryDialog}
            onRowUpdate={handleUpdateSubcategory}
            enableDragAndDrop={true}
            enableRowSelection={true}
            enableGlobalFilter={true}
            enableColumnFilter={true}
            enableAdvancedFilter={true}
            advancedFilterConfig={advancedFilterConfig}
            filterColumn="categoryName"
            filterPlaceholder="Filter by category..."
            onDataChange={handleDataChange}
            pageSize={10}
          />
        </div>
      </div>
    </div>
  );
}
