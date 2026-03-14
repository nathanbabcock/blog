import { defineConfig, fontProviders } from "astro/config"
import react from "@astrojs/react"
import mdx from "@astrojs/mdx"
import sitemap from "@astrojs/sitemap"
import rehypeExternalLinks from "rehype-external-links"
import rehypeSlug from "rehype-slug"
import rehypeAutolinkHeadings from "rehype-autolink-headings"

import cloudflare from "@astrojs/cloudflare";

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

  fonts: [{
    provider: fontProviders.local(),
    name: "Lora",
    cssVariable: "--font-lora",
    options: {
      variants: [
        { src: ["./src/assets/fonts/Lora-Regular.ttf"], weight: "400", style: "normal" },
        { src: ["./src/assets/fonts/Lora-Bold.ttf"], weight: "700", style: "normal" },
      ],
    },
  }],

  adapter: cloudflare({ imageService: "compile", prerenderEnvironment: "node" }),
})