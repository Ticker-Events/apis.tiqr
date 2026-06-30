# Admin API Quick Reference

Store owner dashboard APIs under `tiqr.admin.*` — backend prefix `service/owner/store/*`.

## Default store

With `defaultStoreId` on the client, omit `storeId` from object-param methods. Positional methods use smart arity:

| Method | With default | Override |
|--------|--------------|----------|
| `faq.get(storeId, faqId)` | `get(faqId)` | `get(storeId, faqId)` |
| `faq.delete(storeId, faqId)` | `delete(faqId)` | `delete(storeId, faqId)` |
| `availability.save(storeId, payload)` | `save(payload)` | `save(storeId, payload)` |
| `stores.update(storeId, payload)` | `update(payload)` | `update(storeId, payload)` |

```typescript
import { tiqrClient } from "./apis-client";

// With defaultStoreId configured
const products = await tiqrClient.admin.products.list({ offset: 0 });
await tiqrClient.admin.products.create({ body: productPayload });
const template = await tiqrClient.admin.availability.getLatestConfig();
await tiqrClient.admin.availability.save(availabilityConfig);
const faq = await tiqrClient.admin.faq.get(faqId);

// Override for a different store
await tiqrClient.admin.products.list({ storeId: otherStoreId, offset: 0 });
```

Without `defaultStoreId`, pass `storeId` explicitly:

```typescript
const storeId = 1;

const products = await tiqrClient.admin.products.list({ storeId, offset: 0 });
await tiqrClient.admin.products.create({ storeId, body: productPayload });
await tiqrClient.admin.categories.create({ storeId, body: categoryPayload });

const orders = await tiqrClient.admin.orders.listFiltered({
  storeId,
  filters: { status: ["pending"] },
  sortBy: "newest_first",
  offset: 0,
});
await tiqrClient.admin.orders.update({ storeId, orderId: 42, payload: { status: "completed" } });

const template = await tiqrClient.admin.availability.getLatestConfig(storeId);
await tiqrClient.admin.availability.save(storeId, availabilityConfig);

const summary = await tiqrClient.admin.dashboard.orderSummary({
  storeId,
  startDate: "2026-01-01",
  endDate: "2026-01-31",
});

await tiqrClient.admin.media.uploadImage(file, "products/");
await tiqrClient.admin.messaging.whatsapp.send({ /* WA payload */ });
```

## CRUD resources

Each supports `list`, `get`, `create`, `update`, `delete`:

- `admin.products`
- `admin.categories`
- `admin.addons`
- `admin.faq`

## Endpoints

| Method | Description |
|--------|-------------|
| `stores.list` | List owned stores |
| `stores.update` | Update store settings |
| `products.*` | Product CRUD |
| `categories.*` | Category CRUD |
| `addons.*` | Addon CRUD |
| `addons.forProduct` | Product with addons |
| `orders.list` | All store orders |
| `orders.listFiltered` | Filtered/sorted orders |
| `orders.get` | Order detail |
| `orders.update` | Update order status/fields |
| `orders.reschedule` | Reschedule appointment |
| `orders.validateReschedule` | Validate reschedule |
| `appointments.list` | Monthly appointments |
| `appointments.create` | Create appointment |
| `availability.getLatestConfig` | Schedule template |
| `availability.save` | Save availability |
| `dashboard.orderSummary` | Order counts by status |
| `faq.*` | FAQ CRUD + reorder |
| `productOptions.search` | Search product options |
| `media.uploadImage` | Upload image |
| `media.uploadConversationFile` | Upload chat file |
| `messaging.whatsapp.send` | Send WhatsApp message |

See [API.md](./API.md) for full details.
