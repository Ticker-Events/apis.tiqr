import { createApisClient } from "./create-client.js";
import type { ApisClientConfig } from "./types.js";

type BrowserClientConfig = Omit<ApisClientConfig, "getAccessToken"> & {
  getAccessToken?: ApisClientConfig["getAccessToken"];
};

const getBrowserAccessToken = (): string | null => {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem("accessToken");
};

/**
 * Create an apis.tiqr client for browser environments.
 * Defaults `getAccessToken` to `localStorage.accessToken`.
 */
export const createBrowserClient = (config: BrowserClientConfig) =>
  createApisClient({
    ...config,
    getAccessToken: config.getAccessToken ?? getBrowserAccessToken,
  });
