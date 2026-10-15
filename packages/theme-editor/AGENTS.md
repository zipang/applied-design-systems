# AGENTS.md — Theme Editor

Rules for AI agents that work in `packages/theme-editor/`. The root `AGENTS.md` still
applies; these rules add the tool's conventions.

## What this tool is

A Bun + React + Radix application that edits and previews our Design System contract. It
is a first-class tool, not a demo. Every element comes from our component library, and
every style consumes a design token. It is published as
`@applied-design-systems/theme-editor`.

## Layout

```
DESIGN.md            the tool's own Design System (source of truth for its chrome)
design-tokens.css    the tool's own tokens as CSS variables
index.html           HTML entrypoint (loads src/main.tsx through a relative path)
tsconfig.json        standalone TypeScript config with the import aliases
src/
  server.tsx         Bun server: HTML entry, /api/theme read + save; the package bin
  main.tsx           React entrypoint; injects the tool theme at runtime
  App.tsx            composes the toolbar, section nav, and scoped preview host
  components/        our UI library (see src/components/AGENTS.md)
  lib/               editor logic: store, API client, paths, browser storage
  styles/            shared, theme-agnostic stylesheets
```

## Rules

- Follow `src/AGENTS.md` for all TypeScript in this package.
- Follow `src/components/AGENTS.md` for everything under `src/components/`.
- **The contract core is a package.** The token registry, the parse/serialize code, the
  validator, the type scale, and the contrast derivation live in
  `@applied-design-systems/design-tokens`. Import them by package name. Keep only
  DOM/React/`node:fs` logic in `src/lib/`.
- **The token list is fixed.** The registry is `design-system.ts` in that package; do not
  add a token without updating the skill first.
- **Preview is scoped.** The edited theme applies under `[data-ds-preview]` only. Never
  apply edited tokens to `:root` — that would restyle the tool's chrome.
- **The published package stays self-contained.** `files` ships `src`, `index.html`,
  `DESIGN.md`, `design-tokens.css`, and `tsconfig.json`. Bun resolves the import aliases
  from that tsconfig and the HTML script from `index.html` at runtime. Therefore both must
  ship, and neither may reference a path outside the package. Do not use `extends` above the
  package root. Do not use a leading `/` in the script path.
- **`src/server.tsx` is the bin.** It carries the `#!/usr/bin/env bun` shebang and is what
  `bunx theme-editor` runs.
- Component rendering tests are intentionally omitted (see `src/components/AGENTS.md`).
- Run `bun run lint`, `bun run typecheck`, and `bun test` before committing.

## Commands

```
Install:  bun install                         # from the repo root (workspaces)
Run:      bunx theme-editor                   # from anywhere in the repo
Dev:      bun run --cwd packages/theme-editor dev
Start:    bun run --cwd packages/theme-editor start
Lint:     bun run lint
Format:   bun run format
Test:     bun test
```

The dev server listens on port `4444` by default (override with `PORT`).
