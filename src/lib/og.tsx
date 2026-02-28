import satori from "satori"
import { Resvg, initWasm } from "@resvg/resvg-wasm"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const fontsDir = resolve(process.cwd(), "src/assets/fonts")
const loraRegular = readFileSync(resolve(fontsDir, "Lora-Regular.ttf"))
const loraBold = readFileSync(resolve(fontsDir, "Lora-Bold.ttf"))

let wasmInitialized = false

export async function generateOgImage(title: string, date?: string) {
  if (!wasmInitialized) {
    const wasmPath = resolve(process.cwd(), "node_modules/@resvg/resvg-wasm/index_bg.wasm")
    await initWasm(readFileSync(wasmPath))
    wasmInitialized = true
  }

  const svg = await satori(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        backgroundColor: "#191614",
        padding: "60px 72px",
        fontFamily: "Lora",
        gap: "36px",
      }}
    >
      <div
        style={{
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
        }}
      >
        N
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div
          style={{
            fontSize: "48px",
            fontWeight: 700,
            color: "#c49a6c",
            lineHeight: 1.3,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            gap: "12px",
            fontSize: "22px",
            color: "#8a7e72",
          }}
        >
          {date && (
            <>
              <span>{date}</span>
              <span>{"\u00b7"}</span>
            </>
          )}
          <span>https://nathanbabcock.dev</span>
        </div>
      </div>
    </div>,
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
