import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
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
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory, // ✅ ADD THIS
  clearError,
  type CreateCategoryData,
  type UpdateCategoryData,
} from "../../features/categories/categoriesSlice";

// Define the Category entity type to match backend response
export interface Category {
  _id: string;
  name: string;
  image?: string;
  createdAt: string;
  productCount?: number;
}

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
    accessorKey: "productCount",
    header: "Products",
    cell: ({ row }) => {
      const count = row.original.productCount || 0;
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

export default function Categories() {
  const dispatch = useAppDispatch();
  const { categories, loading, error, isCreating, isUpdating, isDeleting } =
    useAppSelector((state) => state.categories);

  React.useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  React.useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);


  
  // Handle adding new category
  const handleAddCategory = async (categoryData: {
    name: string;
    image?: File;
  }) => {
    try {
      await dispatch(
        createCategory(categoryData as CreateCategoryData)
      ).unwrap();
      toast.success("Category added successfully");
    } catch (error) {
      console.error("Failed to add category:", error);
    }
  };

  // Handle updating existing category
  const handleUpdateCategory = async (
    id: string,
    categoryData: { name?: string; image?: File }
  ) => {
    try {
      await dispatch(
        updateCategory({ id, categoryData: categoryData as UpdateCategoryData })
      ).unwrap();
      toast.success("Category updated successfully");
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await dispatch(deleteCategory(id)).unwrap();
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  if (loading) {
    return <div>Loading categories...</div>;
  }

  if (error && categories.length === 0) {
    return <div>Error loading categories: {error}</div>;
  }

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

          <DataTable<Category>
            data={categories || []}
            columns={categoriesColumns}
            dialogComponent={
              <CategoryDialog
                mode="add"
                onSave={handleAddCategory}
                isLoading={isCreating}
              />
            }
            editDialogComponent={(rowData: Category) =>
              createEditCategoryDialog(
                rowData,
                (updatedData) => {
                  handleUpdateCategory(rowData._id, {
                    name: updatedData.name,
                    image:
                      updatedData.image instanceof File
                        ? updatedData.image
                        : undefined,
                  });
                },
                isUpdating
              )
            }
            onRowDelete={handleDeleteCategory}
            // ✅ ADD THIS: Pass loading state
            isDeleting={isDeleting}
            enableDragAndDrop={true}
            enableRowSelection={true}
            enableGlobalFilter={true}
            enableColumnFilter={true}
            enableAdvancedFilter={true}
            filterColumn="status"
            filterPlaceholder="Filter by status..."
            pageSize={10}
          />
        </div>
      </div>
    </div>
  );
}
