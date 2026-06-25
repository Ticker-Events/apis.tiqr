import { createAuthApi } from "./auth/token.js";
import { createAddressesApi } from "./customer/addresses.js";
import { createUserApi } from "./customer/user.js";
import type { ApisHttpClient } from "../client/http-client.js";

export const createSharedApi = (http: ApisHttpClient) => ({
  auth: createAuthApi(http),
  customer: {
    user: createUserApi(http),
    addresses: createAddressesApi(http),
  },
});

export { createAuthApi } from "./auth/token.js";
export { createUserApi } from "./customer/user.js";
export { createAddressesApi } from "./customer/addresses.js";
