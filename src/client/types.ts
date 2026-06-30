export type ApisLogLevel = "debug" | "info" | "warn" | "error" | "silent";

export type ApisApiGroup = "storefront" | "admin" | "shared";

export type ApisLogger = (entry: ApisLogEntry) => void;

export type ApisLogEntry = {
  level: ApisLogLevel;
  message: string;
  context?: {
    method?: string;
    url?: string;
    status?: number;
    durationMs?: number;
    group?: ApisApiGroup;
    endpoint?: string;
    requestBody?: unknown;
    responseBody?: unknown;
    error?: unknown;
    authPresent?: boolean;
  };
};

export type ApisLoggingConfig =
  | boolean
  | {
      level?: ApisLogLevel;
      logger?: ApisLogger;
      redactHeaders?: boolean;
      redactBodyFields?: string[];
      maxBodyLength?: number;
      logRequestBody?: boolean;
      logResponseBody?: boolean;
    };

export type ApisResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  error?: unknown;
};

export type ApisUnauthorizedContext = {
  url: string;
  method: string;
  status: number;
};

export type ApisRequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  cache?: RequestCache;
  next?: { revalidate?: number | false };
  contentType?: "application/json" | "multipart/form-data";
  endpoint?: string;
  group?: ApisApiGroup;
};

export type ApisClientConfig = {
  baseUrl: string;
  getAccessToken?: () => string | null | Promise<string | null>;
  pageSize?: number;
  /** Default store for store-scoped APIs. Per-call storeId overrides this. */
  defaultStoreId?: number | string;
  onUnauthorized?: (ctx: ApisUnauthorizedContext) => void;
  fetch?: typeof fetch;
  logging?: ApisLoggingConfig;
};

export class ApisStoreIdRequiredError extends Error {
  constructor() {
    super(
      "storeId is required. Pass it to the API call or set defaultStoreId in createApisClient.",
    );
    this.name = "ApisStoreIdRequiredError";
  }
}
