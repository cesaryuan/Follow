// @ts-check
import { defineConfig } from "eslint-config-hyoban"

export default defineConfig(
  {
    stylistic: {
      quotes: "double",
      arrowParens: true,
      braceStyle: "1tbs",
      lineBreak: "after",
    },
    lessOpinionated: true,
    ignores: ["src/renderer/src/hono.ts"],
  },
  {
    settings: {
      tailwindcss: {
        callees: ["cn"],
        whitelist: [
          "center",
        ],
      },
    },
  },
)
