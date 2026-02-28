import { getCollection } from "astro:content"
import { generateOgImage } from "../../lib/og"
import type { APIRoute, GetStaticPaths } from "astro"

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection("blog")
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }))
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as any
  const date = post.data.date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Chicago",
  })
  const png = await generateOgImage(post.data.title, date)
  return new Response(png, { headers: { "Content-Type": "image/png" } })
}
