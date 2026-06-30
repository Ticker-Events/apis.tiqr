import { createLog, redactBody, resolveLoggingConfig } from "./logger.js";
import { resolveStoreId as resolveStoreIdFromConfig } from "./resolve-store-id.js";
import type {
  ApisClientConfig,
  ApisRequestOptions,
  ApisResult,
  ApisUnauthorizedContext,
} from "./types.js";

const LOGOUT_BYPASSED_PATHS = [
  "service/owner/store/",
  "customer/user",
  "service/buyer/cart/",
];

export class ApisHttpClient {
  private readonly clientConfig: ApisClientConfig;
  private readonly baseUrl: string;
  private readonly getAccessToken?: ApisClientConfig["getAccessToken"];
  readonly pageSize: number;
  readonly defaultStoreId?: number | string;
  private readonly onUnauthorized?: ApisClientConfig["onUnauthorized"];
  private readonly fetchFn: typeof fetch;
  private readonly log: ReturnType<typeof createLog>;
  private readonly loggingConfig: ReturnType<typeof resolveLoggingConfig>;

  constructor(config: ApisClientConfig) {
    this.clientConfig = config;
    this.baseUrl = normalizeBaseUrl(config.baseUrl);
    this.getAccessToken = config.getAccessToken;
    this.pageSize = config.pageSize ?? 20;
    this.defaultStoreId = config.defaultStoreId;
    this.onUnauthorized = config.onUnauthorized;
    this.fetchFn = config.fetch ?? globalThis.fetch.bind(globalThis);
    this.loggingConfig = resolveLoggingConfig(config.logging);
    this.log = createLog(this.loggingConfig);
  }

  resolveStoreId(storeId?: number | string): number | string {
    return resolveStoreIdFromConfig(this, storeId);
  }

  withDefaultStore(storeId: number | string): ApisHttpClient {
    return new ApisHttpClient({ ...this.clientConfig, defaultStoreId: storeId });
  }

  buildUrl(path: string): string {
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
    return `${this.baseUrl}/${normalizedPath}`;
  }

  async request<T>(path: string, options: ApisRequestOptions = {}): Promise<ApisResult<T>> {
    const method = (options.method ?? "GET").toUpperCase();
    const url = this.buildUrl(path);
    const auth = options.auth ?? true;
    const start = Date.now();
    const endpoint = options.endpoint ?? path;

    const headers: Record<string, string> = {};
    let body: BodyInit | undefined;

    if (options.contentType === "multipart/form-data") {
      body = options.body as FormData;
    } else if (method !== "GET" && options.body !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(options.body);
    }

    let authPresent = false;
    if (auth && this.getAccessToken) {
      const token = await this.getAccessToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        authPresent = true;
      }
    }

    this.log.debug("→ request", {
      method,
      url,
      endpoint,
      group: options.group,
      authPresent,
      requestBody: this.loggingConfig.logRequestBody
        ? redactBody(options.body, this.loggingConfig.redactBodyFields, this.loggingConfig.maxBodyLength)
        : undefined,
    });

    const fetchOptions: RequestInit & { next?: { revalidate?: number | false } } = {
      method,
      headers,
      body,
    };

    if (options.cache) {
      fetchOptions.cache = options.cache;
    }

    if (options.next) {
      fetchOptions.next = options.next;
    } else if (method === "GET" && !options.cache) {
      fetchOptions.next = { revalidate: 10 };
    }

    try {
      const response = await this.fetchFn(url, fetchOptions);
      const durationMs = Date.now() - start;
      const status = response.status;
      const ok = response.ok;

      let data: T | null = null;
      let error: unknown;

      if (status === 204) {
        data = null;
      } else {
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          try {
            data = (await response.json()) as T;
          } catch (parseError) {
            error = parseError;
          }
        } else if (ok) {
          data = (await response.text()) as unknown as T;
        }
      }

      if (!ok) {
        error = data ?? { message: response.statusText };
      }

      if (status === 401 && auth && !LOGOUT_BYPASSED_PATHS.some((p) => path.includes(p))) {
        this.log.warn("401 unauthorized", { method, url, endpoint, status, durationMs, group: options.group });
        this.onUnauthorized?.({ url, method, status } satisfies ApisUnauthorizedContext);
      } else if (!ok) {
        const level = status >= 500 ? "error" : "warn";
        this.log[level](`← ${status}`, {
          method,
          url,
          endpoint,
          status,
          durationMs,
          group: options.group,
          responseBody: this.loggingConfig.logResponseBody
            ? redactBody(data, this.loggingConfig.redactBodyFields, this.loggingConfig.maxBodyLength)
            : undefined,
          error,
        });
      } else {
        this.log.info(`← ${status} (${durationMs}ms)`, {
          method,
          url,
          endpoint,
          status,
          durationMs,
          group: options.group,
          responseBody: this.loggingConfig.logResponseBody
            ? redactBody(data, this.loggingConfig.redactBodyFields, this.loggingConfig.maxBodyLength)
            : undefined,
        });
      }

      return { ok, status, data: ok ? data : null, error: ok ? undefined : error };
    } catch (err) {
      const durationMs = Date.now() - start;
      this.log.error("request failed", {
        method,
        url,
        endpoint,
        durationMs,
        group: options.group,
        error: err,
      });
      return { ok: false, status: 0, data: null, error: err };
    }
  }
}

const normalizeBaseUrl = (baseUrl: string): string => baseUrl.replace(/\/+$/, "");
