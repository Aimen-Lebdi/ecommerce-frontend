/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/products/productsSlice.ts
import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import {
  fetchProductsAPI,
  fetchProductByIdAPI,
  createProductAPI,
  updateProductAPI,
  deleteProductAPI,
  deleteManyProductsAPI,
  type ProductsQueryParams,
  type ProductsResponse,
} from "./productsAPI";

// Define the Product type to match backend response
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
  } | null;
  brand?: {
    _id: string;
    name: string;
  } | null;
  rating?: number;
  ratingsQuantity: number;
  reviews?: any[];
  createdAt: string;
  updatedAt?: string;
}

// Define interface for creating product
export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  priceAfterDiscount?: number;
  mainImage?: File;
  images?: File[];
  colors?: string[];
  quantity: number;
  category: string;
  subCategory?: string;
  brand?: string;
}

// Define interface for updating product
export interface UpdateProductData {
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

// Pagination metadata interface
export interface PaginationMeta {
  currentPage: number;
  limit: number;
  numberOfPages: number;
  nextPage?: number;
  previousPage?: number;
  totalResults: number;
}

// State interface for products slice
interface ProductsState {
  products: Product[];
  currentProduct: Product | null;
  pagination: PaginationMeta | null;
  loading: boolean;
  loadingProduct: boolean;
  error: string | null;
  productError: string | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isDeletingMany: boolean;
  currentQueryParams: ProductsQueryParams;
}

// Initial state
const initialState: ProductsState = {
  products: [],
  currentProduct: null,
  pagination: null,
  loading: false,
  loadingProduct: false,
  error: null,
  productError: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isDeletingMany: false,
  currentQueryParams: {},
};

// Async thunk to fetch products from backend with query parameters
export const fetchProducts = createAsyncThunk<
  { products: Product[]; pagination: PaginationMeta },
  ProductsQueryParams,
  { rejectValue: { message: string; status?: number } }
>("products/fetchProducts", async (queryParams, { rejectWithValue }) => {
  try {
    const response: ProductsResponse = await fetchProductsAPI(queryParams);
    return {
      products: response.documents,
      pagination: {
        ...response.pagination,
        totalResults: response.result,
      },
    };
  } catch (err: any) {
    const status = err.response?.status;
    const message = err.response?.data?.message || err.message;
    // Handle 404 as a special case - not really an "error" but no results
    if (status === 404) {
      return {
        products: [],
        pagination: {
          currentPage: 1,
          limit: queryParams.limit || 10,
          numberOfPages: 0,
          totalResults: 0,
        },
      };
    }
    return rejectWithValue({ message, status });
  }
});

// Async thunk to fetch single product by ID
export const fetchProductById = createAsyncThunk<
  Product,
  string,
  { rejectValue: string }
>("products/fetchProductById", async (id, { rejectWithValue }) => {
  try {
    const data = await fetchProductByIdAPI(id);
    return data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || err.message || "Failed to fetch product"
    );
  }
});

// Async thunk to create product
export const createProduct = createAsyncThunk<
  Product,
  CreateProductData,
  { rejectValue: string; state: { products: ProductsState } }
>(
  "products/createProduct",
  async (productData, { rejectWithValue, getState, dispatch }) => {
    try {
      const formData = new FormData();
      formData.append("name", productData.name);
      formData.append("description", productData.description);
      formData.append("price", productData.price.toString());
      if (productData.priceAfterDiscount) {
        formData.append(
          "priceAfterDiscount",
          productData.priceAfterDiscount.toString()
        );
      }
      formData.append("quantity", productData.quantity.toString());
      formData.append("category", productData.category);

      if (productData.subCategory) {
        formData.append("subCategory", productData.subCategory);
      }
      if (productData.brand) {
        formData.append("brand", productData.brand);
      }

      if (productData.colors) {
        productData.colors.forEach((color) => {
          formData.append("colors", color);
        });
      }

      if (productData.mainImage) {
        formData.append("mainImage", productData.mainImage);
      }

      if (productData.images) {
        productData.images.forEach((image) => {
          formData.append("images", image);
        });
      }

      const data = await createProductAPI(formData);
      // Refetch products to maintain pagination integrity
      const state = getState();
      dispatch(fetchProducts(state.products.currentQueryParams));
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk to update product
export const updateProduct = createAsyncThunk<
  Product,
  { id: string; productData: UpdateProductData },
  { rejectValue: string; state: { products: ProductsState } }
>(
  "products/updateProduct",
  async ({ id, productData }, { rejectWithValue, getState, dispatch }) => {
    try {
      const formData = new FormData();

      if (productData.name) {
        formData.append("name", productData.name);
      }
      if (productData.description) {
        formData.append("description", productData.description);
      }
      if (productData.price !== undefined) {
        formData.append("price", productData.price.toString());
      }
      if (productData.priceAfterDiscount !== undefined) {
        formData.append(
          "priceAfterDiscount",
          productData.priceAfterDiscount.toString()
        );
      }
      if (productData.quantity !== undefined) {
        formData.append("quantity", productData.quantity.toString());
      }
      if (productData.category) {
        formData.append("category", productData.category);
      }

      if ("subCategory" in productData) {
        if (productData.subCategory === null) {
          formData.append("subCategory", "null");
        } else if (productData.subCategory) {
          formData.append("subCategory", productData.subCategory);
        }
      }

      // Handle brand - include it if it exists in productData (even if null)
      if ("brand" in productData) {
        if (productData.brand === null) {
          formData.append("brand", "null");
        } else if (productData.brand) {
          formData.append("brand", productData.brand);
        }
      }

      if (productData.colors) {
        productData.colors.forEach((color) => {
          formData.append("colors", color);
        });
      }

      if (productData.mainImage) {
        formData.append("mainImage", productData.mainImage);
      }

      if (productData.images) {
        productData.images.forEach((image) => {
          formData.append("images", image);
        });
      }

      const data = await updateProductAPI(id, formData);
      // Refetch to maintain consistency with server-side data
      const state = getState();
      dispatch(fetchProducts(state.products.currentQueryParams));
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk to delete product
export const deleteProduct = createAsyncThunk<
  string,
  string,
  { rejectValue: string; state: { products: ProductsState } }
>(
  "products/deleteProduct",
  async (id, { rejectWithValue, getState, dispatch }) => {
    try {
      await deleteProductAPI(id);
      // Refetch products to maintain pagination integrity
      const state = getState();
      dispatch(fetchProducts(state.products.currentQueryParams));
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async thunk for bulk delete
export const deleteManyProducts = createAsyncThunk<
  string[],
  string[],
  { rejectValue: string; state: { products: ProductsState } }
>(
  "products/deleteManyProducts",
  async (ids, { rejectWithValue, getState, dispatch }) => {
    try {
      await deleteManyProductsAPI(ids);
      // Refetch products to maintain pagination integrity
      const state = getState();
      dispatch(fetchProducts(state.products.currentQueryParams));
      return ids;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Slice with reducers and state management
const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.productError = null;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.productError = null;
    },
    // Action to update current query parameters
    setQueryParams: (state, action: PayloadAction<ProductsQueryParams>) => {
      state.currentQueryParams = action.payload;
    },
    // Action to reset query parameters
    resetQueryParams: (state) => {
      state.currentQueryParams = {};
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        // Store the query parameters used for this fetch
        state.currentQueryParams = action.meta.arg;
      })
      .addCase(
        fetchProducts.fulfilled,
        (
          state,
          action: PayloadAction<{
            products: Product[];
            pagination: PaginationMeta;
          }>
        ) => {
          state.loading = false;
          state.products = action.payload.products;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "An error occurred";
      })
      // Fetch single product
      .addCase(fetchProductById.pending, (state) => {
        state.loadingProduct = true;
        state.productError = null;
        state.currentProduct = null;
      })
      .addCase(
        fetchProductById.fulfilled,
        (state, action: PayloadAction<Product>) => {
          state.loadingProduct = false;
          state.currentProduct = action.payload;
        }
      )
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loadingProduct = false;
        state.productError = action.payload || "Failed to fetch product";
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.isCreating = false;
        // Don't modify products array here since we refetch
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload || "Failed to create product";
      })
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state) => {
        state.isUpdating = false;
        // Don't modify products array here since we refetch
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload || "Failed to update product";
      })
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state) => {
        state.isDeleting = false;
        // Don't modify products array here since we refetch
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload || "Failed to delete product";
      })
      // Bulk delete products
      .addCase(deleteManyProducts.pending, (state) => {
        state.isDeletingMany = true;
        state.error = null;
      })
      .addCase(deleteManyProducts.fulfilled, (state) => {
        state.isDeletingMany = false;
        // Don't modify products array here since we refetch
      })
      .addCase(deleteManyProducts.rejected, (state, action) => {
        state.isDeletingMany = false;
        state.error = action.payload || "Failed to delete products";
      });
  },
});

export const { clearError, clearCurrentProduct, setQueryParams, resetQueryParams } =
  productsSlice.actions;

export default productsSlice.reducer;