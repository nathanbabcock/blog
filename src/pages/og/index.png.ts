import { generateOgImage } from "../../lib/og"
import type { APIRoute } from "astro"

export const GET: APIRoute = async () => {
  const png = await generateOgImage("Nathan Babcock", "Web dev blog")
  return new Response(png, { headers: { "Content-Type": "image/png" } })
}
