import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "FinAgent Owl",
  version: "0.1.1",
  description: "Read FinAgent IndexedDB and copy the matching agent-dump command.",
  permissions: ["activeTab", "scripting"],
  action: {
    default_title: "FinAgent Owl",
    default_popup: "src/popup/index.html",
    default_icon: {
      "16": "icons/icon-16.png",
      "32": "icons/icon-32.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png",
    },
  },
  icons: {
    "16": "icons/icon-16.png",
    "32": "icons/icon-32.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png",
  },
});
