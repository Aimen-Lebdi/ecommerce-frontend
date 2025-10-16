import * as React from "react";
import { useTranslation } from 'react-i18next';
import { type ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import {
  BrandDialog,
  createEditBrandDialog,
} from "../../components/admin/global/BrandDialog";
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
  fetchBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  deleteManyBrands,
  clearError,
  setQueryParams,
  type CreateBrandData,
  type UpdateBrandData,
} from "../../features/brands/brandsSlice";

// Define the Brand entity type to match backend response
export interface Brand {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  createdAt: string;
  productCount?: number;
}

// Define columns specific to Brands
const brandsColumns: ColumnDef<Brand>[] = [
  {
    accessorKey: "name",
    header: () => {
      const { t } = useTranslation();
      return t('brands.table.headers.brand');
    },
    cell: ({ row }) => {
      const brand = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-md">
            <AvatarImage src={brand.image} alt={brand.name} />
            <AvatarFallback className="text-xs rounded-md">
              {brand.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{brand.name}</div>
          </div>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "productCount",
    header: () => {
      const { t } = useTranslation();
      return t('brands.table.headers.products');
    },
    cell: ({ row }) => {
      const count = row.original.productCount || 0;
      return (
        <div className="text-start font-medium">{count.toLocaleString()}</div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => {
      const { t } = useTranslation();
      return t('brands.table.headers.created');
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="text-muted-foreground">{date.toLocaleDateString()}</div>
      );
    },
  },
];

// Advanced filter configuration for brands
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

export default function Brands() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const {
    brands,
    pagination,
    loading,
    error,
    isCreating,
    isUpdating,
    isDeleting,
    isDeletingMany,
    currentQueryParams,
  } = useAppSelector((state) => state.brands);

  // Load initial data on component mount
  React.useEffect(() => {
    // Load brands with default parameters on mount
    const initialParams: ServerQueryParams = {
      page: 1,
      limit: 10,
    };
    dispatch(fetchBrands(initialParams));
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
      dispatch(fetchBrands(params));
    },
    [dispatch]
  );

  // Handle adding new brand
  const handleAddBrand = async (brandData: {
    name: string;
    image?: File;
  }) => {
    try {
      await dispatch(
        createBrand(brandData as CreateBrandData)
      ).unwrap();
      toast.success(t('brands.messages.addSuccess'));
      // Note: createBrand thunk automatically refetches data
    } catch (error) {
      console.error("Failed to add brand:", error);
      // Error toast is handled by the error useEffect above
    }
  };

  // Handle updating existing brand
  const handleUpdateBrand = async (
    id: string,
    brandData: { name?: string; image?: File }
  ) => {
    try {
      await dispatch(
        updateBrand({ id, brandData: brandData as UpdateBrandData })
      ).unwrap();
      toast.success(t('brands.messages.updateSuccess'));
      // Note: updateBrand thunk automatically refetches data
    } catch (error) {
      console.error("Failed to update brand:", error);
      // Error toast is handled by the error useEffect above
    }
  };

  // Handle single brand delete
  const handleDeleteBrand = async (id: string) => {
    try {
      await dispatch(deleteBrand(id)).unwrap();
      toast.success(t('brands.messages.deleteSuccess'));
      // Note: deleteBrand thunk automatically refetches data
    } catch (error) {
      console.error("Failed to delete brand:", error);
      // Error toast is handled by the error useEffect above
    }
  };

  // Handle bulk brand delete
  const handleBulkDeleteBrands = async (ids: string[]) => {
    try {
      await dispatch(deleteManyBrands(ids)).unwrap();
      toast.success(
        t('brands.messages.bulkDeleteSuccess', { count: ids.length })
      );
      // Note: deleteManyBrands thunk automatically refetches data
    } catch (error) {
      console.error("Failed to delete brands:", error);
      // Error toast is handled by the error useEffect above, but we show a specific message for bulk delete
      toast.error(t('brands.messages.bulkDeleteError'));
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-semibold">{t('brands.title')}</h1>
            <p className="text-muted-foreground">
              {t('brands.description')}
            </p>
          </div>

          <DataTable<Brand>
            // Server-side specific props
            serverSide={true}
            data={brands || []}
            pagination={pagination}
            loading={loading}
            onQueryParamsChange={handleQueryParamsChange}
            currentQueryParams={currentQueryParams}
            error={error}
            // Table configuration
            columns={brandsColumns}
            dialogComponent={
              <BrandDialog
                mode="add"
                onSave={handleAddBrand}
                isLoading={isCreating}
              />
            }
            editDialogComponent={(rowData: Brand) =>
              createEditBrandDialog(
                rowData,
                (updatedData) => {
                  // Handle the brand update by extracting ID and calling update handler
                  const id = rowData._id;
                  const {
                    _id,
                    createdAt,
                    productCount,
                    ...brandUpdateData
                  } = updatedData;
                  handleUpdateBrand(id, brandUpdateData);
                },
                isUpdating // Pass the loading state
              )
            }
            // Row action handlers
            onRowDelete={handleDeleteBrand}
            isDeleting={isDeleting}
            onBulkDelete={handleBulkDeleteBrands}
            isBulkDeleting={isDeletingMany}
            // Table features configuration
            enableRowSelection={true}
            enableGlobalFilter={true}
            enableColumnFilter={false} // Disable simple column filter since we're using search
            enableAdvancedFilter={true}
            advancedFilterConfig={advancedFilterConfig}
            enableDragAndDrop={true} // Enable drag and drop for server-side tables
            // Set page size for initial load
            pageSize={10}
          />
        </div>
      </div>
    </div>
  );
}