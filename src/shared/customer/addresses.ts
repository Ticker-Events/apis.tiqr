import type { ApisHttpClient } from "../../client/http-client.js";
import type { ApisResult } from "../../client/types.js";
import type { TListResponse, TAddress } from "types.tiqr";

type TAddressPayload = Partial<
  Omit<TAddress, "id">
>;

/**
 * Customer address CRUD endpoints.
 * @group shared
 */
export const createAddressesApi = (http: ApisHttpClient) => ({
  /**
   * List all addresses for the authenticated user.
   * @endpoint GET customer/address/
   * @auth Required
   */
  list: (): Promise<ApisResult<TListResponse<TAddress>>> =>
    http.request<TListResponse<TAddress>>("customer/address/", {
      cache: "no-store",
      endpoint: "customer.addresses.list",
      group: "shared",
    }),

  /**
   * Get a single address by ID.
   * @endpoint GET customer/address/{id}/
   * @auth Required
   */
  get: (id: number | string): Promise<ApisResult<TAddress>> =>
    http.request<TAddress>(`customer/address/${id}/`, {
      cache: "no-store",
      endpoint: "customer.addresses.get",
      group: "shared",
    }),

  /**
   * Create a new address.
   * @endpoint POST customer/address/
   * @auth Required
   */
  create: (payload: TAddressPayload): Promise<ApisResult<TAddress>> =>
    http.request<TAddress>("customer/address/", {
      method: "POST",
      body: payload,
      endpoint: "customer.addresses.create",
      group: "shared",
    }),

  /**
   * Update an existing address.
   * @endpoint PATCH customer/address/{id}/
   * @auth Required
   */
  update: (id: number | string, payload: TAddressPayload): Promise<ApisResult<TAddress>> =>
    http.request<TAddress>(`customer/address/${id}/`, {
      method: "PATCH",
      body: payload,
      endpoint: "customer.addresses.update",
      group: "shared",
    }),

  /**
   * Delete an address.
   * @endpoint DELETE customer/address/{id}/
   * @auth Required
   */
  delete: (id: number | string): Promise<ApisResult<null>> =>
    http.request<null>(`customer/address/${id}/`, {
      method: "DELETE",
      endpoint: "customer.addresses.delete",
      group: "shared",
    }),
});
