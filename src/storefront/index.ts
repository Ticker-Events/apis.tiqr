import type { ApisHttpClient } from "../client/http-client.js";
import type { ApisResult } from "../client/types.js";
import type {
  TCart,
  TCategory,
  TListResponse,
  TOrder,
  TProduct,
  TProductDetails,
  TProductOption,
  TSortOptionsKey,
  TStore,
} from "types.tiqr";

const ORDER_SORT_PARAMS: Record<string, string> = {
  oldest_first: "created_at",
  newest_first: "-created_at",
};

/**
 * Storefront store endpoints.
 * @group storefront
 */
export const createStorefrontStoresApi = (http: ApisHttpClient) => ({
  /**
   * Get public store details.
   * @endpoint GET service/buyer/store/{storeId}
   * @auth None
   */
  get: (storeId: number | string): Promise<ApisResult<TStore>> =>
    http.request<TStore>(`service/buyer/store/${storeId}`, {
      auth: false,
      endpoint: "storefront.stores.get",
      group: "storefront",
    }),
});

/**
 * Storefront category endpoints.
 * @group storefront
 */
export const createStorefrontCategoriesApi = (http: ApisHttpClient) => ({
  /**
   * List categories for a store.
   * @endpoint GET service/buyer/store/{storeId}/category/
   * @auth None
   */
  list: ({
    storeId,
    limit,
    offset = 0,
  }: {
    storeId: number | string;
    limit?: number;
    offset?: number;
  }): Promise<ApisResult<TListResponse<TCategory>>> =>
    http.request<TListResponse<TCategory>>(
      `service/buyer/store/${storeId}/category/?limit=${limit ?? http.pageSize}&offset=${offset}`,
      {
        auth: false,
        endpoint: "storefront.categories.list",
        group: "storefront",
      },
    ),
});

/**
 * Storefront product catalog endpoints.
 * @group storefront
 */
export const createStorefrontProductsApi = (http: ApisHttpClient) => ({
  /**
   * List products for a store, optionally filtered by category.
   * @endpoint GET service/buyer/product/?store_id=&category_id=
   * @auth None
   */
  list: ({
    storeId,
    categoryId,
    limit,
    offset = 0,
  }: {
    storeId: number;
    categoryId?: number;
    limit?: number;
    offset?: number;
  }): Promise<ApisResult<TListResponse<TProduct>>> => {
    const queryParams = new URLSearchParams({
      store_id: String(storeId),
      limit: String(limit ?? http.pageSize),
      offset: String(offset),
    });
    if (categoryId !== undefined) {
      queryParams.set("category_id", String(categoryId));
    }
    return http.request<TListResponse<TProduct>>(
      `service/buyer/product/?${queryParams.toString()}`,
      {
        auth: false,
        endpoint: "storefront.products.list",
        group: "storefront",
      },
    );
  },

  /**
   * Get product details.
   * @endpoint GET service/buyer/product/{productId}
   * @auth None
   */
  get: (productId: number | string): Promise<ApisResult<TProductDetails>> =>
    http.request<TProductDetails>(`service/buyer/product/${productId}`, {
      auth: false,
      endpoint: "storefront.products.get",
      group: "storefront",
    }),
});

/**
 * Storefront product option endpoints.
 * @group storefront
 */
export const createStorefrontProductOptionsApi = (http: ApisHttpClient) => ({
  /**
   * Get a product option by ID.
   * @endpoint GET service/buyer/product-option/{optionId}
   * @auth None
   */
  get: (optionId: number | string): Promise<ApisResult<TProductOption>> =>
    http.request<TProductOption>(`service/buyer/product-option/${optionId}`, {
      auth: false,
      endpoint: "storefront.productOptions.get",
      group: "storefront",
    }),
});

/**
 * Storefront cart endpoints.
 * @group storefront
 */
export const createStorefrontCartApi = (http: ApisHttpClient) => ({
  /**
   * Get the authenticated buyer's cart.
   * @endpoint GET service/buyer/cart/
   * @auth Required
   */
  get: (): Promise<ApisResult<TCart>> =>
    http.request<TCart>("service/buyer/cart/", {
      endpoint: "storefront.cart.get",
      group: "storefront",
    }),

  /**
   * Add an item to the cart.
   * @endpoint POST service/buyer/cart/
   * @auth Required
   */
  addItem: (payload: unknown): Promise<ApisResult<unknown>> =>
    http.request("service/buyer/cart/", {
      method: "POST",
      body: payload,
      endpoint: "storefront.cart.addItem",
      group: "storefront",
    }),

  /**
   * Remove items from the cart.
   * @endpoint POST service/buyer/cart/
   * @auth Required
   */
  removeItems: (cartItems: unknown[]): Promise<ApisResult<unknown>> =>
    http.request("service/buyer/cart/", {
      method: "POST",
      body: { cart_items: cartItems },
      endpoint: "storefront.cart.removeItems",
      group: "storefront",
    }),

  /**
   * Checkout the cart.
   * @endpoint POST service/buyer/cart/checkout
   * @auth Required
   */
  checkout: (payload: unknown): Promise<ApisResult<unknown>> =>
    http.request("service/buyer/cart/checkout", {
      method: "POST",
      body: payload,
      endpoint: "storefront.cart.checkout",
      group: "storefront",
    }),
});

/**
 * Storefront order endpoints.
 * @group storefront
 */
export const createStorefrontOrdersApi = (http: ApisHttpClient) => ({
  /**
   * List buyer orders with optional filters.
   * @endpoint GET service/buyer/order/
   * @auth Required
   */
  list: ({
    filters = {},
    sortBy = "newest_first",
    offset = 0,
    limit,
  }: {
    filters?: Record<string, string[]>;
    sortBy?: TSortOptionsKey | string;
    offset?: number;
    limit?: number;
  } = {}): Promise<ApisResult<TListResponse<TOrder>>> => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, values]) => {
      queryParams.append(key, values.join(","));
    });
    const sortParam = ORDER_SORT_PARAMS[sortBy] ?? ORDER_SORT_PARAMS.newest_first;
    const qs = `${queryParams.toString()}&limit=${limit ?? http.pageSize}&offset=${offset}&sort_by=${sortParam}`;
    return http.request<TListResponse<TOrder>>(`service/buyer/order/?${qs}`, {
      endpoint: "storefront.orders.list",
      group: "storefront",
    });
  },

  /**
   * Get order details by UUID (public).
   * @endpoint GET service/buyer/order/{uuid}/
   * @auth None
   */
  get: (uuid: string): Promise<ApisResult<TOrder>> =>
    http.request<TOrder>(`service/buyer/order/${uuid}/`, {
      auth: false,
      cache: "no-store",
      endpoint: "storefront.orders.get",
      group: "storefront",
    }),

  /**
   * Create a new order.
   * @endpoint POST service/buyer/order/
   * @auth Optional
   */
  create: (
    payload: unknown,
    { authenticated = true }: { authenticated?: boolean } = {},
  ): Promise<ApisResult<unknown>> =>
    http.request("service/buyer/order/", {
      method: "POST",
      body: payload,
      auth: authenticated,
      endpoint: "storefront.orders.create",
      group: "storefront",
    }),

  /**
   * Update an order.
   * @endpoint PATCH service/buyer/order/{uuid}/
   * @auth Required
   */
  update: (uuid: string, payload: unknown): Promise<ApisResult<TOrder>> =>
    http.request<TOrder>(`service/buyer/order/${uuid}/`, {
      method: "PATCH",
      body: payload,
      endpoint: "storefront.orders.update",
      group: "storefront",
    }),

  /**
   * Retry payment for an order.
   * @endpoint POST service/buyer/order/{uuid}/retry-payment/
   * @auth Required
   */
  retryPayment: (uuid: string): Promise<ApisResult<unknown>> =>
    http.request(`service/buyer/order/${uuid}/retry-payment/`, {
      method: "POST",
      body: {},
      endpoint: "storefront.orders.retryPayment",
      group: "storefront",
    }),
});

/**
 * Storefront appointment endpoints.
 * @group storefront
 */
export const createStorefrontAppointmentsApi = (http: ApisHttpClient) => ({
  /**
   * Get available slots for a month.
   * @endpoint GET service/buyer/store/{id}/availability/available-slots/?month&year
   * @auth None
   */
  getMonthlySlots: (
    storeId: number | string,
    month: string | number,
    year: string | number,
  ): Promise<ApisResult<unknown>> =>
    http.request(
      `service/buyer/store/${storeId}/availability/available-slots/?month=${month}&year=${year}`,
      {
        auth: false,
        endpoint: "storefront.appointments.getMonthlySlots",
        group: "storefront",
      },
    ),

  /**
   * Get available slots for a date range.
   * @endpoint GET service/buyer/store/{id}/availability/available-slots/?start_date&end_date
   * @auth None
   */
  getPeriodSlots: (
    storeId: number | string,
    startDate: string,
    endDate: string,
  ): Promise<ApisResult<unknown>> =>
    http.request(
      `service/buyer/store/${storeId}/availability/available-slots/?start_date=${startDate}&end_date=${endDate}`,
      {
        auth: false,
        endpoint: "storefront.appointments.getPeriodSlots",
        group: "storefront",
      },
    ),

  /**
   * Submit an appointment slot enquiry.
   * @endpoint POST service/buyer/store/{id}/availability/enquiry-slot/
   * @auth None
   */
  enquireSlot: (storeId: number | string, payload: unknown): Promise<ApisResult<unknown>> =>
    http.request(`service/buyer/store/${storeId}/availability/enquiry-slot/`, {
      method: "POST",
      body: payload,
      auth: false,
      endpoint: "storefront.appointments.enquireSlot",
      group: "storefront",
    }),
});

export const createStorefrontApi = (http: ApisHttpClient) => ({
  stores: createStorefrontStoresApi(http),
  categories: createStorefrontCategoriesApi(http),
  products: createStorefrontProductsApi(http),
  productOptions: createStorefrontProductOptionsApi(http),
  cart: createStorefrontCartApi(http),
  orders: createStorefrontOrdersApi(http),
  appointments: createStorefrontAppointmentsApi(http),
});
