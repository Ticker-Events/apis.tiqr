# Participant API Quick Reference

Buyer/attendee-facing Events APIs under `tiqr.participant.*` — backend prefix `participant/*`.

These cover event discovery, ticket details, discount coupons, and bookings. They are **not** store-scoped (`defaultStoreId` / `forStore` do not apply).

## Tickets list

There is **no** separate `GET participant/.../ticket/` list endpoint. Ticket types for an event are nested on event detail:

```typescript
const { data: event } = await tiqrClient.participant.events.get(eventId);
const tickets = event?.tickets ?? [];
```

Use `participant.tickets.get(eventId, ticketId)` when you need a single ticket by id.

## Discovery → detail → checkout

```typescript
import { tiqrClient } from "./apis-client";

// List events (optional filters)
const { data: events } = await tiqrClient.participant.events.list({
  genre: "music",
  sort_by: "start_date",
  offset: 0,
});

// Event detail (includes tickets + available_discounts on each ticket)
const { data: event } = await tiqrClient.participant.events.get(eventId);

// Single ticket
const { data: ticket } = await tiqrClient.participant.tickets.get(eventId, ticketId);

// Validate a coupon code
const { data: coupon, ok } = await tiqrClient.participant.discounts.validateCoupon({
  eventId,
  code: "SAVE10",
  ticketId,
  quantity: 2,
});

// Create booking (auth optional — pass authenticated: false for guest checkout)
const { data: result } = await tiqrClient.participant.bookings.create(
  {
    ticket: Number(ticketId),
    first_name: "Ada",
    last_name: "Lovelace",
    email: "ada@example.com",
    phone_number: "+919876543210",
    quantity: 2,
    applied_discount: coupon?.id ?? null,
    booking_addons: [],
    meta_data: {},
  },
  { authenticated: true },
);

// Redirect to payment gateway when needed
const redirectUrl = result?.payment && "url_to_redirect" in result.payment
  ? result.payment.url_to_redirect
  : null;
```

## Bookings

| Call | Auth | Notes |
|------|------|--------|
| `bookings.create(payload)` | Optional | Returns `{ booking, payment }` |
| `bookings.createBulk({ bookings })` | No | Multi-attendee / bulk ticket flow |
| `bookings.get(uid)` | No | Lookup by booking **uid** (not numeric id) |
| `bookings.list()` | **Required** | Current user's paid bookings |
| `bookings.search({ phoneNumber })` | No | `{ results: [...] }` |
| `bookings.retryPayment(uid)` | No | Same `{ booking, payment }` shape as create |

```typescript
// Authenticated "my bookings"
const { data: myBookings } = await tiqrClient.participant.bookings.list();

// Public booking page by uid
const { data: booking } = await tiqrClient.participant.bookings.get(bookingUid);

// Retry payment
const { data: retry } = await tiqrClient.participant.bookings.retryPayment(bookingUid);
```

## Related event helpers

```typescript
await tiqrClient.participant.events.highlighted();
await tiqrClient.participant.events.summary();
await tiqrClient.participant.events.shows(eventId);
await tiqrClient.participant.events.seatConfiguration(eventId);
```

Note: the highlighted path uses the backend spelling `hightlighted` (typo preserved).

## Server-side example (RSC)

```typescript
import { tiqrServer } from "@/utils/lib/api/apis-server";

export default async function EventsPage() {
  const { data: events } = await tiqrServer.participant.events.list({
    sort_by: "start_date",
  });
  // ...
}
```

## Types

Request/response types come from `@types/tiqr` / `types.tiqr`:

- `TEventListItem`, `TEventListParams`, `TTickerEvent`
- `TTicketResponse`, `TDiscountCoupon`
- `TBookingCreatePayload`, `TBulkBookingCreatePayload`, `TBookingCreateResponse`, `TUserBooking`
- `TSeatConfigurationResponse`, `TGenreSummary`, `TListResponse<T>`

See [API.md](./API.md#participant--tiqrparticipant) for the full endpoint table.
