# apis.tiqr

TypeScript SDK for TiQR Store REST APIs. Connect to the TiQR backend from any Next.js project — server components, server actions, and client components.

## Install

### From GitHub

Both packages are installed from GitHub (not published to npm). Install `@types/tiqr` first, then `apis.tiqr`:

```bash
npm install github:Ticker-Events/types.tiqr github:Ticker-Events/apis.tiqr
```

Or add them to `package.json`:

```json
{
  "dependencies": {
    "@types/tiqr": "github:Ticker-Events/types.tiqr",
    "apis.tiqr": "github:Ticker-Events/apis.tiqr"
  }
}
```

Pin a branch, tag, or commit by appending `#ref`:

```bash
npm install github:Ticker-Events/apis.tiqr#main
npm install github:Ticker-Events/apis.tiqr#v0.1.0
```

`apis.tiqr` builds automatically on install (`prepare` runs `npm run build`). `@types/tiqr` is a peer dependency for request/response types.

**pnpm / yarn**

```bash
pnpm add github:Ticker-Events/types.tiqr github:Ticker-Events/apis.tiqr
yarn add github:Ticker-Events/types.tiqr github:Ticker-Events/apis.tiqr
```

**Private repos** — use SSH or a personal access token:

```bash
npm install git+ssh://git@github.com/Ticker-Events/apis.tiqr.git
npm install git+https://<token>@github.com/Ticker-Events/apis.tiqr.git
```

### From npm

```bash
npm install apis.tiqr @types/tiqr
```

## Quick start

### Server (Next.js RSC / Server Actions)

```typescript
// utils/lib/api/apis-server.ts
import { createApisClient } from "apis.tiqr";
import { getAccessToken } from "./user/actions/session-server";

export const tiqrServer = createApisClient({
  baseUrl: `${process.env.NEXT_PUBLIC_SELF_URL}/api/be`,
  getAccessToken,
  pageSize: Number(process.env.NEXT_PUBLIC_STORE_PAGE_RECORD_LIMIT ?? 20),
  logging: process.env.NODE_ENV === "development",
});
```

### Client (browser components)

```typescript
// utils/lib/api/apis-client.ts
import { createBrowserClient } from "apis.tiqr";

export const tiqrClient = createBrowserClient({
  baseUrl: `${process.env.NEXT_PUBLIC_SELF_URL}/api/be`,
  pageSize: Number(process.env.NEXT_PUBLIC_STORE_PAGE_RECORD_LIMIT ?? 20),
  logging: process.env.NEXT_PUBLIC_ENVIRONMENT === "development",
  onUnauthorized: () => {
    window.location.href = `/auth/logout?redirect=${encodeURIComponent(window.location.href)}`;
  },
});
```

### Usage

```typescript
import { tiqrClient } from "@/utils/lib/api/apis-client";

const { data: cart, ok } = await tiqrClient.storefront.cart.get();
const { data: products } = await tiqrClient.storefront.products.list({ storeId: 1, offset: 0 });
const { data: orders } = await tiqrClient.admin.orders.list({ storeId: 1 });
```

## API groups

| Group | Namespace | Use case |
|-------|-----------|----------|
| **Shared** | `tiqr.auth`, `tiqr.customer` | Login token exchange, user profile, addresses |
| **Storefront** | `tiqr.storefront` | Shopper-facing: catalog, cart, checkout, orders |
| **Admin** | `tiqr.admin` | Store owner dashboard: products, orders, scheduling |

See [docs/API.md](./docs/API.md) for the full endpoint reference.

- [Storefront APIs](./docs/STOREFRONT.md)
- [Admin APIs](./docs/ADMIN.md)

## Subpath imports

```typescript
import { createStorefrontApi } from "apis.tiqr/storefront";
import { createAdminApi } from "apis.tiqr/admin";
import { createSharedApi } from "apis.tiqr/shared";
import { createBrowserClient } from "apis.tiqr/browser";
```

## Next.js proxy setup

Add a rewrite in `next.config.ts` so the SDK can call your app origin instead of the backend directly:

```typescript
async rewrites() {
  return [
    {
      source: "/api/be/:path*/",
      destination: `${process.env.BACKEND_URL}/:path*/`,
    },
  ];
}
```

Set `baseUrl` to `${NEXT_PUBLIC_SELF_URL}/api/be` (no trailing slash required).

## Response shape

All methods return `ApisResult<T>`:

```typescript
type ApisResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  error?: unknown;
};
```

## Development logging

Logging is **off by default**. Enable it per client:

```typescript
createApisClient({
  logging: true, // info level
});

createApisClient({
  logging: {
    level: "debug",
    logger: ({ level, message, context }) => {
      console.log(`[my-app] ${level}: ${message}`, context);
    },
  },
});
```

Sensitive fields (`access_token`, `id_token`, `password`) and the `Authorization` header are always redacted.

## Repository

https://github.com/Ticker-Events/apis.tiqr
