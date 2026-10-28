# Events API Documentation

Buyer/attendee-facing **Events** APIs from `apis.tiqr` (`tiqr.participant.*`), typed by `@types/tiqr` (`types.tiqr`).

Backend prefix: `participant/*`. These APIs are **not** store-scoped (`defaultStoreId` / `forStore()` do not apply).

> Organiser event CRUD is not exposed in `apis.tiqr` today. This document covers the public participant surface only.

---

## Setup

```typescript
import { createApisClient } from "apis.tiqr";

const tiqr = createApisClient({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL!, // e.g. https://api.example.com/api/be
  getAccessToken, // required only for authenticated calls (e.g. bookings.list)
  pageSize: 20,   // default limit for events.list
});

// All Events methods hang off:
tiqr.participant.events
tiqr.participant.tickets
tiqr.participant.discounts
tiqr.participant.bookings
```

Every method returns `Promise<ApisResult<T>>`:

```typescript
type ApisResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  error?: unknown;
};
```

Request/response shapes come from `@types/tiqr`.

---

## Flow overview

```
Discovery          Detail              Checkout
─────────          ──────              ────────
events.list   →    events.get     →    tickets.get (optional)
events.highlighted events.shows        discounts.validateCoupon
events.summary     events.seatConfig   bookings.create / createBulk
                                       bookings.retryPayment
```

Tickets for an event are nested on `events.get(eventId).data.tickets`. There is **no** separate ticket list endpoint.

---

## Events — `tiqr.participant.events`

### `list(params?)`

List public events with optional filters.

| | |
|---|---|
| **HTTP** | `GET participant/event/` |
| **Auth** | None |
| **Response** | `TListResponse<TEventListItem>` |

**Query params** (`TEventListParams`):

| Param | Type | Notes |
|-------|------|--------|
| `genre` | `string` | Genre filter |
| `created_by` | `string \| number` | Organiser user id |
| `hosted_by` | `string \| number` | Host user id |
| `start_date` | `string` | ISO / date string |
| `end_date` | `string` | ISO / date string |
| `is_online` | `boolean` | Online vs in-person |
| `sort_by` | `string` | e.g. `"start_date"` |
| `search` | `string` | Free-text search |
| `latitude` | `number` | Geo filter (with longitude) |
| `longitude` | `number` | Geo filter |
| `distance` | `number` | Radius for geo filter |
| `limit` | `number` | Defaults to client `pageSize` (20) |
| `offset` | `number` | Defaults to `0` |

```typescript
const { data } = await tiqr.participant.events.list({
  genre: "music",
  sort_by: "start_date",
  offset: 0,
});
// data: { count, next?, previous?, results: TEventListItem[] }
```

---

### `get(eventId)`

Full event detail, including nested `tickets` (with `available_discounts`, forms, addons).

| | |
|---|---|
| **HTTP** | `GET participant/event/{eventId}/` |
| **Auth** | None |
| **Response** | `TTickerEvent` |

```typescript
const { data: event } = await tiqr.participant.events.get(eventId);
const tickets = event?.tickets ?? [];
```

---

### `highlighted()`

Featured events for home / discovery.

| | |
|---|---|
| **HTTP** | `GET participant/event/hightlighted/` |
| **Auth** | None |
| **Response** | `TEventListItem[]` |

> Backend path spelling `hightlighted` is intentional (typo preserved).

---

### `summary()`

Genre counts for discovery chips.

| | |
|---|---|
| **HTTP** | `GET participant/event/summary/` |
| **Auth** | None |
| **Response** | `TGenreSummary[]` → `{ genre: string; count: number }` |

---

### `shows(eventId)`

Recurring show instances for a parent event (`is_parent` / `is_recurring`).

| | |
|---|---|
| **HTTP** | `GET participant/event/{eventId}/shows/` |
| **Auth** | None |
| **Response** | `TListResponse<TEventListItem>` |

---

### `seatConfiguration(eventId)`

Live seat map + availability. Always fetched with `cache: "no-store"`.

| | |
|---|---|
| **HTTP** | `GET participant/event/{eventId}/seat_configuration/` |
| **Auth** | None |
| **Response** | `TSeatConfigurationResponse` |

```typescript
type TSeatConfigurationResponse = {
  seat_configuration: TSeatConfiguration[];
  confirmed: string[];        // sold seat IDs
  pending_payment: string[];  // held seat IDs
};
```

Use when `event.has_seat_configuration` is true. For section-based maps, also read `event.section_configuration` (`{ tickets, svg_url }`).

---

## Tickets — `tiqr.participant.tickets`

### `get(eventId, ticketId)`

Single ticket by id (prefer nested tickets from `events.get` when listing).

| | |
|---|---|
| **HTTP** | `GET participant/event/{eventId}/ticket/{ticketId}/` |
| **Auth** | None |
| **Response** | `TTicketResponse` |

**Key fields on `TTicketResponse`:**

| Field | Type | Notes |
|-------|------|--------|
| `id` | `number?` | Ticket id |
| `type` | `string` | Ticket name/type |
| `amount` | `number` | Base price |
| `gst_on_ticket` | `number` | |
| `final_amount` | `number` | Price after fees/GST rules |
| `has_limit` / `limit` | | Inventory cap |
| `remaining_tickets` | `number?` | Remaining stock |
| `sale_start_date` / `sale_end_date` | `string` | Sale window |
| `minimum_booking` / `maximum_booking` | `number` | Qty bounds |
| `allow_bulk_booking` | `boolean` | |
| `collect_individual_booking_information` | `boolean` | Per-attendee forms |
| `fee_paid_by_buyer` | `boolean` | |
| `form` | `TTickerForm` | Registration form |
| `event` | `TTickerEvent` | Parent event |
| `platform_fee` | `TPlatformFee` | Fee percentages / fixed / GST |
| `addons` | `TTicketAddon[]?` | Optional add-ons |
| `available_discounts` | `TDiscountCoupon[]?` | Flat/group discounts (no code entry) |
| `seat_configuration` | `TSeatConfiguration?` | Seat map for this ticket |

```typescript
type TTicketAddon = {
  id: number;
  name?: string;
  type: string;
  amount: number;
  description: string;
  minimum_quantity: number;
  maximum_quantity: number;
};
```

---

## Discounts — `tiqr.participant.discounts`

Flat/group discounts also appear on each ticket as `available_discounts`. Use `validateCoupon` for **code-based** coupons (`event.has_coupon_based_discount`).

### `validateCoupon({ eventId, code, ticketId, quantity })`

| | |
|---|---|
| **HTTP** | `GET participant/event/{eventId}/discount_coupon/{code}/?ticket_id=&quantity=` |
| **Auth** | None |
| **Response** | `TDiscountCoupon` |

```typescript
type TDiscountCoupon = {
  id?: number;                    // pass as applied_discount on booking create
  code: string;
  type: string;
  minimum_usage: number;
  amount_after_discount: number;
  addon_discounts?: TAddonDiscount[];
};
```

```typescript
const { data: coupon, ok } = await tiqr.participant.discounts.validateCoupon({
  eventId,
  code: "SAVE10",
  ticketId,
  quantity: 2,
});
// Use coupon.id as applied_discount when creating the booking
```

---

## Bookings — `tiqr.participant.bookings`

### `create(payload, { authenticated? })`

Create a booking and start payment.

| | |
|---|---|
| **HTTP** | `POST participant/booking/` |
| **Auth** | Optional (default `authenticated: true`) |
| **Body** | `TBookingCreatePayload` |
| **Response** | `TBookingCreateResponse` |

```typescript
type TBookingCreatePayload = {
  ticket: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  quantity: number;
  meta_data?: unknown;              // form answers, etc.
  applied_discount?: number | null; // TDiscountCoupon.id
  booking_addons?: { addon: number; quantity: number }[];
  seats?: string[];                 // seat IDs when seated
  referral_code?: string | null;
  callback_url?: string;
  custom_amount?: number;
};

type TBookingCreateResponse = {
  booking: TUserBooking;
  payment: TPaymentMetaData | Record<string, unknown> | null;
};

type TPaymentMetaData = {
  payment_id: string;
  payment_gateway: string;
  url_to_redirect: string;
};
```

```typescript
const { data: result } = await tiqr.participant.bookings.create(
  {
    ticket: Number(ticketId),
    first_name: "Ada",
    last_name: "Lovelace",
    email: "ada@example.com",
    phone_number: "+919876543210",
    quantity: 2,
    applied_discount: coupon?.id ?? null,
    booking_addons: [],
    seats: selectedSeatIds,
    meta_data: formAnswers,
    callback_url: "https://example.com/booking/complete",
  },
  { authenticated: false }, // guest checkout
);

const redirectUrl =
  result?.payment && "url_to_redirect" in result.payment
    ? result.payment.url_to_redirect
    : null;
```

---

### `createBulk(payload)`

Multi-attendee / bulk ticket checkout (`event.allow_bulk_booking` / ticket `allow_bulk_booking`).

| | |
|---|---|
| **HTTP** | `POST participant/booking/bulk/` |
| **Auth** | None |
| **Body** | `TBulkBookingCreatePayload` |
| **Response** | `TBookingCreateResponse` |

```typescript
type TBulkBookingCreatePayload = {
  bookings: TBookingCreatePayload[];
  callback_url?: string;
};
```

---

### `get(uid)`

Public booking page lookup by **uid** (string), not numeric `id`.

| | |
|---|---|
| **HTTP** | `GET participant/booking/{uid}/` |
| **Auth** | None |
| **Response** | `TUserBooking` |

---

### `list()`

Authenticated user's paid bookings.

| | |
|---|---|
| **HTTP** | `GET participant/booking/` |
| **Auth** | **Required** |
| **Response** | `TListResponse<TUserBooking>` |

---

### `search({ phoneNumber })`

Find bookings by phone number.

| | |
|---|---|
| **HTTP** | `GET participant/booking/search/?phone_number=` |
| **Auth** | None |
| **Response** | `{ results: TUserBooking[] }` |

---

### `retryPayment(uid)`

Retry payment for an unpaid booking. Same response shape as create.

| | |
|---|---|
| **HTTP** | `POST participant/booking/{uid}/retry_payment/` |
| **Auth** | None |
| **Body** | `{}` |
| **Response** | `TBookingCreateResponse` |

---

## Core types (`@types/tiqr`)

### Pagination

```typescript
type TListResponse<T> = {
  count: number;
  next?: number;
  previous?: number;
  results: T[];
};
```

### Event — list card (`TEventListItem`)

Compact card from `list`, `highlighted`, and `shows`:

| Field | Type |
|-------|------|
| `id` | `number` |
| `name` | `string` |
| `logo?` / `cover?` | `TImageMedia` |
| `start_date` / `end_date` | `string` |
| `short_description` | `string` |
| `genre` | `string` |
| `is_online` | `boolean` |
| `is_published` | `boolean` |
| `address?` | `TPlace` |
| `minimum_ticket_price?` / `maximum_ticket_price?` / `starting_price?` | `number` |
| `ticket_prices?` | `number[]` |
| `is_recurring?` / `recurring_type?` / `recurring_interval?` | |
| `closed_days?` / `closed_dates?` | |
| `external_booking_url?` | `string` |
| `allow_app_booking?` | `boolean` |
| `organiser?` | `TUser` |
| `timezone?` | `string` |
| `customisation?` | `THashMap` |

### Event — detail (`TTickerEvent`)

Extends AI/base fields (`name`, dates, `description`, `short_description`, `genre`, `tags`, `address`, `venue`, `is_online`, `is_published`, …) plus:

| Field | Type | Notes |
|-------|------|--------|
| `id?` | `number` | |
| `tickets?` | `TTicketResponse[]` | Nested ticket catalog |
| `forms?` | `TTickerForm[]` | Event-level forms |
| `organiser?` / `created_by?` | `TUser` | |
| `platform_fee?` | `TPlatformFee` | |
| `collaborators?` | `TEventCollaboratorsMap` | partner / cohost / speaker / artist |
| `gallery?` / `gallery1–4?` | media | |
| `speakers?` | `TSpeakerResponse[]` | |
| `is_express_checkout_enabled?` | `boolean` | |
| `has_seat_configuration?` | `boolean` | |
| `has_coupon_based_discount?` | `boolean` | |
| `section_configuration?` | `TSectionConfiguration` | SVG section map |
| `minimum_ticket_price` / `starting_price` | `number` | |
| `is_parent?` | `boolean` | Parent of recurring shows |
| `allow_bulk_booking?` | `boolean` | |
| `timezone?` | `string` | |
| `qr_code_id?` | `string \| null` | |
| `is_recurring?` / recurring fields | | |
| `external_booking_url?` | `string` | Off-platform booking |
| `allow_app_booking?` | `boolean` | |

```typescript
type TPlatformFee = {
  tiqr_fee_percentage: number;
  gateway_fee_percentage: number;
  tiqr_fee_fixed: number;
  gst: number;
};
```

### Venue (`TPlace`)

Google Places–like shape on `event.address`: `formatted_address`, `geometry` (`lat`/`lng`), `name`, `place_id`, `address_components`, etc.

### Booking record (`TUserBooking`)

Returned by create / get / list / search:

| Field | Type | Notes |
|-------|------|--------|
| `uid` | `string` | Public lookup key |
| `booking_id` | `string` | Display / QR id |
| `status` | `string` | |
| `booking_type` | `"offline" \| "online" \| "complimentary"` | |
| `first_name` / `last_name` / `email` / `phone_number` | | |
| `quantity?` | `number` | |
| `event` | `TTickerEvent` | |
| `ticket` | `TBasicTicket` | |
| `ticket_snapshot` | `TTicketResponse` | Frozen ticket at purchase |
| `payment` | `TBookingPaymentSnapshot` | Amount + breakdown |
| `booking_addons?` | `TAddonBookingSnapshot[]` | |
| `seats?` | `string[]` | |
| `ticket_pdf?` / `invoice_pdf?` | `TPdfFile` | |
| `booking_token?` / `jwt_token?` | | Check-in / QR |
| `child_bookings?` | `TUserBooking[]` | Bulk children |
| `created_at` | `string` | |

```typescript
type TBookingPaymentSnapshot = {
  id: number;
  event: number;
  ticket: number;
  booking: number;
  status: string;
  amount: number;
  payment_breakdown: TPaymentBreakdown;
  callback_url: string;
};

type TPaymentBreakdown = {
  ticket_unit_price: number;
  addon_amount: number;
  ticket_price: number;
  base_platform_fee: number;
  sgst: number;
  cgst: number;
  platform_fee: number;
  total: number;
  discount: number;
};
```

### Forms (on tickets / events)

From `types.tiqr` `domain/event-form`:

- `TTickerForm` — `id`, `event_id`, `title`, `type`, `questions`, `sections`, …
- `TTickerQuestion` — `id`, `title`, `type`, `options`, `validations`, `conditions?`
- Submit answers via `meta_data` (or product-specific form flows) on booking create.

---

## Endpoint cheat sheet

| SDK | Method | Path | Auth |
|-----|--------|------|------|
| `events.list` | GET | `participant/event/` | No |
| `events.get` | GET | `participant/event/{id}/` | No |
| `events.highlighted` | GET | `participant/event/hightlighted/` | No |
| `events.summary` | GET | `participant/event/summary/` | No |
| `events.shows` | GET | `participant/event/{id}/shows/` | No |
| `events.seatConfiguration` | GET | `participant/event/{id}/seat_configuration/` | No |
| `tickets.get` | GET | `participant/event/{eventId}/ticket/{ticketId}/` | No |
| `discounts.validateCoupon` | GET | `participant/event/{eventId}/discount_coupon/{code}/` | No |
| `bookings.create` | POST | `participant/booking/` | Optional |
| `bookings.createBulk` | POST | `participant/booking/bulk/` | No |
| `bookings.get` | GET | `participant/booking/{uid}/` | No |
| `bookings.list` | GET | `participant/booking/` | Yes |
| `bookings.search` | GET | `participant/booking/search/` | No |
| `bookings.retryPayment` | POST | `participant/booking/{uid}/retry_payment/` | No |

---

## Type source map

| Concern | Package path |
|---------|----------------|
| Event models / list params | `types.tiqr` → `domain/event` |
| Tickets / addons | `domain/ticket` |
| Discounts | `domain/discount` |
| Bookings / payment snapshots | `domain/booking` |
| Payment redirect meta | `domain/payment` |
| Seating | `domain/seating` |
| Forms | `domain/event-form` |
| Venue | `domain/place` |
| Pagination | `common/pagination` |
| Media | `common/media` |
| SDK client | `apis.tiqr` → `src/participant/index.ts` |

Wizard DTOs (`TWBasicRequest`, … in `domain/event-wizard`), check-in (`domain/checkin`), and page SSR props (`pages/events`) are **not** wired by `tiqr.participant` — they support organiser UI / SSR, not this REST client.

---

## Related docs

- [PARTICIPANT.md](./PARTICIPANT.md) — short recipes
- [API.md](./API.md#participant--tiqrparticipant) — full SDK endpoint table (all products)
- [README](../README.md) — install and client setup
