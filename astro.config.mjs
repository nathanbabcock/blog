import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import rehypeExternalLinks from "rehype-external-links"

export default defineConfig({
  site: "https://nathanbabcock.dev",
  integrations: [react()],
  markdown: {
    rehypePlugins: [
      [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }],
    ],
  },
})
