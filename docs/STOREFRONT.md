# Storefront API Quick Reference

Buyer-facing APIs under `tiqr.storefront.*` — backend prefix `service/buyer/*`.

## Default store

Set `defaultStoreId` when creating the client for single-store sites. Object-param methods accept optional `storeId`; positional methods use smart arity when the default is set.

```typescript
import { tiqrClient } from "./apis-client";

// With defaultStoreId configured — storeId omitted
const store = await tiqrClient.storefront.stores.get();
const products = await tiqrClient.storefront.products.list({ offset: 0 });
const slots = await tiqrClient.storefront.appointments.getMonthlySlots(6, 2026);
await tiqrClient.storefront.appointments.enquireSlot({ /* slot enquiry */ });

// Override for a different store
const otherProducts = await tiqrClient.storefront.products.list({
  storeId: otherStoreId,
  offset: 0,
});
const otherSlots = await tiqrClient.storefront.appointments.getMonthlySlots(otherStoreId, 6, 2026);
```

Without `defaultStoreId`, pass `storeId` explicitly as before:

```typescript
const store = await tiqrClient.storefront.stores.get(storeId);
const products = await tiqrClient.storefront.products.list({ storeId, offset: 0 });
const slots = await tiqrClient.storefront.appointments.getMonthlySlots(storeId, 6, 2026);
await tiqrClient.storefront.appointments.enquireSlot(storeId, { /* slot enquiry */ });
```

## Server-side example (RSC)

```typescript
import { tiqrServer } from "@/utils/lib/api/apis-server";

export default async function StorePage() {
  // defaultStoreId set on tiqrServer — no storeId per call
  const { data: store } = await tiqrServer.storefront.stores.get();
  const { data: products } = await tiqrServer.storefront.products.list();
  // ...
}
```

## Common calls (no store scoping)

```typescript
const product = await tiqrClient.storefront.products.get(productId);

const cart = await tiqrClient.storefront.cart.get();
await tiqrClient.storefront.cart.addItem({ /* item */ });
await tiqrClient.storefront.cart.checkout({ /* checkout payload */ });

const orders = await tiqrClient.storefront.orders.list({ sortBy: "newest_first", offset: 0 });
const order = await tiqrClient.storefront.orders.get(orderUuid);
```

## Endpoints

| Method | Description | Auth |
|--------|-------------|------|
| `stores.get` | Store details | No |
| `products.list` | Product catalog | No |
| `products.get` | Product detail page | No |
| `productOptions.get` | Product variant/option | No |
| `cart.get` | Current cart | Yes |
| `cart.addItem` | Add to cart | Yes |
| `cart.removeItems` | Remove cart lines | Yes |
| `cart.checkout` | Start checkout | Yes |
| `orders.list` | Buyer order history | Yes |
| `orders.get` | Order detail (public link) | No |
| `orders.create` | Place order | Optional |
| `orders.update` | Update order | Yes |
| `orders.retryPayment` | Retry failed payment | Yes |
| `appointments.getMonthlySlots` | Calendar slots | No |
| `appointments.getPeriodSlots` | Date range slots | No |
| `appointments.enquireSlot` | Book/enquire slot | No |

See [API.md](./API.md) for full details.
