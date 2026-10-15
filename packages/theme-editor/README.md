# Theme Editor

It creates, edits, previews, and saves a Design System as the `DESIGN.md` +
`design-tokens.css` contract. It uses Bun, React, and Radix UI, and it renders with our own
components and design tokens. It uses no Tailwind and no shadcn.

The package is published as `@applied-design-systems/theme-editor`. It runs on the contract
core in [`@applied-design-systems/design-tokens`](../design-tokens/README.md): parsing,
serialization, validation, the token registry, and the contrast derivation.

## What it does

- **Edits the fixed token list.** Every token from the `design-system-tokens` skill has
  an editor: typography (families, size scale, weights, line heights, letter spacing),
  colors (brand, action, text, surface) with derived `muted`/`active` variants, spacing
  (`xs`–`xxl`), shapes (`rounded`, `border`, `elevation`), and the component gallery.
  Each typographic style (`base`, `display`, `mono`) selects its weight and line-height
  token; the same control edits that token's value.
- **Previews in scope.** The edited theme is serialized and applied under
  `[data-ds-preview]`, so the preview updates while the tool's own chrome keeps its
  tokens.
- **Reads and writes the contract.** A Bun server reads and writes `DESIGN.md` and
  `design-tokens.css` under a project directory, validating against the section 10 rules
  before it saves. The generated stylesheet opens with a Google Fonts `@import` for the
  families the theme uses, so the `--font-family-*` tokens resolve. The `…` button beside
  the directory field opens a server-backed folder picker, so the path is chosen rather
  than typed.
- **Saves locally too.** Without a project directory, Save stores the theme in this
  browser under a name. Load offers both sources — the project directory on disk, or the
  saved themes in this browser — so you choose where the contract comes from. The active
  theme is restored on the next visit.
- **Stays honest.** Every value consumes a token; the fixed list is the same one the
  skill documents.

## Commands

```
Install:    bun install                         # from the repo root (workspaces)
Run:        bunx theme-editor                   # from anywhere in the repo
Run:        bunx @applied-design-systems/theme-editor   # from the npm registry
Dev:        bun run --cwd packages/theme-editor dev
Start:      bun run --cwd packages/theme-editor start
Typecheck:  bun run --cwd packages/theme-editor typecheck
```

The dev server also exposes the theme API: `GET /api/theme?dir=<project>`,
`POST /api/theme`, `GET /api/dirs?path=<dir>` (the folder picker's directory listing),
and `GET /api/system` (the host home and working directory).

The server listens on `http://localhost:4444` by default. Set `PORT` to override it
(for example `PORT=5555 bun run theme-editor:dev`).

## Layout

```
DESIGN.md                 the tool's own Design System
design-tokens.css         the tool's own tokens as CSS variables
index.html                HTML entry; loads src/main.tsx through a relative path
tsconfig.json             compiler options plus the @components/@lib/@styles aliases
src/server.tsx            Bun server: HTML entry + theme API; the package bin
src/App.tsx               shell: toolbar, section nav, scoped preview host
src/lib/                  editor logic: store, API client, paths, browser storage
src/components/editor/    toolbar, fields, token reference, issues
src/components/preview/   the five preview + editor sections
src/components/base|ui|layout/   our component library (from radix-ui-starter)
```

`index.html` and `tsconfig.json` are part of the published package on purpose: Bun resolves
the HTML's script path and the import aliases from them at runtime, so both must ship.

See `AGENTS.md` for the rules that apply in this package.
