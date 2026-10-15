# AGENTS.md — Radix UI Starter

Rules for AI agents that work in this demo. The root `AGENTS.md` still applies; these
rules add the demo's conventions.

## What this demo is

A themeable chat application that applies the Design Systems Applied token contract on
top of Radix UI. It is a reference, not a mockup: agents copy its patterns. Every UI
element comes from our own component library, and every style consumes a design token.

## Layout

```
DESIGN.md            reserved for the demo's Design System (added with the themes)
index.html           HTML entrypoint
tsconfig.json        standalone TypeScript config with the import aliases
src/
  server.tsx         Bun dev server (HTML import)
  main.tsx           React entrypoint
  App.tsx            composes the page shell and switches pages
  components/        our UI library (see src/components/AGENTS.md)
  lib/               pure logic (clsx, eliza, theme, scroll) with colocated tests
  styles/            shared, theme-agnostic stylesheets
themes/<name>/       one complete Design System per theme (DESIGN.md + design-tokens.css)
```

## Rules for this demo

- Follow `src/AGENTS.md` for all TypeScript in this demo.
- Follow `src/components/AGENTS.md` for everything under `src/components/`.
- Component rendering tests are intentionally omitted: Radix UI primitives are already
  tested upstream, and this library only adds styling. Test pure logic and the token
  contract instead. This is the documented exception to the root rule "one test per
  source" (see `roadmap/T0002/spec.md`).
- Each theme is a complete Design System. Keep each `DESIGN.md` and its
  `design-tokens.css` identical.
- No raw colors, sizes, or radii in component CSS. Use `var(--token)` only.
- No raw `h1`–`h6` or `p`. Use `base/Heading` and `base/Text`.

## Commands

```
Install:  bun install                                  # from the repo root (workspaces)
Dev:      bun run --cwd demos/radix-ui-starter dev
Build:    bun run --cwd demos/radix-ui-starter build
Lint:     bun run lint
Format:   bun run format
Test:     bun test
```

The `dev` server runs `bun --hot` with React Fast Refresh. The root `react-refresh`
devDependency enables it: Bun detects React at the workspace root, while the isolated
install keeps React in this package's `node_modules`. Without it, Bun disables Fast
Refresh and every edit reloads the page. Do not remove it.
