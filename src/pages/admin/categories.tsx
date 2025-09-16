import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
  CategoryDialog,
  createEditCategoryDialog,
} from "../../components/admin/global/CategoryDialog";
import {
  DataTable,
  type ServerQueryParams,
} from "../../components/admin/global/data-table";
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
  deleteCategory,
  deleteManyCategories,
  clearError,
  setQueryParams,
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
        <div className="text-start font-medium">{count.toLocaleString()}</div>
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
  const dispatch = useAppDispatch();
  const {
    categories,
    pagination,
    loading,
    error,
    isCreating,
    isUpdating,
    isDeleting,
    isDeletingMany,
    currentQueryParams,
  } = useAppSelector((state) => state.categories);

  // Load initial data on component mount
  React.useEffect(() => {
    // Load categories with default parameters on mount
    const initialParams: ServerQueryParams = {
      page: 1,
      limit: 10,
    };
    dispatch(fetchCategories(initialParams));
  }, [dispatch]);

  // Handle errors
  React.useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Handle query parameter changes from the DataTable
  const handleQueryParamsChange = React.useCallback(
    (params: ServerQueryParams) => {
      // Store the parameters in Redux state for future reference
      dispatch(setQueryParams(params));
      // Fetch data with new parameters
      dispatch(fetchCategories(params));
    },
    [dispatch]
  );

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
      // Note: createCategory thunk automatically refetches data
    } catch (error) {
      console.error("Failed to add category:", error);
      // Error toast is handled by the error useEffect above
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
      // Note: updateCategory thunk automatically refetches data
    } catch (error) {
      console.error("Failed to update category:", error);
      // Error toast is handled by the error useEffect above
    }
  };

  // Handle single category delete
  const handleDeleteCategory = async (id: string) => {
    try {
      await dispatch(deleteCategory(id)).unwrap();
      toast.success("Category deleted successfully");
      // Note: deleteCategory thunk automatically refetches data
    } catch (error) {
      console.error("Failed to delete category:", error);
      // Error toast is handled by the error useEffect above
    }
  };

  // Handle bulk category delete
  const handleBulkDeleteCategories = async (ids: string[]) => {
    try {
      await dispatch(deleteManyCategories(ids)).unwrap();
      toast.success(
        `${ids.length} ${
          ids.length === 1 ? "category" : "categories"
        } deleted successfully`
      );
      // Note: deleteManyCategories thunk automatically refetches data
    } catch (error) {
      console.error("Failed to delete categories:", error);
      // Error toast is handled by the error useEffect above, but we show a specific message for bulk delete
      toast.error("Failed to delete selected categories");
    }
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

          <DataTable<Category>
            // Server-side specific props
            serverSide={true}
            data={categories || []}
            pagination={pagination}
            loading={loading}
            onQueryParamsChange={handleQueryParamsChange}
            currentQueryParams={currentQueryParams}
            error={error}
            // Table configuration
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
                  // Handle the category update by extracting ID and calling update handler
                  const id = updatedData._id;
                  const {
                    _id,
                    createdAt,
                    productCount,
                    ...categoryUpdateData
                  } = updatedData;
                  handleUpdateCategory(id, categoryUpdateData);
                },
                isUpdating // Pass the loading state
              )
            }
            // Row action handlers
            onRowDelete={handleDeleteCategory}
            isDeleting={isDeleting}
            onBulkDelete={handleBulkDeleteCategories}
            isBulkDeleting={isDeletingMany}
            // Table features configuration
            enableRowSelection={true}
            enableGlobalFilter={true}
            enableColumnFilter={false} // Disable simple column filter since we're using search
            enableAdvancedFilter={true}
            advancedFilterConfig={advancedFilterConfig}
            enableDragAndDrop={true} // Disable drag and drop for server-side tables
            // Set page size for initial load
            pageSize={10}
          />
        </div>
      </div>
    </div>
  );
}
