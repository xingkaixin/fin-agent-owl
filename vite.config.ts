import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { crx } from "@crxjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import manifest from "./src/manifest.config";

const srcDirectory = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss(), crx({ manifest })],
  resolve: {
    alias: {
      "@": resolve(srcDirectory),
    },
  },
});
