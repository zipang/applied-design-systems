# AGENTS.md — Theme Editor

Rules for AI agents that work in `tools/theme-editor/`. The root `AGENTS.md` still
applies; these rules add the tool's conventions.

## What this tool is

A Bun + React + Radix application that edits and previews our Design System contract. It
is a first-class tool, not a demo. Every element comes from our component library, and
every style consumes a design token.

## Layout

```
DESIGN.md            the tool's own Design System (source of truth for its chrome)
design-tokens.css    the tool's own tokens as CSS variables
index.html           HTML entrypoint
tsconfig.json        standalone TypeScript config with the import aliases
src/
  server.tsx         Bun server: HTML entry, /api/theme read + save
  main.tsx           React entrypoint; injects the tool theme at runtime
  App.tsx            composes the toolbar, section nav, and scoped preview host
  components/        our UI library (see src/components/AGENTS.md)
  lib/               pure contract logic (design-system, contract, validate, theme-api, directories)
  styles/            shared, theme-agnostic stylesheets
```

## Rules

- Follow `src/AGENTS.md` for all TypeScript in this package.
- Follow `src/components/AGENTS.md` for everything under `src/components/`.
- **The token list is fixed.** `src/lib/design-system.ts` is the registry; do not add a
  token without updating the skill first.
- **Preview is scoped.** The edited theme applies under `[data-ds-preview]` only. Never
  apply edited tokens to `:root` — that would restyle the tool's chrome.
- **Contract logic is pure and tested.** `src/lib/` holds no React and no DOM. Keep it
  that way; the server and the client both use it.
- Component rendering tests are intentionally omitted (see `src/components/AGENTS.md`).
- Run `bun run check`, `bun run typecheck`, and `bun test` before committing.

## Commands

```
Install:  bun install                                  # from the repo root (workspaces)
Dev:      bun run --cwd tools/theme-editor dev
Build:    bun run --cwd tools/theme-editor build
Check:    bun run check
Test:     bun test
```

The dev server listens on port `4444` by default (override with `PORT`).
