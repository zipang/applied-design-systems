# Spec: T0012 Publish the Design System tooling to npm as two packages

## Restate of intent

- **Outcome:** The repository ships two npm packages under the scope
  `@applied-design-systems`:
  - **`@applied-design-systems/design-tokens`** — the pure core: the fixed token registry,
    the `DESIGN.md` / `design-tokens.css` contract parser and serializer, the section 10
    validator, and the WCAG contrast derivation. It is the "validation methods" made public.
  - **`@applied-design-systems/theme-editor`** — the Bun + React editor, with a `bin` so
    `bunx @applied-design-systems/theme-editor` starts it with no clone and no global
    install. It depends on the core.
  The root `README.md` describes both, and a new `packages/README.md` indexes the folder.
- **User:** the developer who runs the editor through `bunx` and imports the validators, and
  the AI agent that needs headless contract validation. Humans second.
- **Why now:** the editor cannot be published as-is — `validate.ts` and `theme-store.ts`
  import `../../../color-contrast` and `../../../contrast-tokens`, files outside the package
  directory that no npm tarball can contain. The validation logic has no public entry, and
  the root README still calls `packages/` a *planned* validator.
- **Success:** both packages publish under the scope; `bunx
  @applied-design-systems/theme-editor` starts the editor from anywhere;
  `@applied-design-systems/design-tokens` exports `validateContract`, `parseContract`,
  `serializeDesignMd`, `updateThemeContrastTokens`, and the token registry with their types;
  the docs describe both; all gates pass.
- **Constraint:** no compiled binaries and no prebuilt bundles — the packages ship TypeScript
  source and run under Bun. The token list is fixed; the contract logic stays pure (no React,
  no DOM, no `node:fs`). Publishing rewrites `workspace:*` to an exact version, so the two
  packages release in lockstep.
- **Out of scope:** a CI publish workflow, Node.js compatibility for the core, renaming the
  demo package, and any change to the editor UI, its tokens, or its behavior.

## Prerequisite (outside the repository)

The npm scope **`@applied-design-systems` must exist** before any publish succeeds, and the
publisher must be authenticated (`bunx npm login`, or an `NPM_TOKEN` for CI). Until then,
`bun publish --dry-run` is the only runnable step. Creating the scope is a one-time manual
action, not a code change.

## Objective

### Two packages, one dependency direction

```
@applied-design-systems/design-tokens   (pure core, no React/DOM/node:fs)
        ▲
        │  workspace:* → exact version on publish
        │
@applied-design-systems/theme-editor    (Bun + React app, bin "theme-editor")
```

`packages/design-tokens/` is new. It receives, from today's `packages/` root and
`packages/theme-editor/src/lib/`:

| Module | Today | Why it is core |
|---|---|---|
| `design-system.ts` | editor `src/lib` | the fixed token registry and path ↔ variable map |
| `fonts.ts` | editor `src/lib` | the font catalog the parser and validator read |
| `scale.ts` | editor `src/lib` | the type-scale math over the token contract |
| `contrast.ts` | editor `src/lib` | WCAG helpers used by the preview and the validator |
| `contract.ts` | editor `src/lib` | parse and serialize both halves of the contract |
| `validate.ts` | editor `src/lib` | the section 10 validation rules |
| `color-contrast.ts` | `packages/` root | WCAG 2.1 helpers over `Rgb` |
| `contrast-tokens.ts` | `packages/` root | the `--color-on-*` derivation |

Each module keeps its colocated `*.test.ts`. The editor keeps everything that touches the
DOM, React, or Bun's filesystem: `clsx`, `common-props`, `apply-preview`, `paths`,
`system-info`, `directories`, `theme-api`, `local-themes`, `theme-store`, `app-state`, and
`scroll/`. `apply-preview.ts`, `theme-api.ts`, `theme-store.ts`, and the `Preview`,
`TokenReference`, and `FontPicker` components import the core by package name.

### The core's public API

`packages/design-tokens/src/index.ts` is the single public entry. It exports the token registry
(`TOKENS`, `tokenByVariable`, `groupTokens`, `TokenValues`, …), the contract API
(`parseDesignMd`, `parseContract`, `serializeDesignMd`, `serializeTokensCss`, `Contract`),
the validator (`validateContract`, `Issue`, `ValidationInput`), and the contrast API
(`contrastRatio`, `parseHex`, `updateThemeContrastTokens`, `CONTRAST_TOKENS`, `AA_NORMAL`,
`contrastLevel`, …). JSDoc stays mandatory on every export.

### `bunx` for the editor

`bunx` runs a package executable, preferring a linked `node_modules/.bin` and otherwise the
registry. So the editor:

- declares `"bin": { "theme-editor": "./src/server.tsx" }` and `src/server.tsx` gains the
  shebang `#!/usr/bin/env bun` as its first line;
- is declared in the root `devDependencies` so `bun install` links it locally;
- is published with `files` that include `src`, `index.html`, `DESIGN.md`, and
  `design-tokens.css` — the four inputs the runtime reads.

After publishing, `bunx @applied-design-systems/theme-editor` works with no clone.

### Publish metadata (both packages)

`private` is removed. Each package gains `version` (`0.1.0`), `description`, `license`
(MIT), `repository` (`.../applied-design-systems.git` with its `directory`), `files`,
`publishConfig.access: "public"`, and `engines.bun`. `private: true` currently blocks
`bun publish` outright. `bun publish --dry-run` lists the tarball; it was confirmed to honor
`files` and the `!src/**/*.test.ts` exclusion, and `workspace:*` is rewritten to the exact
version, so the core is published before the editor and both carry the same version.

## Tech stack

Unchanged: Bun 1.4.x workspaces, React + Radix UI, token-only CSS, TypeScript,
`yaml`. New: the npm registry as a distribution channel.

## Commands

```
Install:        bun install
Lint:           bun run lint      # oxlint
Format:         bun run format    # oxfmt
Typecheck:      bun run typecheck
Test:           bun test
Dev:            bun run --cwd packages/theme-editor dev
Run (repo):     bunx theme-editor
Run (registry): bunx @applied-design-systems/theme-editor
Pack (dry run): bun publish --dry-run --cwd packages/design-tokens
Publish core:   bun publish --cwd packages/design-tokens
Publish editor: bun publish --cwd packages/theme-editor
```

## Project structure

```
.oxlintrc.json                        new: oxlint plugins, rules, and ignore paths
.oxfmtrc.json                         new: oxfmt options (tabs, tabWidth 4, printWidth 100)
.opencode/opencode.jsonc              new: enable the built-in oxfmt formatter after edits
tools/oxlint/code-quality.ts          the local oxlint plugin (require-exported-jsdoc, padding)
packages/README.md                    new: folder index (both packages)
packages/design-tokens/               new: published pure core
  package.json                        publish metadata; dep: yaml
  tsconfig.json                       standalone config
  README.md                           npm readme
  src/index.ts                        public API
  src/{design-system,fonts,scale,contrast,contract,validate,color-contrast,contrast-tokens}.ts
  src/*.test.ts                       the moved tests
packages/theme-editor/package.json    rename; bin; core dependency; metadata
packages/theme-editor/src/server.tsx  add the bun shebang (bin target)
packages/theme-editor/src/lib/        only DOM/React/Bun modules remain
demos/radix-ui-starter/package.json   depend on the core
demos/radix-ui-starter/src/lib/theme/contract.test.ts   import the core by name
README.md                             describe both packages + bunx + bootstrap
package.json                          editor devDependency; lint/format/check scripts
```

## Code style

The core's entry only re-exports, and the package name replaces the path aliases:

```ts
// packages/design-tokens/src/index.ts

/** Public API of the Design System token contract. Pure: no React, no DOM, no node:fs. */
export { TOKENS, tokenByVariable, type TokenValues } from "./design-system";
export { parseContract, serializeDesignMd, type Contract } from "./contract";
export { validateContract, type Issue } from "./validate";
export { updateThemeContrastTokens, CONTRAST_TOKENS } from "./contrast-tokens";
```

```ts
// packages/theme-editor/src/lib/theme-api.ts (after the move)
import { type Contract, parseContract, type Issue, validateContract } from "@applied-design-systems/design-tokens";
```

JSDoc is mandatory on every exported symbol. Inside the core, imports stay relative.

## Testing strategy

- **Moved tests move too.** Every relocated module keeps its colocated test; `bun test`
  covers the core exactly as it covers the editor today.
- **A consumer test.** `demos/radix-ui-starter` imports the core by package name (replacing
  its `../../../../../packages/contrast-tokens` reach-in), which proves the `exports` map from a
  real second package.
- **Gates.** `bun run lint`, `bun run typecheck` (now including the core), and `bun test`.
- **Pack.** `bun publish --dry-run` for both packages lists exactly the runtime files, shows
  no `*.test.ts`, and rewrites `workspace:*` to `0.1.0`.
- **`bunx`.** After `bun install`, `bunx theme-editor` starts the editor from the repo root
  and a nested directory; `PORT` is honored; a load/save round-trip works.
- **Registry smoke test (post-publish, human-gated).** In an empty directory, `bunx
  @applied-design-systems/theme-editor` and a one-line `import` of the core both succeed.
- Component rendering tests stay out of scope, as documented.

## Boundaries

- **Always:** keep the core free of React, the DOM, and `node:fs`; import the core by package
  name from every consumer; run the three gates; keep the shebang the first line of the bin
  target; version the two packages together.
- **Ask first:** shipping JavaScript instead of TypeScript to npm; a CI publish workflow;
  making the demo package public; changing the bin or package names.
- **Never:** publish with `private: true`; reach above a package root from inside it; commit
  a tarball or build artifact; add a runtime dependency the core does not need; change token
  values or the editor UI; duplicate documentation that already lives in a package README.

## Success criteria

- [x] `packages/design-tokens/` is self-contained; nothing under it imports above its root.
- [x] `@applied-design-systems/design-tokens` exports the token, contract, validation, and
      contrast APIs with their types.
- [x] `@applied-design-systems/theme-editor` declares the `bin`; `bunx theme-editor` starts
      it from the repo root and from a nested directory.
- [x] Both packages remove `private`, carry the publish metadata, and pass
      `bun publish --dry-run` with the expected file list.
- [x] `packages/README.md` indexes both packages and documents the validation API; the root
      `README.md` describes them and its layout names both packages.
- [x] The directory is `packages/`; every workspace, script, layout, and
      `repository.directory` reference uses that path.
- [x] `oxlint` and `oxfmt` replace Biome; `bun run lint` reports zero findings, and
      `bun run format` leaves no change; the published `package.json` files and the
      distributable skill reference CSS stay out of the formatter's reach. OpenCode formats
      every file its `write`, `edit`, and `patch` tools change, so `oxfmt --check` is never
      needed.
- [x] `bun run lint`, `bun run typecheck`, and `bun test` pass.

## Open questions

1. **TypeScript on npm.** *Resolved:* the packages ship `.ts` sources and run under Bun
   (`engines.bun`).
2. **Version policy.** *Resolved:* both packages publish `0.1.0` in lockstep; `workspace:*`
   becomes an exact pin.
3. **Registry.** *Resolved:* public npm under `@applied-design-systems`.
4. **The `build` script.** *Resolved:* removed.
