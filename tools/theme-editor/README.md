# Theme Editor

An in-repo tool that creates, edits, previews, and saves a Design System as the
`DESIGN.md` + `design-tokens.css` contract. It is built with Bun, React, and Radix UI,
and it renders itself with our own components and design tokens — no Tailwind, no
shadcn.

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
  before it saves. The `…` button beside the directory field opens a server-backed
  folder picker, so the path is chosen rather than typed.
- **Saves locally too.** Without a project directory, Save stores the theme in this
  browser under a name. Load offers both sources — the project directory on disk, or the
  saved themes in this browser — so you choose where the contract comes from. The active
  theme is restored on the next visit.
- **Stays honest.** Every value consumes a token; the fixed list is the same one the
  skill documents.

## Commands

```
Install:    bun install                                   # from the repo root (workspaces)
Dev:        bun run --cwd tools/theme-editor dev
Build:      bun run --cwd tools/theme-editor build
Typecheck:  bun run --cwd tools/theme-editor typecheck
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
ui-theme-overrides.css    the theme contrast layer
src/server.tsx            Bun server: HTML entry + theme API
src/App.tsx               shell: toolbar, section nav, scoped preview host
src/lib/                  pure contract logic (model, parse, serialize, validate)
src/components/editor/    toolbar, fields, token reference, issues
src/components/preview/   the five preview + editor sections
src/components/base|ui|layout/   our component library (from radix-ui-starter)
```

See `AGENTS.md` for the rules that apply in this package.
