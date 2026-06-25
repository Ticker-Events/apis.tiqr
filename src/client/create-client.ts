import { ApisHttpClient } from "./http-client.js";
import { createAdminApi } from "../admin/index.js";
import { createSharedApi } from "../shared/index.js";
import { createStorefrontApi } from "../storefront/index.js";
import type { ApisClientConfig } from "./types.js";

export const createApisClient = (config: ApisClientConfig) => {
  const http = new ApisHttpClient(config);
  const shared = createSharedApi(http);

  return {
    http,
    auth: shared.auth,
    customer: shared.customer,
    storefront: createStorefrontApi(http),
    admin: createAdminApi(http),
  };
};

export type ApisClient = ReturnType<typeof createApisClient>;
