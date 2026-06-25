# Admin API Quick Reference

Store owner dashboard APIs under `tiqr.admin.*` — backend prefix `service/owner/store/*`.

```typescript
import { tiqrClient } from "./apis-client";

const storeId = 1;

// Catalog management
const products = await tiqrClient.admin.products.list({ storeId, offset: 0 });
await tiqrClient.admin.products.create({ storeId, body: productPayload });
await tiqrClient.admin.categories.create({ storeId, body: categoryPayload });

// Orders
const orders = await tiqrClient.admin.orders.listFiltered({
  storeId,
  filters: { status: ["pending"] },
  sortBy: "newest_first",
  offset: 0,
});
await tiqrClient.admin.orders.update({ storeId, orderId: 42, payload: { status: "completed" } });

// Scheduling
const template = await tiqrClient.admin.availability.getLatestConfig(storeId);
await tiqrClient.admin.availability.save(storeId, availabilityConfig);

// Dashboard
const summary = await tiqrClient.admin.dashboard.orderSummary({
  storeId,
  startDate: "2026-01-01",
  endDate: "2026-01-31",
});

// Media & messaging
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
