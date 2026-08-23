import * as React from "react";
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
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
import type { SubCategory } from "../../types";

// Define columns specific to SubCategories (t injected so hooks stay in components)
const getSubCategoriesColumns = (t: TFunction): ColumnDef<SubCategory>[] => [
  {
    accessorKey: "name",
    header: () => t('subCategories.table.headers.subcategory'),
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
    header: () => t('subCategories.table.headers.category'),
    cell: ({ row }) => {
      const category = row.original.category;
      const categoryName = 
        category && typeof category === 'object' 
          ? category.name 
          : t('subCategories.table.unknownCategory');
      return (
        <Badge variant="outline" className="text-muted-foreground">
          {categoryName}
        </Badge>
      );
    },
  },
  {
    accessorKey: "productCount",
    header: () => t('subCategories.table.headers.products'),
    cell: ({ row }) => {
      const count = row.original.productCount || 0;
      return (
        <div className="text-center font-medium">{count.toLocaleString()}</div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => t('subCategories.table.headers.created'),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-muted-foreground">{date.toLocaleDateString()}</div>
      );
    },
  },
];

export default function SubCategories() {
  const { t } = useTranslation();
  const subCategoriesColumns = React.useMemo(
    () => getSubCategoriesColumns(t),
    [t]
  );

  // Advanced filter configuration for subcategories
  const advancedFilterConfig = {
    numeric: {
      productCount: {
        label: t('subCategories.filters.productCount'),
        placeholder: t('subCategories.filters.productCountPlaceholder'),
      },
    },
    date: {
      createdAt: {
        label: t('subCategories.filters.createdDate'),
      },
    },
  };

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
      const isNoResults = /there are no .+ to get/i.test(error);
      if (!isNoResults) {
        toast.error(error);
      }
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
    name?: string;
    category?: string;
    image?: File | null;
  }) => {
    try {
      const payload: CreateSubCategoryData = {
        name: subCategoryData.name ?? '',
        category: subCategoryData.category ?? '',
        image: subCategoryData.image ?? undefined,
      };
      await dispatch(createSubCategory(payload)).unwrap();
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
    subCategoryData: { name?: string; category?: string; image?: File | null }
  ) => {
    try {
      const payload: UpdateSubCategoryData = {
        name: subCategoryData.name,
        category: subCategoryData.category,
        image: subCategoryData.image ?? undefined,
      };
      await dispatch(updateSubCategory({ id, subCategoryData: payload })).unwrap();
      toast.success(t('subCategories.messages.updateSuccess'));
      // Note: updateSubCategory thunk automatically refetches data
    } catch (error) {
      console.error("Failed to update subcategory:", error);
      // Error toast is handled by the error useEffect above
      throw error; // Re-throw so the dialog knows the update failed and stays open
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
                async (updatedData) => {
                  await handleUpdateSubCategory(rowData._id, updatedData);
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