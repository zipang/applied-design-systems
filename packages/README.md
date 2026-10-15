# Packages

Two Bun packages live here. Both are published to npm under the `@applied-design-systems`
scope.

```
design-tokens/    @applied-design-systems/design-tokens    the pure core
theme-editor/     @applied-design-systems/theme-editor     the editor application
```

The editor depends on the core; the core never imports the editor.

## Theme Editor

Creates, edits, previews, and saves an Applied Design Systems contract. See
[`theme-editor/README.md`](theme-editor/README.md) for what it does and how it works.

```sh
bun install                                   # one-time repo bootstrap, from the repo root
bunx theme-editor                             # run it from anywhere in the repo
bunx @applied-design-systems/theme-editor     # or straight from the npm registry
```

The server listens on `http://localhost:4444`. Set `PORT` to override it.

## Design tokens (the validation tools)

The core parses, serializes, and validates the `DESIGN.md` + `design-tokens.css` pair. It
holds the fixed token registry and derives the `--color-on-*` contrast tokens. It is pure:
no React, no DOM, no filesystem.

```sh
bun add @applied-design-systems/design-tokens
```

```ts
import { parseContract, validateContract } from "@applied-design-systems/design-tokens";

const contract = parseContract(designMd, tokensCss);
const issues = validateContract(contract);
```

See [`design-tokens/README.md`](design-tokens/README.md) for the full API.

## Publishing

Both packages are public. `bun publish` rewrites `workspace:*` to the exact version. The two
packages release in lockstep, so publish the core first.

1. Create the `applied-design-systems` organization at
   <https://www.npmjs.com/org/create>. The organization name is the scope, so npm then
   reserves `@applied-design-systems`. Choose the free "Unlimited public packages" plan.
   Publishing fails without this scope.
2. Authenticate the CLI with `bunx npm login`. Publishing also needs two-factor
   authentication on the account, or a granular access token with "bypass 2FA" for CI.
3. Inspect what will ship: `bun publish --dry-run --cwd packages/design-tokens` and
   `bun publish --dry-run --cwd packages/theme-editor`.
4. Publish the core, then the editor, at the same version:

   ```sh
   bun publish --cwd packages/design-tokens && bun publish --cwd packages/theme-editor
   ```

`publishConfig.access` is `public` in both packages, so no `--access public` flag is needed.
A scoped package is private by default, and the first publish is what sets it public.

See the root `README.md` for the repository layout and each `AGENTS.md` for the rules.
