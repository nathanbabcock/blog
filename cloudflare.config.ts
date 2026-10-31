import { defineConfig } from "cf/config"

export default defineConfig({
  accountId: "ce773757730662b72f4a8b108c721dd0",
  worker: {
    name: "blog",
    compatibilityDate: "2026-02-28",
    compatibilityFlags: ["nodejs_compat", "global_fetch_strictly_public"],
    observability: {
      enabled: true,
    },
  },
})
