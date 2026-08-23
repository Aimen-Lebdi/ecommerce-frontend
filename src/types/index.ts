/**
 * Shared TypeScript types for the My-Ecommerce frontend.
 *
 * Purpose:
 * - Canonical PaginationMeta (previously duplicated in every slice)
 * - Base query params interface for paginated list endpoints
 * - Re-exports of every entity type so consumers can import from one place
 *
 * ⚠️  The authoritative definition for each entity still lives in its
 *     feature API/slice file.  This barrel re-exports them for convenience
 *     and adds types that span multiple features.
 */

// ─── Pagination ───────────────────────────────────────────────────────────────

/** Metadata returned by every paginated list endpoint. */
export interface PaginationMeta {
  currentPage: number;
  limit: number;
  numberOfPages: number;
  nextPage?: number;
  previousPage?: number;
  totalResults: number;
}

// ─── Query Parameters ─────────────────────────────────────────────────────────

/** Base query params shared by every paginated list endpoint. */
export interface BaseQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  keyword?: string;
  fields?: string;
  [key: string]: unknown;
}

/** Products list query params (adds filter fields). */
export interface ProductsQueryParams extends BaseQueryParams {
  category?: string;
  subCategory?: string;
  brand?: string;
  "price[gte]"?: number;
  "price[lte]"?: number;
  "quantity[gt]"?: number;
}

/** Categories list query params. */
export type CategoriesQueryParams = BaseQueryParams;

/** SubCategories list query params (adds category filter). */
export interface SubCategoriesQueryParams extends BaseQueryParams {
  category?: string;
}

/** Brands list query params. */
export type BrandsQueryParams = BaseQueryParams;

/** Orders list query params (adds status filters). */
export interface OrdersQueryParams extends BaseQueryParams {
  deliveryStatus?: string;
  paymentStatus?: string;
  paymentMethodType?: string;
}

/** Users list query params (adds role/status filters). */
export interface UsersQueryParams extends BaseQueryParams {
  role?: string;
  status?: string;
}

/** Activities list query params (adds type/timeframe filters). */
export interface ActivitiesQueryParams extends BaseQueryParams {
  type?: string;
  timeframe?: string;
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

/** Generic paginated response shape from the backend. */
export interface PaginatedResponse<T> {
  result: number;
  pagination: {
    currentPage: number;
    limit: number;
    numberOfPages: number;
    nextPage?: number;
    previousPage?: number;
  };
  documents: T[];
}

/** Generic wrapped-data response. */
export interface DataResponse<T> {
  status: string;
  data: T;
  message?: string;
}

// ─── Entity Types ─────────────────────────────────────────────────────────────
//
// Canonical definitions — these match the Mongoose schemas exactly.
// Feature slices re-export their own copies; these are the "single source
// of truth" that new code should prefer importing from `@/types`.

/** MongoDB ObjectId string. */
export type ObjectId = string;

// ── Product ───────────────────────────────────────────────────────────────────

export interface Product {
  _id: ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  mainImage: string;
  images?: string[];
  colors?: string[];
  quantity: number;
  sold: number;
  category: {
    _id: ObjectId;
    name: string;
  };
  subCategory?:
    | {
        _id: ObjectId;
        name: string;
      }
    | null;
  brand?:
    | {
        _id: ObjectId;
        name: string;
      }
    | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  mainImage?: File;
  images?: File[];
  colors?: string[];
  quantity: number;
  category: string;
  subCategory?: string;
  brand?: string;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  mainImage?: File;
  /** null clears the gallery on the server. */
  images?: File[] | null;
  colors?: string[];
  quantity?: number;
  category?: string;
  /** null detaches the subcategory on the server. */
  subCategory?: string | null;
  /** null detaches the brand on the server. */
  brand?: string | null;
}

// ── Category ──────────────────────────────────────────────────────────────────

export interface Category {
  _id: ObjectId;
  name: string;
  slug: string;
  image?: string;
  productCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCategoryData {
  name: string;
  image?: File;
}

export interface UpdateCategoryData {
  name?: string;
  image?: File | null;
}

// ── SubCategory ───────────────────────────────────────────────────────────────

export interface SubCategory {
  _id: ObjectId;
  name: string;
  slug: string;
  image?: string;
  category:
    | {
        _id: ObjectId;
        name: string;
      }
    | string;
  productCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSubCategoryData {
  name: string;
  category: string;
  image?: File;
}

export interface UpdateSubCategoryData {
  name?: string;
  category?: string;
  image?: File;
}

// ── Brand ─────────────────────────────────────────────────────────────────────

export interface Brand {
  _id: ObjectId;
  name: string;
  slug: string;
  image?: string;
  productCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateBrandData {
  name: string;
  image?: File;
}

export interface UpdateBrandData {
  name?: string;
  image?: File;
}

// ── User ──────────────────────────────────────────────────────────────────────

export type UserRole = "admin" | "user";

export interface User {
  _id: ObjectId;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  image?: string;
  createdAt: string;
  updatedAt?: string;
  phone?: string;
  addresses?: Address[];
  phones?: Phone[];
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  image?: File;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: UserRole;
  image?: File | null;
}

export interface UpdateUserPasswordData {
  currentPassword: string;
  password: string;
  passwordConfirm: string;
}

// ── Order ─────────────────────────────────────────────────────────────────────

export type DeliveryStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "failed"
  | "returned"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "failed"
  | "confirmed"
  | "refunded"
  | "partially_refunded"
  | "completed"
  | "cancelled";

export type PaymentMethodType = "card" | "cash";

export interface OrderCartItem {
  _id: ObjectId;
  product: {
    _id: ObjectId;
    name: string;
    mainImage?: string;
  };
  quantity: number;
  color?: string;
  price: number;
}

export interface Order {
  _id: ObjectId;
  user: {
    _id: ObjectId;
    name: string;
    email: string;
    phone?: string;
    image?: string;
  };
  cartItems: OrderCartItem[];
  taxPrice: number;
  shippingAddress: {
    baladiya: string;
    phone: string;
    dayra: string;
    wilaya: string;
  };
  shippingPrice: number;
  totalOrderPrice: number;
  paymentMethodType: PaymentMethodType;
  deliveryStatus: DeliveryStatus;
  paymentStatus: PaymentStatus;
  trackingNumber?: string;
  codAmount?: number;
  statusHistory: StatusHistoryEntry[];
  deliveryAgency?: {
    name: string;
    apiResponse?: unknown;
  };
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StatusHistoryEntry {
  status: string;
  timestamp: Date;
  note: string;
  updatedBy: string;
}

export interface CreateCashOrderData {
  shippingAddress: {
    baladiya: string;
    phone: string;
    dayra: string;
    wilaya: string;
  };
}

export interface UpdateOrderPayload {
  deliveryStatus?: DeliveryStatus;
  shippingAddress?: {
    wilaya: string;
    dayra: string;
    baladiya: string;
    phone: string;
  };
  cartItems?: Array<{
    _id: ObjectId;
    quantity: number;
    color?: string;
  }>;
  shippingPrice?: number;
  trackingNumber?: string;
}

export interface TrackingInfo {
  order: {
    _id: ObjectId;
    orderNumber: string;
    deliveryStatus: string;
    trackingNumber?: string;
    isPaid: boolean;
    isDelivered: boolean;
    totalOrderPrice: number;
    statusHistory: StatusHistoryEntry[];
  };
  tracking?: unknown;
}

// ── Cart ──────────────────────────────────────────────────────────────────────

export interface CartItem {
  _id: ObjectId;
  product: {
    _id: ObjectId;
    name: string;
    mainImage: string;
    brand?: { name: string };
  };
  quantity: number;
  color: string;
  price: number;
}

export interface CartResponse {
  status: string;
  numOfCartItems: number;
  data: {
    _id: ObjectId;
    cartItems: CartItem[];
    totalCartPrice: number;
    user: string;
    createdAt: string;
    updatedAt: string;
  };
  message?: string;
}

// ── Wishlist ──────────────────────────────────────────────────────────────────

export interface WishlistProduct {
  _id: ObjectId;
  name: string;
  mainImage: string;
  price: number;
  quantity: number;
  brand?: { name: string };
  category?: { name: string };
  colors?: string[];
}

export interface WishlistResponse {
  status: string;
  results: number;
  data: WishlistProduct[];
  message?: string;
}

// ── Address ───────────────────────────────────────────────────────────────────

export interface Address {
  _id: ObjectId;
  label: string;
  wilaya: string;
  dayra: string;
  baladiya: string;
  isDefault: boolean;
}

export interface AddAddressData {
  label: string;
  wilaya: string;
  dayra: string;
  baladiya: string;
}

export interface UpdateAddressData {
  addressId: string;
  label?: string;
  wilaya?: string;
  dayra?: string;
  baladiya?: string;
  isDefault?: boolean;
}

export interface AddressResponse {
  status: string;
  results?: number;
  data: Address[];
  message?: string;
}

// ── Phone ─────────────────────────────────────────────────────────────────────

export interface Phone {
  _id: ObjectId;
  label: string;
  phone: string;
  isDefault: boolean;
}

export interface AddPhoneData {
  phone: string;
  label: string;
}

export interface UpdatePhoneData {
  phoneId: string;
  phone?: string;
  label?: string;
  isDefault?: boolean;
}

export interface PhoneResponse {
  status: string;
  results?: number;
  data: Phone[];
  message?: string;
}

// ── Activity ──────────────────────────────────────────────────────────────────

/** Shape of the `metadata` field on Activity documents. */
export interface ActivityMetadata {
  orderShortId?: string;
  customerName?: string;
  paymentMethod?: string;
  productTitle?: string;
  targetUserEmail?: string;
  ipAddress?: string;
  quantityBefore?: number;
  quantityAfter?: number;
  itemsCount?: number;
  [key: string]: unknown;
}

export interface Activity {
  _id: ObjectId;
  type: string;
  activity: string;
  user: {
    name: string;
    id: string;
    role: string;
  };
  description: string;
  status: "success" | "failed" | "pending";
  amount?: number;
  relatedId: string;
  relatedModel: string;
  metadata: ActivityMetadata;
  createdAt: string;
  updatedAt?: string;
}

export interface ActivityStats {
  timeframe: string;
  totalActivities: number;
  typeStats: Array<{ _id: string; count: number }>;
  dailyStats: Array<{ _id: string; count: number }>;
  statusStats?: Array<{ _id: string; count: number }>;
  failureRate?: number;
}

// ── Analytics ─────────────────────────────────────────────────────────────────

export interface DateRange {
  startDate?: string;
  endDate?: string;
}

export interface DashboardCard {
  total: number;
  percentageChange: number | null;
  trend: "up" | "down" | "neutral";
}

export interface TopProductCard extends DashboardCard {
  productId?: string;
  name: string;
  totalQuantity?: number;
  totalRevenue?: number;
}

export interface BestOrder {
  id: string;
  customer: string;
  total: string;
  date: string;
}

export interface TopCustomer {
  name: string;
  products: number;
  revenue: string;
}

export interface BestProduct {
  name: string;
  sold: number;
  revenue: string;
}

export interface GrowthRateData {
  date: string;
  desktop: number;
}

export interface StatusBucket {
  key: "inProgress" | "completed" | "failedReturned" | "cancelled";
  count: number;
  revenue: number;
}

export interface OrderStatusBreakdown {
  totalOrders: number;
  buckets: StatusBucket[];
}

export interface PaymentMethodItem {
  key: "card" | "cash";
  count: number;
  revenue: number;
}

export interface PaymentMethodBreakdown {
  card: PaymentMethodItem;
  cash: PaymentMethodItem;
}

export interface LowStockProduct {
  id: string;
  name: string;
  quantity: number;
  sold: number;
  price: number;
  category: string | null;
}

export interface SalesByItem {
  name: string;
  value: number;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface SignInData {
  email: string;
  password: string;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface AuthResponse {
  data: User;
  accessToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ForgotPasswordResponse {
  status: string;
  message: string;
}

export interface VerifyResetCodeData {
  resetCode: string;
}

export interface VerifyResetCodeResponse {
  status: string;
}

export interface ResetPasswordData {
  email: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  accessToken: string;
}
