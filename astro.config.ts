import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import sitemap from "@astrojs/sitemap"
import rehypeExternalLinks from "rehype-external-links"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"

export default defineConfig({
  site: "https://nathanbabcock.dev",
  integrations: [react(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: "vitesse-dark",
    },
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "prepend", properties: { class: "heading-link", ariaHidden: true, tabIndex: -1 } }],
      [rehypeExternalLinks, { target: "_blank", rel: ["noopener", "noreferrer"] }],
    ],
  },
})
