import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    browser: "src/browser.ts",
    "storefront/index": "src/storefront/index.ts",
    "admin/index": "src/admin/index.ts",
    "shared/index": "src/shared/index.ts",
    "participant/index": "src/participant/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
});
