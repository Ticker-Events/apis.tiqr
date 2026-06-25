import type { ApisHttpClient } from "../../client/http-client.js";
import type { ApisResult } from "../../client/types.js";
import type { TUser } from "types.tiqr";

type TUserUpdatePayload = Partial<
  Pick<TUser, "first_name" | "last_name" | "phone_number" | "social_media" | "website">
>;

/**
 * Customer user profile endpoints.
 * @group shared
 */
export const createUserApi = (http: ApisHttpClient) => ({
  /**
   * Get the authenticated user profile.
   * @endpoint GET customer/user
   * @auth Required
   */
  get: (): Promise<ApisResult<TUser>> =>
    http.request<TUser>("customer/user", {
      cache: "no-store",
      endpoint: "customer.user.get",
      group: "shared",
    }),

  /**
   * Update user profile fields.
   * @endpoint PATCH customer/user/{id}
   * @auth Required
   */
  update: (id: number, payload: TUserUpdatePayload): Promise<ApisResult<TUser>> =>
    http.request<TUser>(`customer/user/${id}`, {
      method: "PATCH",
      body: payload,
      endpoint: "customer.user.update",
      group: "shared",
    }),
});
