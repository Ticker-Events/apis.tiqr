import { createAdminApi } from "../admin/index.js";
import { createSharedApi } from "../shared/index.js";
import { createStorefrontApi } from "../storefront/index.js";
import type { ApisClientConfig } from "./types.js";
import { ApisHttpClient } from "./http-client.js";

export const createApisClient = (config: ApisClientConfig) => {
  const http = new ApisHttpClient(config);
  const shared = createSharedApi(http);

  return {
    http,
    auth: shared.auth,
    customer: shared.customer,
    storefront: createStorefrontApi(http),
    admin: createAdminApi(http),
    forStore: (storeId: number | string) => {
      const scopedHttp = http.withDefaultStore(storeId);
      return {
        storefront: createStorefrontApi(scopedHttp),
        admin: createAdminApi(scopedHttp),
      };
    },
  };
};

export type ApisClient = ReturnType<typeof createApisClient>;
