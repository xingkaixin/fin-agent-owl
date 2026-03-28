import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";
import packageJson from "./package.json";

export default defineConfig({
  srcDir: "src",
  entrypointsDir: "entrypoints",
  outDir: "dist",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "FinAgent Owl",
    version: packageJson.version,
    description: "Read FinAgent IndexedDB and copy the matching agent-dump command.",
    permissions: ["activeTab", "scripting"],
    action: {
      default_title: "FinAgent Owl",
      default_icon: {
        "16": "/icons/icon-16.png",
        "32": "/icons/icon-32.png",
        "48": "/icons/icon-48.png",
        "128": "/icons/icon-128.png",
      },
    },
    icons: {
      "16": "/icons/icon-16.png",
      "32": "/icons/icon-32.png",
      "48": "/icons/icon-48.png",
      "128": "/icons/icon-128.png",
    },
  },
  alias: {
    "@": resolve("src"),
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
