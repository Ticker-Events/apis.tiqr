import type { ApisHttpClient } from "./http-client.js";
import { ApisStoreIdRequiredError } from "./types.js";

export { ApisStoreIdRequiredError };

export const resolveStoreId = (
  http: ApisHttpClient,
  storeId?: number | string,
): number | string => {
  const resolved = storeId ?? http.defaultStoreId;
  if (resolved === undefined || resolved === null || resolved === "") {
    throw new ApisStoreIdRequiredError();
  }
  return resolved;
};

/**
 * Resolves store + value for `(storeId, value)` vs `(value)` calls.
 * With defaultStoreId: `save(payload)`. Override: `save(storeId, payload)`.
 */
export const resolveTwoArgStoreCall = <TValue>(
  http: ApisHttpClient,
  first: number | string | TValue,
  second?: TValue,
): { storeId: number | string; value: TValue } => {
  if (second !== undefined) {
    return {
      storeId: resolveStoreId(http, first as number | string),
      value: second,
    };
  }
  return {
    storeId: resolveStoreId(http),
    value: first as TValue,
  };
};

/**
 * Resolves store + two trailing args for `(storeId, a, b)` vs `(a, b)` calls.
 * With defaultStoreId: `getMonthlySlots(month, year)`. Override: `getMonthlySlots(storeId, month, year)`.
 */
export const resolveThreeArgStoreCall = <TSecond, TThird>(
  http: ApisHttpClient,
  first: number | string | TSecond,
  second: TSecond | TThird,
  third?: TThird,
): { storeId: number | string; second: TSecond; third: TThird } => {
  if (third !== undefined) {
    return {
      storeId: resolveStoreId(http, first as number | string),
      second: second as TSecond,
      third,
    };
  }
  return {
    storeId: resolveStoreId(http),
    second: first as TSecond,
    third: second as TThird,
  };
};
