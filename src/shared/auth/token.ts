import type { ApisHttpClient } from "../../client/http-client.js";
import type { ApisResult } from "../../client/types.js";
import type { TUser } from "types.tiqr";

type TTokenExchangePayload = {
  uid: string;
  id_token: string;
};

type TTokenExchangeResponse = {
  access_token: string;
  user: TUser;
};

/**
 * Exchange a Firebase ID token for a TiQR access token.
 * @group shared
 * @endpoint POST auth/token/
 * @auth None
 */
export const createAuthApi = (http: ApisHttpClient) => ({
  exchangeToken: (payload: TTokenExchangePayload): Promise<ApisResult<TTokenExchangeResponse>> =>
    http.request<TTokenExchangeResponse>("auth/token/", {
      method: "POST",
      body: payload,
      auth: false,
      endpoint: "auth.exchangeToken",
      group: "shared",
    }),
});
