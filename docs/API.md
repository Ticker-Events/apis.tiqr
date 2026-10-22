# API Reference

Full endpoint reference for `apis.tiqr`, grouped by **Shared**, **Storefront**, **Admin**, and **Participant**.

All methods return `Promise<ApisResult<T>>`.

Store-scoped methods accept an optional `storeId` when `defaultStoreId` is set on the client at creation. Per-call `storeId` always overrides the default. See [README](../README.md#single-store-site-optional). Participant (Events) APIs are not store-scoped.

---

## Shared

### Auth — `tiqr.auth`

| Method | HTTP | Path | Auth | Types |
|--------|------|------|------|-------|
| `exchangeToken({ uid, id_token })` | POST | `auth/token/` | No | → `{ access_token, user: TUser }` |

### Customer — `tiqr.customer`

| Method | HTTP | Path | Auth | Types |
|--------|------|------|------|-------|
| `user.get()` | GET | `customer/user` | Yes | `TUser` |
| `user.update(id, payload)` | PATCH | `customer/user/{id}` | Yes | `TUser` |
| `addresses.list()` | GET | `customer/address/` | Yes | `TListResponse<TAddress>` |
| `addresses.get(id)` | GET | `customer/address/{id}/` | Yes | `TAddress` |
| `addresses.create(payload)` | POST | `customer/address/` | Yes | `TAddress` |
| `addresses.update(id, payload)` | PATCH | `customer/address/{id}/` | Yes | `TAddress` |
| `addresses.delete(id)` | DELETE | `customer/address/{id}/` | Yes | `null` |

---

## Storefront — `tiqr.storefront`

Backend prefix: `service/buyer/*`

### Stores

| Method | HTTP | Path | Auth |
|--------|------|------|------|
| `stores.get(storeId)` | GET | `service/buyer/store/{storeId}` | No |

### Products

| Method | HTTP | Path | Auth |
|--------|------|------|------|
| `products.list({ storeId, limit?, offset? })` | GET | `service/buyer/product/?store_id=` | No |
| `products.get(productId)` | GET | `service/buyer/product/{productId}` | No |
| `productOptions.get(optionId)` | GET | `service/buyer/product-option/{optionId}` | No |

### Cart

| Method | HTTP | Path | Auth |
|--------|------|------|------|
| `cart.get()` | GET | `service/buyer/cart/` | Yes |
| `cart.addItem(payload)` | POST | `service/buyer/cart/` | Yes |
| `cart.removeItems(cartItems)` | POST | `service/buyer/cart/` | Yes |
| `cart.checkout(payload)` | POST | `service/buyer/cart/checkout` | Yes |

### Orders

| Method | HTTP | Path | Auth |
|--------|------|------|------|
| `orders.list({ filters?, sortBy?, offset?, limit? })` | GET | `service/buyer/order/` | Yes |
| `orders.get(uuid)` | GET | `service/buyer/order/{uuid}/` | No |
| `orders.create(payload, { authenticated? })` | POST | `service/buyer/order/` | Optional |
| `orders.update(uuid, payload)` | PATCH | `service/buyer/order/{uuid}/` | Yes |
| `orders.retryPayment(uuid)` | POST | `service/buyer/order/{uuid}/retry-payment/` | Yes |

### Appointments

| Method | HTTP | Path | Auth |
|--------|------|------|------|
| `appointments.getMonthlySlots(storeId, month, year)` | GET | `.../available-slots/?month&year` | No |
| `appointments.getPeriodSlots(storeId, startDate, endDate)` | GET | `.../available-slots/?start_date&end_date` | No |
| `appointments.enquireSlot(storeId, payload)` | POST | `.../availability/enquiry-slot/` | No |

---

## Admin — `tiqr.admin`

Backend prefix: `service/owner/store/*`, `participant/*`, `conversation/*`

### Stores

| Method | HTTP | Path | Auth |
|--------|------|------|------|
| `stores.list()` | GET | `service/owner/store/` | Yes |
| `stores.update(storeId, payload)` | PATCH | `service/owner/store/{id}` | Yes |

### Products / Categories / Addons

CRUD pattern: `list`, `get`, `create`, `update`, `delete`

| Resource | Base path |
|----------|-----------|
| `products` | `.../product/` |
| `categories` | `.../category/` |
| `addons` | `.../addon/` |
| `addons.forProduct({ storeId, productId })` | GET `.../product/{productId}` |

### Orders

| Method | HTTP | Path |
|--------|------|------|
| `orders.list({ storeId })` | GET | `.../order/` |
| `orders.listFiltered({ storeId, filters, sortBy, limit, offset })` | GET | `.../order/?filters` |
| `orders.get({ storeId, orderId })` | GET | `.../order/{orderId}/` |
| `orders.update({ storeId, orderId, payload })` | PATCH | `.../order/{orderId}/` |
| `orders.reschedule({ storeId, payload })` | POST | `.../appointment/reschedule/` |
| `orders.validateReschedule({ storeId, payload })` | POST | `.../appointment/validate-reschedule/` |

### Appointments & Availability

| Method | HTTP | Path |
|--------|------|------|
| `appointments.list({ storeId, month, year })` | GET | `.../appointment/?month&year` |
| `appointments.create({ storeId, payload })` | POST | `.../appointment/` |
| `availability.getLatestConfig(storeId)` | GET | `.../availability/latest-conf/` |
| `availability.save(storeId, payload)` | POST | `.../availability/` |

### Dashboard & FAQ

| Method | HTTP | Path |
|--------|------|------|
| `dashboard.orderSummary({ storeId, startDate, endDate })` | GET | `.../summary/?start_date&end_date` |
| `faq.list / get / create / update / delete` | CRUD | `.../faq/` |
| `faq.reorderPriority(storeId, payload)` | POST | `.../faq/update_listing_priority/` |

### Product options, Media, Messaging

| Method | HTTP | Path | Auth |
|--------|------|------|------|
| `productOptions.search({ storeId, query })` | GET | `.../product-option?search=` | Yes |
| `media.uploadImage(file, path?)` | POST | `participant/media/` | No |
| `media.uploadConversationFile(file, type, path?)` | POST | `participant/conversation_media/` | No |
| `messaging.whatsapp.send(payload)` | POST | `conversation/wa-message/` | Yes |

---

## Participant — `tiqr.participant`

Backend prefix: `participant/*` (Events discovery, tickets, discounts, bookings).

See [PARTICIPANT.md](./PARTICIPANT.md) for usage recipes.

### Events

| Method | HTTP | Path | Auth | Types |
|--------|------|------|------|-------|
| `events.list(params?)` | GET | `participant/event/` | No | `TListResponse<TEventListItem>` |
| `events.get(eventId)` | GET | `participant/event/{id}/` | No | `TTickerEvent` (includes `tickets`) |
| `events.highlighted()` | GET | `participant/event/hightlighted/` | No | `TEventListItem[]` |
| `events.summary()` | GET | `participant/event/summary/` | No | `TGenreSummary[]` |
| `events.shows(eventId)` | GET | `participant/event/{id}/shows/` | No | `TListResponse<TEventListItem>` |
| `events.seatConfiguration(eventId)` | GET | `participant/event/{id}/seat_configuration/` | No | `TSeatConfigurationResponse` |

### Tickets

There is no separate tickets list endpoint — use `events.get(eventId).data.tickets`.

| Method | HTTP | Path | Auth | Types |
|--------|------|------|------|-------|
| `tickets.get(eventId, ticketId)` | GET | `participant/event/{eventId}/ticket/{ticketId}/` | No | `TTicketResponse` |

### Discounts

Flat/group discounts are also embedded on each ticket as `available_discounts`.

| Method | HTTP | Path | Auth | Types |
|--------|------|------|------|-------|
| `discounts.validateCoupon({ eventId, code, ticketId, quantity })` | GET | `participant/event/{eventId}/discount_coupon/{code}/?ticket_id=&quantity=` | No | `TDiscountCoupon` |

### Bookings

| Method | HTTP | Path | Auth | Types |
|--------|------|------|------|-------|
| `bookings.create(payload, { authenticated? })` | POST | `participant/booking/` | Optional | `TBookingCreateResponse` |
| `bookings.createBulk(payload)` | POST | `participant/booking/bulk/` | No | `TBookingCreateResponse` |
| `bookings.get(uid)` | GET | `participant/booking/{uid}/` | No | `TUserBooking` |
| `bookings.list()` | GET | `participant/booking/` | Yes | `TListResponse<TUserBooking>` |
| `bookings.search({ phoneNumber })` | GET | `participant/booking/search/?phone_number=` | No | `{ results: TUserBooking[] }` |
| `bookings.retryPayment(uid)` | POST | `participant/booking/{uid}/retry_payment/` | No | `TBookingCreateResponse` |
