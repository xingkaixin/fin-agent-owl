# Changelog

All notable changes to this project will be documented in this file.

## [0.1.3] - 2026-03-28

### Changed

- Migrated the extension build pipeline from `@crxjs/vite-plugin` to `WXT`.
- Replaced the custom `package` archive flow with `wxt zip`, keeping build output under `dist/`.
- Moved the popup entrypoint to the WXT entrypoint layout and generated the extension manifest from `wxt.config.ts`.
- Upgraded direct runtime and build dependencies to their latest stable versions.

## [0.1.2] - 2026-03-03

### Added

- Added launcher selector support for the generated `agent-dump` command, including installed binary, `npx`, `bunx`, `uvx`, and `pipx run`.

## [0.1.1] - 2026-03-02

### Added

- Added `markdown` and `raw` output formats to the generated `agent-dump` command alongside `json`.

## [0.1.0] - 2026-03-01

### Added

- Initialized the Chrome extension project with Bun, React, Vite, Tailwind CSS, shadcn/ui, oxlint, and oxfmt.
- Added IndexedDB lookup flow for resolving `sessionId` from the current page `channelId`.
- Added popup UI for generating and copying the `agent-dump` command.
- Added local Roboto Mono font assets for popup rendering.
- Added icon generation script from `public/logo.svg`.
- Added package script to build and export a zip archive.
- Added MIT license, README, and changelog documentation.
