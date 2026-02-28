import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import rehypeExternalLinks from "rehype-external-links"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"

export default defineConfig({
  devToolbar: { enabled: false },
  site: "https://nathanbabcock.dev",
  integrations: [react(), mdx(), sitemap()],
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
