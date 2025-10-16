import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { toast } from "sonner";
import {
  DataTable,
  type ServerQueryParams,
} from "../../components/admin/global/data-table";
import { createEditProductDialog, ProductDialog } from "../../components/admin/global/ProductDialog";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteManyProducts,
  clearError,
  setQueryParams,
  type CreateProductData,
  type UpdateProductData,
} from "../../features/products/productsSlice";
import { useTranslation } from 'react-i18next';

// Define the Product entity type to match backend response
export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  priceAfterDiscount?: number;
  mainImage: string;
  images?: string[];
  colors?: string[];
  quantity: number;
  sold: number;
  category: {
    _id: string;
    name: string;
  };
  subCategory?: {
    _id: string;
    name: string;
  };
  brand?: {
    _id: string;
    name: string;
  };
  rating?: number;
  ratingsQuantity: number;
  createdAt: string;
  updatedAt?: string;
}

export default function Products() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Define columns specific to Products
  const productsColumns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: t('products.columns.product'),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={product.mainImage}
                alt={product.name}
              />
              <AvatarFallback>
                {product.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                {t('products.sku')}: {product.slug}
              </p>
            </div>
          </div>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "category",
      header: t('products.columns.category'),
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.category?.name || t('products.notAvailable')}
        </Badge>
      ),
    },
    {
      accessorKey: "subcategory",
      header: t('products.columns.subcategory'),
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.subCategory?.name || t('products.notAvailable')}
        </Badge>
      ),
    },
    {
      accessorKey: "brand",
      header: t('products.columns.brand'),
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.brand?.name || t('products.notAvailable')}
        </Badge>
      ),
    },
    {
      accessorKey: "price",
      header: t('products.columns.price'),
      cell: ({ row }) => {
        const price = row.getValue("price") as number;
        return `$${price.toFixed(2)}`;
      },
    },
    {
      accessorKey: "sold",
      header: t('products.columns.sold'),
      cell: ({ row }) => {
        const sold = row.original.sold;
        return (
          <div className="text-center font-medium">
            {sold}
          </div>
        );
      },
    },
    {
      accessorKey: "quantity",
      header: t('products.columns.stock'),
      cell: ({ row }) => {
        const stock = row.original.quantity;
        const getStatusColor = (stock: number) => {
          if (stock === 0) return "destructive";
          if (stock < 10) return "secondary";
          return "default";
        };
        return (
          <Badge variant={getStatusColor(stock)}>
            {stock}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: t('products.columns.created'),
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return (
          <div className="text-sm">
            {date.toLocaleDateString()}
          </div>
        );
      },
    },
  ];

  // Advanced filter configuration for products
  const advancedFilterConfig = {
    numeric: {
      price: {
        label: t('products.filters.price'),
        placeholder: t('products.filters.pricePlaceholder'),
      },
      quantity: {
        label: t('products.filters.stock'),
        placeholder: t('products.filters.stockPlaceholder'),
      },
    },
    date: {
      createdAt: {
        label: t('products.filters.createdDate'),
      },
    },
  };

  const {
    products,
    pagination,
    loading,
    error,
    isCreating,
    isUpdating,
    isDeleting,
    isDeletingMany,
    currentQueryParams,
  } = useAppSelector((state) => state.products);

  // Load initial data on component mount
  React.useEffect(() => {
    // Load products with default parameters on mount
    const initialParams: ServerQueryParams = {
      page: 1,
      limit: 10,
    };
    dispatch(fetchProducts(initialParams));
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
      dispatch(fetchProducts(params));
    },
    [dispatch]
  );

  // Handle adding new product
  const handleAddProduct = async (productData: {
    name: string;
    description: string;
    price: number;
    priceAfterDiscount?: number;
    mainImage?: File;
    images?: File[];
    colors?: string[];
    quantity: number;
    category: string;
    subCategories?: string[];
    brand?: string;
  }) => {
    try {
      await dispatch(
        createProduct(productData as CreateProductData)
      ).unwrap();
      toast.success(t('products.toasts.addSuccess'));
      // Note: createProduct thunk automatically refetches data
    } catch (error) {
      console.error("Failed to add product:", error);
      // Error toast is handled by the error useEffect above
    }
  };

  // Handle updating existing product
  const handleUpdateProduct = async (
    id: string,
    productData: {
      name?: string;
      description?: string;
      price?: number;
      priceAfterDiscount?: number;
      mainImage?: File;
      images?: File[];
      colors?: string[];
      quantity?: number;
      category?: string;
      subCategory?: string;
      brand?: string;
    }
  ) => {
    try {
      await dispatch(
        updateProduct({ id, productData: productData as UpdateProductData })
      ).unwrap();
      toast.success(t('products.toasts.updateSuccess'));
      // Note: updateProduct thunk automatically refetches data
    } catch (error) {
      console.error("Failed to update product:", error);
      // Error toast is handled by the error useEffect above
    }
  };

  // Handle single product delete
  const handleDeleteProduct = async (id: string) => {
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success(t('products.toasts.deleteSuccess'));
      // Note: deleteProduct thunk automatically refetches data
    } catch (error) {
      console.error("Failed to delete product:", error);
      // Error toast is handled by the error useEffect above
    }
  };

  // Handle bulk product delete
  const handleBulkDeleteProducts = async (ids: string[]) => {
    try {
      await dispatch(deleteManyProducts(ids)).unwrap();
      toast.success(
        t('products.toasts.bulkDeleteSuccess', { 
          count: ids.length,
          product: t(ids.length === 1 ? 'products.productSingular' : 'products.productPlural')
        })
      );
      // Note: deleteManyProducts thunk automatically refetches data
    } catch (error) {
      console.error("Failed to delete products:", error);
      // Error toast is handled by the error useEffect above, but we show a specific message for bulk delete
      toast.error(t('products.toasts.bulkDeleteError'));
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-semibold">{t('products.title')}</h1>
            <p className="text-muted-foreground">
              {t('products.subtitle')}
            </p>
          </div>

          <DataTable<Product>
            serverSide={true}
            data={products || []}
            pagination={pagination}
            loading={loading}
            onQueryParamsChange={handleQueryParamsChange}
            currentQueryParams={currentQueryParams}
            error={error}
            columns={productsColumns}
            dialogComponent={
              <ProductDialog onSubmit={handleAddProduct} isSubmitting={isCreating} />
            }
            editDialogComponent={(rowData: Product) =>
              createEditProductDialog(
                rowData,
                (updatedData) => {
                  const id = rowData._id;
                  const {
                    _id,
                    slug,
                    createdAt,
                    updatedAt,
                    sold,
                    rating,
                    ratingsQuantity,
                    ...productUpdateData
                  } = updatedData;
                  handleUpdateProduct(id, productUpdateData);
                },
                isUpdating
              )
            }
            onRowDelete={handleDeleteProduct}
            isDeleting={isDeleting}
            onBulkDelete={handleBulkDeleteProducts}
            isBulkDeleting={isDeletingMany}
            enableRowSelection={true}
            enableGlobalFilter={true}
            enableColumnFilter={false}
            enableAdvancedFilter={true}
            advancedFilterConfig={advancedFilterConfig}
            enableDragAndDrop={false}
            pageSize={10}
          />
        </div>
      </div>
    </div>
  );
}