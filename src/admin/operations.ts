import type { ApisHttpClient } from "../client/http-client.js";
import type { ApisResult } from "../client/types.js";
import type {
  TChatFile,
  TListResponse,
  TOrder,
  TSchedule,
  TSortOptionsKey,
} from "types.tiqr";

const ownerBase = (storeId: number | string) => `service/owner/store/${storeId}`;

const ORDER_SORT_PARAMS: Record<string, string> = {
  oldest_first: "created_at",
  newest_first: "-created_at",
};

/**
 * Admin order management endpoints.
 * @group admin
 */
export const createAdminOrdersApi = (http: ApisHttpClient) => ({
  list: ({ storeId }: { storeId: number | string }): Promise<ApisResult<TListResponse<TOrder>>> =>
    http.request<TListResponse<TOrder>>(`${ownerBase(storeId)}/order/`, {
      endpoint: "admin.orders.list",
      group: "admin",
    }),

  listFiltered: ({
    storeId,
    filters = {},
    sortBy = "newest_first",
    limit,
    offset = 0,
  }: {
    storeId: number | string;
    filters?: Record<string, string[]>;
    sortBy?: TSortOptionsKey | string;
    limit?: number;
    offset?: number;
  }): Promise<ApisResult<TListResponse<TOrder>>> => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, values]) => {
      queryParams.append(key, values.join(","));
    });
    const sortParam = ORDER_SORT_PARAMS[sortBy] ?? ORDER_SORT_PARAMS.newest_first;
    const qs = `limit=${limit ?? http.pageSize}&offset=${offset}&${queryParams.toString()}&sort_by=${sortParam}`;
    return http.request<TListResponse<TOrder>>(`${ownerBase(storeId)}/order/?${qs}`, {
      endpoint: "admin.orders.listFiltered",
      group: "admin",
    });
  },

  get: ({
    storeId,
    orderId,
  }: {
    storeId: number | string;
    orderId: number | string;
  }): Promise<ApisResult<TOrder>> =>
    http.request<TOrder>(`${ownerBase(storeId)}/order/${orderId}/`, {
      endpoint: "admin.orders.get",
      group: "admin",
    }),

  update: ({
    storeId,
    orderId,
    payload,
  }: {
    storeId: number | string;
    orderId: number | string;
    payload: unknown;
  }): Promise<ApisResult<TOrder>> =>
    http.request<TOrder>(`${ownerBase(storeId)}/order/${orderId}/`, {
      method: "PATCH",
      body: payload,
      endpoint: "admin.orders.update",
      group: "admin",
    }),

  reschedule: ({
    storeId,
    payload,
  }: {
    storeId: number | string;
    payload: unknown;
  }): Promise<ApisResult<unknown>> =>
    http.request(`${ownerBase(storeId)}/appointment/reschedule/`, {
      method: "POST",
      body: payload,
      endpoint: "admin.orders.reschedule",
      group: "admin",
    }),

  validateReschedule: ({
    storeId,
    payload,
  }: {
    storeId: number | string;
    payload: unknown;
  }): Promise<ApisResult<unknown>> =>
    http.request(`${ownerBase(storeId)}/appointment/validate-reschedule/`, {
      method: "POST",
      body: payload,
      endpoint: "admin.orders.validateReschedule",
      group: "admin",
    }),
});

/**
 * Admin appointment endpoints.
 * @group admin
 */
export const createAdminAppointmentsApi = (http: ApisHttpClient) => ({
  list: ({
    storeId,
    month,
    year,
  }: {
    storeId: number | string;
    month: string | number;
    year: string | number;
  }): Promise<ApisResult<unknown[]>> =>
    http.request<unknown[]>(
      `${ownerBase(storeId)}/appointment/?month=${month}&year=${year}`,
      { endpoint: "admin.appointments.list", group: "admin" },
    ),

  create: ({
    storeId,
    payload,
  }: {
    storeId: number | string;
    payload: unknown;
  }): Promise<ApisResult<unknown>> =>
    http.request(`${ownerBase(storeId)}/appointment/`, {
      method: "POST",
      body: payload,
      endpoint: "admin.appointments.create",
      group: "admin",
    }),
});

/**
 * Admin availability configuration endpoints.
 * @group admin
 */
export const createAdminAvailabilityApi = (http: ApisHttpClient) => ({
  getLatestConfig: (storeId: number | string): Promise<ApisResult<TSchedule>> =>
    http.request<TSchedule>(`${ownerBase(storeId)}/availability/latest-conf/`, {
      endpoint: "admin.availability.getLatestConfig",
      group: "admin",
    }),

  save: (storeId: number | string, payload: unknown): Promise<ApisResult<unknown>> =>
    http.request(`${ownerBase(storeId)}/availability/`, {
      method: "POST",
      body: payload,
      endpoint: "admin.availability.save",
      group: "admin",
    }),
});

/**
 * Admin dashboard endpoints.
 * @group admin
 */
export const createAdminDashboardApi = (http: ApisHttpClient) => ({
  orderSummary: ({
    storeId,
    startDate,
    endDate,
  }: {
    storeId: number | string;
    startDate: string;
    endDate: string;
  }): Promise<ApisResult<{ status: string; count: number }[]>> =>
    http.request<{ status: string; count: number }[]>(
      `${ownerBase(storeId)}/summary/?start_date=${startDate}&end_date=${endDate}`,
      { endpoint: "admin.dashboard.orderSummary", group: "admin" },
    ),
});

/**
 * Admin FAQ CRUD endpoints.
 * @group admin
 */
export const createAdminFaqApi = (http: ApisHttpClient) => ({
  list: (storeId: number | string): Promise<ApisResult<unknown>> =>
    http.request(`${ownerBase(storeId)}/faq/`, {
      cache: "no-store",
      endpoint: "admin.faq.list",
      group: "admin",
    }),

  get: (storeId: number | string, faqId: number | string): Promise<ApisResult<unknown>> =>
    http.request(`${ownerBase(storeId)}/faq/${faqId}/`, {
      cache: "no-store",
      endpoint: "admin.faq.get",
      group: "admin",
    }),

  create: (storeId: number | string, payload: unknown): Promise<ApisResult<unknown>> =>
    http.request(`${ownerBase(storeId)}/faq/`, {
      method: "POST",
      body: payload,
      endpoint: "admin.faq.create",
      group: "admin",
    }),

  update: (
    storeId: number | string,
    faqId: number | string,
    payload: unknown,
  ): Promise<ApisResult<unknown>> =>
    http.request(`${ownerBase(storeId)}/faq/${faqId}/`, {
      method: "PATCH",
      body: payload,
      endpoint: "admin.faq.update",
      group: "admin",
    }),

  delete: (storeId: number | string, faqId: number | string): Promise<ApisResult<null>> =>
    http.request<null>(`${ownerBase(storeId)}/faq/${faqId}/`, {
      method: "DELETE",
      endpoint: "admin.faq.delete",
      group: "admin",
    }),

  reorderPriority: (storeId: number | string, payload: unknown): Promise<ApisResult<unknown>> =>
    http.request(`service/owner/store/${storeId}/faq/update_listing_priority/`, {
      method: "POST",
      body: payload,
      endpoint: "admin.faq.reorderPriority",
      group: "admin",
    }),
});

/**
 * Admin product option search.
 * @group admin
 */
export const createAdminProductOptionsApi = (http: ApisHttpClient) => ({
  search: ({
    storeId,
    query,
  }: {
    storeId: number | string;
    query: string;
  }): Promise<ApisResult<unknown>> =>
    http.request(`${ownerBase(storeId)}/product-option?search=${encodeURIComponent(query)}`, {
      endpoint: "admin.productOptions.search",
      group: "admin",
    }),
});

/**
 * Admin media upload endpoints.
 * @group admin
 */
export const createAdminMediaApi = (http: ApisHttpClient) => ({
  uploadImage: (file: File | Blob, path?: string): Promise<ApisResult<unknown>> => {
    const formData = new FormData();
    formData.append("image", file);
    if (path) formData.append("path", path);
    return http.request("participant/media/", {
      method: "POST",
      body: formData,
      auth: false,
      contentType: "multipart/form-data",
      endpoint: "admin.media.uploadImage",
      group: "admin",
    });
  },

  uploadConversationFile: (
    file: File | Blob,
    type: string,
    path?: string,
  ): Promise<ApisResult<TChatFile>> => {
    const formData = new FormData();
    formData.append("file_upload", file);
    formData.append("type", type);
    if (path) formData.append("path", path);
    return http.request<TChatFile>("participant/conversation_media/", {
      method: "POST",
      body: formData,
      auth: false,
      contentType: "multipart/form-data",
      endpoint: "admin.media.uploadConversationFile",
      group: "admin",
    });
  },
});

/**
 * Admin WhatsApp messaging endpoints.
 * @group admin
 */
export const createAdminMessagingApi = (http: ApisHttpClient) => ({
  whatsapp: {
    send: (payload: unknown): Promise<ApisResult<unknown>> =>
      http.request("conversation/wa-message/", {
        method: "POST",
        body: payload,
        endpoint: "admin.messaging.whatsapp.send",
        group: "admin",
      }),
  },
});
