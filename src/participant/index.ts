import type { ApisHttpClient } from "../client/http-client.js";
import type { ApisResult } from "../client/types.js";
import type {
  TBookingCreatePayload,
  TBookingCreateResponse,
  TBulkBookingCreatePayload,
  TDiscountCoupon,
  TEventListItem,
  TEventListParams,
  TGenreSummary,
  TListResponse,
  TSeatConfigurationResponse,
  TTicketResponse,
  TTickerEvent,
  TUserBooking,
} from "types.tiqr";

const buildEventListQuery = (params: TEventListParams = {}, pageSize: number): string => {
  const query = new URLSearchParams();
  const {
    genre,
    created_by,
    hosted_by,
    start_date,
    end_date,
    is_online,
    sort_by,
    search,
    latitude,
    longitude,
    distance,
    limit,
    offset = 0,
  } = params;

  if (genre !== undefined) query.set("genre", String(genre));
  if (created_by !== undefined) query.set("created_by", String(created_by));
  if (hosted_by !== undefined) query.set("hosted_by", String(hosted_by));
  if (start_date !== undefined) query.set("start_date", start_date);
  if (end_date !== undefined) query.set("end_date", end_date);
  if (is_online !== undefined) query.set("is_online", String(is_online));
  if (sort_by !== undefined) query.set("sort_by", sort_by);
  if (search !== undefined) query.set("search", search);
  if (latitude !== undefined) query.set("latitude", String(latitude));
  if (longitude !== undefined) query.set("longitude", String(longitude));
  if (distance !== undefined) query.set("distance", String(distance));
  query.set("limit", String(limit ?? pageSize));
  query.set("offset", String(offset));

  return query.toString();
};

/**
 * Participant event discovery and detail endpoints.
 * @group participant
 */
export const createParticipantEventsApi = (http: ApisHttpClient) => ({
  /**
   * List public events with optional filters.
   * @endpoint GET participant/event/
   * @auth None
   */
  list: (params: TEventListParams = {}): Promise<ApisResult<TListResponse<TEventListItem>>> => {
    const qs = buildEventListQuery(params, http.pageSize);
    return http.request<TListResponse<TEventListItem>>(`participant/event/?${qs}`, {
      auth: false,
      next: { revalidate: 300 },
      endpoint: "participant.events.list",
      group: "participant",
    });
  },

  /**
   * Get full event details including nested tickets.
   * @endpoint GET participant/event/{eventId}/
   * @auth None
   */
  get: (eventId: number | string): Promise<ApisResult<TTickerEvent>> =>
    http.request<TTickerEvent>(`participant/event/${eventId}/`, {
      auth: false,
      endpoint: "participant.events.get",
      group: "participant",
    }),

  /**
   * List highlighted events (backend path typo preserved: hightlighted).
   * @endpoint GET participant/event/hightlighted/
   * @auth None
   */
  highlighted: (): Promise<ApisResult<TEventListItem[]>> =>
    http.request<TEventListItem[]>("participant/event/hightlighted/", {
      auth: false,
      endpoint: "participant.events.highlighted",
      group: "participant",
    }),

  /**
   * Genre summary counts for discovery.
   * @endpoint GET participant/event/summary/
   * @auth None
   */
  summary: (): Promise<ApisResult<TGenreSummary[]>> =>
    http.request<TGenreSummary[]>("participant/event/summary/", {
      auth: false,
      endpoint: "participant.events.summary",
      group: "participant",
    }),

  /**
   * List recurring show instances for a parent event.
   * @endpoint GET participant/event/{eventId}/shows/
   * @auth None
   */
  shows: (eventId: number | string): Promise<ApisResult<TListResponse<TEventListItem>>> =>
    http.request<TListResponse<TEventListItem>>(`participant/event/${eventId}/shows/`, {
      auth: false,
      next: { revalidate: 300 },
      endpoint: "participant.events.shows",
      group: "participant",
    }),

  /**
   * Live seat map availability for an event.
   * @endpoint GET participant/event/{eventId}/seat_configuration/
   * @auth None
   */
  seatConfiguration: (
    eventId: number | string,
  ): Promise<ApisResult<TSeatConfigurationResponse>> =>
    http.request<TSeatConfigurationResponse>(
      `participant/event/${eventId}/seat_configuration/`,
      {
        auth: false,
        cache: "no-store",
        endpoint: "participant.events.seatConfiguration",
        group: "participant",
      },
    ),
});

/**
 * Participant ticket endpoints.
 * Tickets for an event are also nested on `events.get(eventId).data.tickets`.
 * @group participant
 */
export const createParticipantTicketsApi = (http: ApisHttpClient) => ({
  /**
   * Get a single ticket for an event.
   * @endpoint GET participant/event/{eventId}/ticket/{ticketId}/
   * @auth None
   */
  get: (
    eventId: number | string,
    ticketId: number | string,
  ): Promise<ApisResult<TTicketResponse>> =>
    http.request<TTicketResponse>(`participant/event/${eventId}/ticket/${ticketId}/`, {
      auth: false,
      endpoint: "participant.tickets.get",
      group: "participant",
    }),
});

/**
 * Participant discount coupon endpoints.
 * Flat/group discounts are also embedded on ticket `available_discounts`.
 * @group participant
 */
export const createParticipantDiscountsApi = (http: ApisHttpClient) => ({
  /**
   * Validate a coupon code for a ticket and quantity.
   * @endpoint GET participant/event/{eventId}/discount_coupon/{code}/?ticket_id=&quantity=
   * @auth None
   */
  validateCoupon: ({
    eventId,
    code,
    ticketId,
    quantity,
  }: {
    eventId: number | string;
    code: string;
    ticketId: number | string;
    quantity: number;
  }): Promise<ApisResult<TDiscountCoupon>> => {
    const qs = new URLSearchParams({
      ticket_id: String(ticketId),
      quantity: String(quantity),
    });
    return http.request<TDiscountCoupon>(
      `participant/event/${eventId}/discount_coupon/${encodeURIComponent(code)}/?${qs}`,
      {
        auth: false,
        endpoint: "participant.discounts.validateCoupon",
        group: "participant",
      },
    );
  },
});

/**
 * Participant booking endpoints.
 * @group participant
 */
export const createParticipantBookingsApi = (http: ApisHttpClient) => ({
  /**
   * Create a booking and initiate payment.
   * @endpoint POST participant/booking/
   * @auth Optional
   */
  create: (
    payload: TBookingCreatePayload,
    { authenticated = true }: { authenticated?: boolean } = {},
  ): Promise<ApisResult<TBookingCreateResponse>> =>
    http.request<TBookingCreateResponse>("participant/booking/", {
      method: "POST",
      body: payload,
      auth: authenticated,
      endpoint: "participant.bookings.create",
      group: "participant",
    }),

  /**
   * Create a bulk (multi-attendee) booking and initiate payment.
   * @endpoint POST participant/booking/bulk/
   * @auth None
   */
  createBulk: (
    payload: TBulkBookingCreatePayload,
  ): Promise<ApisResult<TBookingCreateResponse>> =>
    http.request<TBookingCreateResponse>("participant/booking/bulk/", {
      method: "POST",
      body: payload,
      auth: false,
      endpoint: "participant.bookings.createBulk",
      group: "participant",
    }),

  /**
   * Get booking details by uid.
   * @endpoint GET participant/booking/{uid}/
   * @auth None
   */
  get: (uid: string): Promise<ApisResult<TUserBooking>> =>
    http.request<TUserBooking>(`participant/booking/${uid}/`, {
      auth: false,
      cache: "no-store",
      endpoint: "participant.bookings.get",
      group: "participant",
    }),

  /**
   * List the authenticated user's paid bookings.
   * @endpoint GET participant/booking/
   * @auth Required
   */
  list: (): Promise<ApisResult<TListResponse<TUserBooking>>> =>
    http.request<TListResponse<TUserBooking>>("participant/booking/", {
      cache: "no-store",
      endpoint: "participant.bookings.list",
      group: "participant",
    }),

  /**
   * Search bookings by phone number.
   * @endpoint GET participant/booking/search/?phone_number=
   * @auth None
   */
  search: ({
    phoneNumber,
  }: {
    phoneNumber: string;
  }): Promise<ApisResult<{ results: TUserBooking[] }>> =>
    http.request<{ results: TUserBooking[] }>(
      `participant/booking/search/?phone_number=${encodeURIComponent(phoneNumber)}`,
      {
        auth: false,
        endpoint: "participant.bookings.search",
        group: "participant",
      },
    ),

  /**
   * Retry payment for an unpaid booking.
   * @endpoint POST participant/booking/{uid}/retry_payment/
   * @auth None
   */
  retryPayment: (uid: string): Promise<ApisResult<TBookingCreateResponse>> =>
    http.request<TBookingCreateResponse>(`participant/booking/${uid}/retry_payment/`, {
      method: "POST",
      body: {},
      auth: false,
      endpoint: "participant.bookings.retryPayment",
      group: "participant",
    }),
});

/**
 * Participant-facing Events APIs (discovery, tickets, discounts, bookings).
 * @group participant
 */
export const createParticipantApi = (http: ApisHttpClient) => ({
  events: createParticipantEventsApi(http),
  tickets: createParticipantTicketsApi(http),
  discounts: createParticipantDiscountsApi(http),
  bookings: createParticipantBookingsApi(http),
});
