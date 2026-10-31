import { defineConfig } from "cf/config"

export default defineConfig({
  worker: {
    name: "blog",
    compatibilityDate: "2026-02-28",
    compatibilityFlags: ["nodejs_compat", "global_fetch_strictly_public"],
    observability: {
      enabled: true,
    },
  },
})
