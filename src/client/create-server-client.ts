import { createApisClient } from "./create-client.js";
import type { ApisClientConfig } from "./types.js";

type ServerClientConfig = ApisClientConfig & {
  getAccessToken: NonNullable<ApisClientConfig["getAccessToken"]>;
};

/**
 * Create an apis.tiqr client for server environments.
 * Requires `getAccessToken` (e.g. read from cookies in Next.js Server Components).
 */
export const createServerClient = (config: ServerClientConfig) => createApisClient(config);
