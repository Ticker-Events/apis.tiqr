import type { ApisHttpClient } from "../client/http-client.js";
import type { ApisResult } from "../client/types.js";
import type {
  TAddon,
  TCategory,
  TListResponse,
  TProduct,
  TProductDetails,
  TProductPayload,
  TStore,
} from "types.tiqr";

const ownerBase = (storeId: number | string) => `service/owner/store/${storeId}`;

/**
 * Admin store settings endpoints.
 * @group admin
 */
export const createAdminStoresApi = (http: ApisHttpClient) => ({
  /**
   * List stores owned by the authenticated user.
   * @endpoint GET service/owner/store/
   * @auth Required
   */
  list: (): Promise<ApisResult<TListResponse<TStore>>> =>
    http.request<TListResponse<TStore>>("service/owner/store/", {
      cache: "no-store",
      endpoint: "admin.stores.list",
      group: "admin",
    }),

  /**
   * Update store settings.
   * @endpoint PATCH service/owner/store/{id}
   * @auth Required
   */
  update: (storeId: number | string, payload: unknown): Promise<ApisResult<TStore>> =>
    http.request<TStore>(`service/owner/store/${storeId}`, {
      method: "PATCH",
      body: payload,
      endpoint: "admin.stores.update",
      group: "admin",
    }),
});

/**
 * Admin product CRUD endpoints.
 * @group admin
 */
export const createAdminProductsApi = (http: ApisHttpClient) => ({
  list: ({
    storeId,
    offset = 0,
    limit,
  }: {
    storeId: number | string;
    offset?: number;
    limit?: number;
  }): Promise<ApisResult<TListResponse<TProduct>>> =>
    http.request<TListResponse<TProduct>>(
      `${ownerBase(storeId)}/product/?limit=${limit ?? http.pageSize}&offset=${offset}`,
      { endpoint: "admin.products.list", group: "admin" },
    ),

  get: ({
    storeId,
    productId,
  }: {
    storeId: number | string;
    productId: number | string;
  }): Promise<ApisResult<TProduct>> =>
    http.request<TProduct>(`${ownerBase(storeId)}/product/${productId}/`, {
      endpoint: "admin.products.get",
      group: "admin",
    }),

  create: ({
    storeId,
    body,
  }: {
    storeId: number | string;
    body: TProductPayload;
  }): Promise<ApisResult<TProduct>> =>
    http.request<TProduct>(`${ownerBase(storeId)}/product/`, {
      method: "POST",
      body,
      endpoint: "admin.products.create",
      group: "admin",
    }),

  update: ({
    storeId,
    productId,
    body,
  }: {
    storeId: number | string;
    productId: number | string;
    body: Partial<TProductPayload>;
  }): Promise<ApisResult<TProduct>> =>
    http.request<TProduct>(`${ownerBase(storeId)}/product/${productId}/`, {
      method: "PATCH",
      body,
      endpoint: "admin.products.update",
      group: "admin",
    }),

  delete: ({
    storeId,
    productId,
  }: {
    storeId: number | string;
    productId: number | string;
  }): Promise<ApisResult<null>> =>
    http.request<null>(`${ownerBase(storeId)}/product/${productId}/`, {
      method: "DELETE",
      endpoint: "admin.products.delete",
      group: "admin",
    }),
});

/**
 * Admin category CRUD endpoints.
 * @group admin
 */
export const createAdminCategoriesApi = (http: ApisHttpClient) => ({
  list: ({
    storeId,
    offset = 0,
    limit,
  }: {
    storeId: number | string;
    offset?: number;
    limit?: number;
  }): Promise<ApisResult<TListResponse<TCategory>>> =>
    http.request<TListResponse<TCategory>>(
      `${ownerBase(storeId)}/category/?limit=${limit ?? http.pageSize}&offset=${offset}`,
      { endpoint: "admin.categories.list", group: "admin" },
    ),

  get: ({
    storeId,
    categoryId,
  }: {
    storeId: number | string;
    categoryId: number | string;
  }): Promise<ApisResult<TCategory>> =>
    http.request<TCategory>(`${ownerBase(storeId)}/category/${categoryId}/`, {
      endpoint: "admin.categories.get",
      group: "admin",
    }),

  create: ({
    storeId,
    body,
  }: {
    storeId: number | string;
    body: unknown;
  }): Promise<ApisResult<TCategory>> =>
    http.request<TCategory>(`${ownerBase(storeId)}/category/`, {
      method: "POST",
      body,
      endpoint: "admin.categories.create",
      group: "admin",
    }),

  update: ({
    storeId,
    categoryId,
    body,
  }: {
    storeId: number | string;
    categoryId: number | string;
    body: unknown;
  }): Promise<ApisResult<TCategory>> =>
    http.request<TCategory>(`${ownerBase(storeId)}/category/${categoryId}/`, {
      method: "PATCH",
      body,
      endpoint: "admin.categories.update",
      group: "admin",
    }),

  delete: ({
    storeId,
    categoryId,
  }: {
    storeId: number | string;
    categoryId: number | string;
  }): Promise<ApisResult<null>> =>
    http.request<null>(`${ownerBase(storeId)}/category/${categoryId}/`, {
      method: "DELETE",
      endpoint: "admin.categories.delete",
      group: "admin",
    }),
});

/**
 * Admin addon CRUD endpoints.
 * @group admin
 */
export const createAdminAddonsApi = (http: ApisHttpClient) => ({
  list: ({
    storeId,
    offset = 0,
    limit,
  }: {
    storeId: number | string;
    offset?: number;
    limit?: number;
  }): Promise<ApisResult<TListResponse<TAddon>>> =>
    http.request<TListResponse<TAddon>>(
      `${ownerBase(storeId)}/addon/?limit=${limit ?? http.pageSize}&offset=${offset}`,
      { endpoint: "admin.addons.list", group: "admin" },
    ),

  get: ({
    storeId,
    addonId,
  }: {
    storeId: number | string;
    addonId: number | string;
  }): Promise<ApisResult<TAddon>> =>
    http.request<TAddon>(`${ownerBase(storeId)}/addon/${addonId}/`, {
      endpoint: "admin.addons.get",
      group: "admin",
    }),

  create: ({
    storeId,
    body,
  }: {
    storeId: number | string;
    body: unknown;
  }): Promise<ApisResult<TAddon>> =>
    http.request<TAddon>(`${ownerBase(storeId)}/addon/`, {
      method: "POST",
      body,
      endpoint: "admin.addons.create",
      group: "admin",
    }),

  update: ({
    storeId,
    addonId,
    body,
  }: {
    storeId: number | string;
    addonId: number | string;
    body: unknown;
  }): Promise<ApisResult<TAddon>> =>
    http.request<TAddon>(`${ownerBase(storeId)}/addon/${addonId}/`, {
      method: "PATCH",
      body,
      endpoint: "admin.addons.update",
      group: "admin",
    }),

  delete: ({
    storeId,
    addonId,
  }: {
    storeId: number | string;
    addonId: number | string;
  }): Promise<ApisResult<null>> =>
    http.request<null>(`${ownerBase(storeId)}/addon/${addonId}/`, {
      method: "DELETE",
      endpoint: "admin.addons.delete",
      group: "admin",
    }),

  forProduct: ({
    storeId,
    productId,
  }: {
    storeId: number | string;
    productId: number | string;
  }): Promise<ApisResult<TProductDetails>> =>
    http.request<TProductDetails>(`${ownerBase(storeId)}/product/${productId}`, {
      endpoint: "admin.addons.forProduct",
      group: "admin",
    }),
});
