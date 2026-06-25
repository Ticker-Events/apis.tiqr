import {
  createAdminAddonsApi,
  createAdminCategoriesApi,
  createAdminProductsApi,
  createAdminStoresApi,
} from "./catalog.js";
import {
  createAdminAppointmentsApi,
  createAdminAvailabilityApi,
  createAdminDashboardApi,
  createAdminFaqApi,
  createAdminMediaApi,
  createAdminMessagingApi,
  createAdminOrdersApi,
  createAdminProductOptionsApi,
} from "./operations.js";
import type { ApisHttpClient } from "../client/http-client.js";

export const createAdminApi = (http: ApisHttpClient) => ({
  stores: createAdminStoresApi(http),
  products: createAdminProductsApi(http),
  categories: createAdminCategoriesApi(http),
  addons: createAdminAddonsApi(http),
  orders: createAdminOrdersApi(http),
  appointments: createAdminAppointmentsApi(http),
  availability: createAdminAvailabilityApi(http),
  dashboard: createAdminDashboardApi(http),
  faq: createAdminFaqApi(http),
  productOptions: createAdminProductOptionsApi(http),
  media: createAdminMediaApi(http),
  messaging: createAdminMessagingApi(http),
});

export {
  createAdminStoresApi,
  createAdminProductsApi,
  createAdminCategoriesApi,
  createAdminAddonsApi,
} from "./catalog.js";

export {
  createAdminOrdersApi,
  createAdminAppointmentsApi,
  createAdminAvailabilityApi,
  createAdminDashboardApi,
  createAdminFaqApi,
  createAdminProductOptionsApi,
  createAdminMediaApi,
  createAdminMessagingApi,
} from "./operations.js";
