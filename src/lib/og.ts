import satori from "satori"
import { Resvg } from "@resvg/resvg-js"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const fontsDir = resolve(process.cwd(), "src/assets/fonts")
const loraRegular = readFileSync(resolve(fontsDir, "Lora-Regular.ttf"))
const loraBold = readFileSync(resolve(fontsDir, "Lora-Bold.ttf"))

export async function generateOgImage(title: string, date?: string) {
  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#191614",
          padding: "60px 72px",
          fontFamily: "Lora",
          gap: "36px",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "140px",
                height: "140px",
                backgroundColor: "#000",
                borderRadius: "16px",
                fontSize: "96px",
                fontWeight: 700,
                color: "#c49a6c",
                lineHeight: 1,
                paddingTop: "8px",
              },
              children: "N",
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      fontSize: "48px",
                      fontWeight: 700,
                      color: "#c49a6c",
                      lineHeight: 1.3,
                    },
                    children: title,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      gap: "12px",
                      fontSize: "22px",
                      color: "#8a7e72",
                    },
                    children: [
                      ...(date
                        ? [
                            { type: "span", props: { children: date } },
                            { type: "span", props: { children: "\u00b7" } },
                          ]
                        : []),
                      { type: "span", props: { children: "https://nathanbabcock.dev" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Lora", data: loraRegular, weight: 400, style: "normal" },
        { name: "Lora", data: loraBold, weight: 700, style: "normal" },
      ],
    }
  )

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } })
  return new Uint8Array(resvg.render().asPng())
}
