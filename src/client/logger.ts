import type {
  ApisLogEntry,
  ApisLogLevel,
  ApisLogger,
  ApisLoggingConfig,
} from "./types.js";

const DEFAULT_REDACT_FIELDS = ["password", "id_token", "access_token", "accessToken"];
const LOG_LEVELS: ApisLogLevel[] = ["debug", "info", "warn", "error", "silent"];

type ResolvedLoggingConfig = {
  enabled: boolean;
  level: ApisLogLevel;
  logger: ApisLogger;
  redactBodyFields: string[];
  maxBodyLength: number;
  logRequestBody: boolean;
  logResponseBody: boolean;
};

export const resolveLoggingConfig = (
  logging?: ApisLoggingConfig,
): ResolvedLoggingConfig => {
  const silent: ResolvedLoggingConfig = {
    enabled: false,
    level: "silent",
    logger: () => {},
    redactBodyFields: DEFAULT_REDACT_FIELDS,
    maxBodyLength: 1000,
    logRequestBody: false,
    logResponseBody: false,
  };

  if (!logging) return silent;

  const opts = typeof logging === "boolean" ? { level: "info" as const } : logging;
  const level = opts.level ?? (typeof logging === "boolean" && logging ? "info" : "silent");

  if (typeof logging === "boolean" && !logging) return silent;
  if (level === "silent") return silent;

  const isDebug = level === "debug";

  return {
    enabled: true,
    level,
    logger: opts.logger ?? defaultConsoleLogger,
    redactBodyFields: opts.redactBodyFields ?? DEFAULT_REDACT_FIELDS,
    maxBodyLength: opts.maxBodyLength ?? 1000,
    logRequestBody: opts.logRequestBody ?? isDebug,
    logResponseBody: opts.logResponseBody ?? isDebug,
  };
};

const defaultConsoleLogger: ApisLogger = ({ level, message, context }) => {
  const prefix = `[apis.tiqr] ${message}`;
  const payload = context ? [prefix, context] : [prefix];

  switch (level) {
    case "debug":
      console.debug(...payload);
      break;
    case "info":
      console.info(...payload);
      break;
    case "warn":
      console.warn(...payload);
      break;
    case "error":
      console.error(...payload);
      break;
    default:
      break;
  }
};

export const shouldLog = (
  config: ResolvedLoggingConfig,
  level: ApisLogLevel,
): boolean => {
  if (!config.enabled || config.level === "silent") return false;
  const currentIdx = LOG_LEVELS.indexOf(config.level);
  const targetIdx = LOG_LEVELS.indexOf(level);
  return targetIdx >= currentIdx;
};

export const redactBody = (
  body: unknown,
  fields: string[],
  maxLength: number,
): unknown => {
  if (body === undefined || body === null) return body;
  if (body instanceof FormData) return "[FormData]";
  if (typeof body !== "object") return truncateValue(body, maxLength);

  const clone = Array.isArray(body)
    ? [...body]
    : { ...(body as Record<string, unknown>) };

  const redact = (obj: unknown): unknown => {
    if (!obj || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(redact);

    const record = { ...(obj as Record<string, unknown>) };
    for (const key of Object.keys(record)) {
      if (fields.includes(key)) {
        record[key] = "[REDACTED]";
      } else if (typeof record[key] === "object") {
        record[key] = redact(record[key]);
      }
    }
    return record;
  };

  return truncateValue(redact(clone), maxLength);
};

const truncateValue = (value: unknown, maxLength: number): unknown => {
  try {
    const str = JSON.stringify(value);
    if (str.length <= maxLength) return value;
    return `${str.slice(0, maxLength)}…[truncated]`;
  } catch {
    return "[unserializable]";
  }
};

export type ApisLog = {
  debug: (message: string, context?: ApisLogEntry["context"]) => void;
  info: (message: string, context?: ApisLogEntry["context"]) => void;
  warn: (message: string, context?: ApisLogEntry["context"]) => void;
  error: (message: string, context?: ApisLogEntry["context"]) => void;
};

export const createLog = (config: ResolvedLoggingConfig): ApisLog => {
  const emit = (level: ApisLogLevel, message: string, context?: ApisLogEntry["context"]) => {
    if (!shouldLog(config, level)) return;
    config.logger({ level, message, context });
  };

  return {
    debug: (message, context) => emit("debug", message, context),
    info: (message, context) => emit("info", message, context),
    warn: (message, context) => emit("warn", message, context),
    error: (message, context) => emit("error", message, context),
  };
};
