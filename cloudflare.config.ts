import { defineConfig } from "cf/config"

export default defineConfig({
  accountId: "ce773757730662b72f4a8b108c721dd0",
  worker: {
    name: "blog",
    previewUrls: false,
    compatibilityDate: "2026-10-31",
    compatibilityFlags: ["global_fetch_strictly_public"],
    observability: {
      enabled: true,
    },
  },
})
