import { defineCollection, z } from "astro:content"
import { glob } from "astro/loaders"

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.union([z.string(), z.date()]).transform((d) => {
      const s = d instanceof Date ? d.toISOString().split("T")[0] : d
      return new Date(s + "T12:00:00-06:00")
    }),
  }),
})

export const collections = { blog }
