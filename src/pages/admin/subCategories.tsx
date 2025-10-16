import * as React from "react";
import { useTranslation } from 'react-i18next';
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import {
  createEditSubCategoryDialog,
  SubCategoryDialog,
} from "../../components/admin/global/SubCategoryDialog";
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
  fetchSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  deleteManySubCategories,
  clearError,
  setQueryParams,
  type CreateSubCategoryData,
  type UpdateSubCategoryData,
} from "../../features/subCategories/subCategoriesSlice";

// Define the SubCategory entity type to match backend response
export interface SubCategory {
  _id: string;
  name: string;
  image?: string;
  category: {
    _id: string;
    name: string;
  } | string; // 
  productCount: number;
  createdAt: string;
}

// Define columns specific to SubCategories
const subCategoriesColumns: ColumnDef<SubCategory>[] = [
  {
    accessorKey: "name",
    header: () => {
      const { t } = useTranslation();
      return t('subCategories.table.headers.subcategory');
    },
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
    accessorKey: "category",
    header: () => {
      const { t } = useTranslation();
      return t('subCategories.table.headers.category');
    },
    cell: ({ row }) => {
      const { t } = useTranslation();
      const category = row.original.category;
      const categoryName = typeof category === 'object' ? category.name : t('subCategories.table.unknownCategory');
      return (
        <Badge variant="outline" className="text-muted-foreground">
          {categoryName}
        </Badge>
      );
    },
  },
  {
    accessorKey: "productCount",
    header: () => {
      const { t } = useTranslation();
      return t('subCategories.table.headers.products');
    },
    cell: ({ row }) => {
      const count = row.original.productCount || 0;
      return (
        <div className="text-center font-medium">{count.toLocaleString()}</div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => {
      const { t } = useTranslation();
      return t('subCategories.table.headers.created');
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-muted-foreground">{date.toLocaleDateString()}</div>
      );
    },
  },
];

// Advanced filter configuration for subcategories
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

export default function SubCategories() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    subcategories,
    pagination,
    loading,
    error,
    isCreating,
    isUpdating,
    isDeleting,
    isDeletingMany,
    currentQueryParams,
  } = useAppSelector((state) => state.subCategories);

  // Load initial data on component mount
  React.useEffect(() => {
    // Load subcategories with default parameters on mount
    const initialParams: ServerQueryParams = {
      page: 1,
      limit: 10,
    };
    dispatch(fetchSubCategories(initialParams));
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
      dispatch(fetchSubCategories(params));
    },
    [dispatch]
  );

  // Handle adding new subcategory
  const handleAddSubCategory = async (subCategoryData: {
    name: string;
    category: string;
    image?: File;
  }) => {
    try {
      await dispatch(
        createSubCategory(subCategoryData as CreateSubCategoryData)
      ).unwrap();
      toast.success(t('subCategories.messages.addSuccess'));
      // Note: createSubCategory thunk automatically refetches data
    } catch (error) {
      console.error("Failed to add subcategory:", error);
      // Error toast is handled by the error useEffect above
    }
  };

  // Handle updating existing subcategory
  const handleUpdateSubCategory = async (
    id: string,
    subCategoryData: { name?: string; category?: string; image?: File }
  ) => {
    try {
      await dispatch(
        updateSubCategory({ id, subCategoryData: subCategoryData as UpdateSubCategoryData })
      ).unwrap();
      toast.success(t('subCategories.messages.updateSuccess'));
      // Note: updateSubCategory thunk automatically refetches data
    } catch (error) {
      console.error("Failed to update subcategory:", error);
      // Error toast is handled by the error useEffect above
    }
  };

  // Handle single subcategory delete
  const handleDeleteSubCategory = async (id: string) => {
    try {
      await dispatch(deleteSubCategory(id)).unwrap();
      toast.success(t('subCategories.messages.deleteSuccess'));
      // Note: deleteSubCategory thunk automatically refetches data
    } catch (error) {
      console.error("Failed to delete subcategory:", error);
      // Error toast is handled by the error useEffect above
    }
  };

  // Handle bulk subcategory delete
  const handleBulkDeleteSubCategories = async (ids: string[]) => {
    try {
      await dispatch(deleteManySubCategories(ids)).unwrap();
      toast.success(
        t('subCategories.messages.bulkDeleteSuccess', { count: ids.length })
      );
      // Note: deleteManySubCategories thunk automatically refetches data
    } catch (error) {
      console.error("Failed to delete subcategories:", error);
      // Error toast is handled by the error useEffect above, but we show a specific message for bulk delete
      toast.error(t('subCategories.messages.bulkDeleteError'));
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-semibold">{t('subCategories.title')}</h1>
            <p className="text-muted-foreground">
              {t('subCategories.description')}
            </p>
          </div>

          <DataTable<SubCategory>
            // Server-side specific props
            serverSide={true}
            data={subcategories || []}
            pagination={pagination}
            loading={loading}
            onQueryParamsChange={handleQueryParamsChange}
            currentQueryParams={currentQueryParams}
            error={error}
            // Table configuration
            columns={subCategoriesColumns}
            dialogComponent={
              <SubCategoryDialog
                mode="add"
                onSave={handleAddSubCategory}
                isLoading={isCreating}
              />
            }
            editDialogComponent={(rowData: SubCategory) =>
              createEditSubCategoryDialog(
                rowData,
                (updatedData) => {
                  // Handle the subcategory update by extracting ID and calling update handler
                  const id = rowData._id;
                  const {
                    _id,
                    createdAt,
                    productCount,
                    ...subCategoryUpdateData
                  } = updatedData;
                  handleUpdateSubCategory(id, subCategoryUpdateData);
                },
                isUpdating // Pass the loading state
              )
            }
            // Row action handlers
            onRowDelete={handleDeleteSubCategory}
            isDeleting={isDeleting}
            onBulkDelete={handleBulkDeleteSubCategories}
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