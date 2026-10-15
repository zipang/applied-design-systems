# Implementation Plan: T0012 Publish the Design System tooling to npm as two packages

## Overview

Split the token tooling into two published npm packages under `@applied-design-systems`.
First extract the pure core — the token registry, contract parser/serializer, section 10
validator, and WCAG contrast derivation — into a new `packages/design-tokens/` workspace package
and repoint every consumer at it. Then rename the editor package, give it a `bin` so
`bunx theme-editor` runs it, add full publish metadata to both packages, and verify the
tarballs with `bun publish --dry-run`. Finish by documenting both packages: a new
`packages/README.md` index and root `README.md` updates. The actual `bun publish` is human-gated
because the `@applied-design-systems` npm scope must be created first.

## Architecture Decisions

- **The dependency points one way.** `@applied-design-systems/theme-editor` depends on
  `@applied-design-systems/design-tokens`; the core never imports the editor. That is what
  makes the core reusable and the editor self-contained.
- **The core is pure by contract.** No React, no DOM, no `node:fs` — only `yaml` and its own
  modules. This is the rule that keeps it publishable and importable by agents and other
  tools.
- **Two consumers prove the API.** The demo package and the editor both import the core by
  package name, so the `exports` map is exercised from a real second workspace.
- **No red window.** The extraction is done as move-and-repoint in two coherent slices, each
  of which leaves `bun test` green, rather than moving everything and fixing imports later.
- **`bunx` runs a linked bin.** Verified against Bun 1.4.3: a workspace package's `bin` is
  linked into `node_modules/.bin` only when a workspace member declares it as a dependency;
  `bunx` then runs it locally and falls back to the registry otherwise. Publishing makes the
  registry path work too, so `bunx @applied-design-systems/theme-editor` needs no clone.
- **Ship source, not a bundle.** The packages publish TypeScript and run under Bun (`engines.bun`).
  No build step, matching the "no compiled binaries" constraint and keeping one source of truth.
- **Release in lockstep.** `workspace:*` is rewritten to the exact version on pack (verified:
  `0.1.0`, not `^0.1.0`), so the editor pins the core. Both packages move to `0.1.0` together.

## Task List

### Phase 1: Extract `@applied-design-systems/design-tokens` (pure core)

- [x] **Task 1: Scaffold the core package**
  - Description: Create `packages/design-tokens/` with a `package.json` (name
    `@applied-design-systems/design-tokens`, `version` `0.1.0`, `type` `module`, `exports`
    `"."` → `./src/index.ts`, `main`/`types`, `files` `["src", "!src/**/*.test.ts"]`,
    `publishConfig.access` `public`, `license` MIT, `repository` with `directory`, `engines`
    `bun`, dependency `yaml`), a `tsconfig.json` extending the root, a `README.md`, and a
    `src/index.ts` placeholder. Add the core to the editor's dependencies
    (`workspace:*`) and to the root `typecheck` chain; exclude `packages/design-tokens` from the
    root `tsconfig.json` like the editor.
  - Acceptance: `bun install` links `node_modules/@applied-design-systems/design-tokens`;
    `bun run typecheck` passes; `bun publish --dry-run --cwd packages/design-tokens` packages the
    placeholder without a `private` error.
  - Verify: `bun install`; `bun run typecheck`; the dry-run pack.
  - Files: `packages/design-tokens/{package.json,tsconfig.json,README.md,src/index.ts}`,
    `packages/theme-editor/package.json`, `package.json`, `tsconfig.json`
  - Depends: None
  - Estimated scope: S (6 files, mostly new)

- [x] **Task 2: Move the token model and the contract into the core**
  - Description: `git mv` `design-system.ts`, `fonts.ts`, `contract.ts` and their tests from
    `packages/theme-editor/src/lib/` into `packages/design-tokens/src/`. Fix the intra-package
    imports (`contract.ts` → `./design-system`, `./fonts`). Export the registry and contract
    API from `src/index.ts`. Repoint every consumer: `lib/validate.ts` (its `./design-system`
    and `./fonts` imports), `lib/apply-preview.ts`, `lib/theme-api.ts`, `lib/theme-store.ts`,
    `components/editor/TokenReference.tsx`, `components/editor/FontPicker.tsx`, and
    `components/preview/Preview.tsx`. Move `yaml` from the editor's dependencies to the core's
    if nothing else in the editor uses it.
  - Acceptance: `bun test` passes; no editor module imports `./design-system`, `./fonts`, or
    `./contract`; the core exposes `TOKENS`, `tokenByVariable`, `groupTokens`, `parseContract`,
    `serializeDesignMd`, `serializeTokensCss`, and `Contract`.
  - Verify: `bun test`; `bun run typecheck`; grep for leftover relative imports of the moved
    modules.
  - Files: moved `design-system.ts`, `fonts.ts`, `contract.ts` (+3 tests);
    `packages/design-tokens/src/index.ts`; `packages/theme-editor/src/lib/{validate,apply-preview,
    theme-api,theme-store}.ts`; `components/editor/{TokenReference,FontPicker}.tsx`;
    `components/preview/Preview.tsx`
  - Depends: Task 1
  - Estimated scope: M (12 files, mostly import lines)

- [x] **Task 3: Move validation and contrast into the core**
  - Description: `git mv` `validate.ts`, `scale.ts`, `contrast.ts` (+tests) from the editor's
    `src/lib/` and `color-contrast.ts`, `contrast-tokens.ts` (+tests) from `packages/` root into
    `packages/design-tokens/src/`. Fix imports: `validate.ts` reads `./color-contrast` and
    `./contrast-tokens`; `contrast-tokens.ts` reads `./color-contrast`. Export the validation
    and contrast APIs from `src/index.ts`. Repoint the remaining consumers: `lib/theme-api.ts`,
    `lib/theme-store.ts`, `components/preview/Preview.tsx`, and
    `demos/radix-ui-starter/src/lib/theme/contract.test.ts` (add the core to the demo's
    dependencies). Delete the now-empty root copies.
  - Acceptance: `packages/` root holds no loose `.ts` files; the editor's `src/lib/` holds only
    DOM/React/Bun modules; the demo imports the core by name; `bun test` passes.
  - Verify: `bun test`; `bun run typecheck`; `bun run lint`; `ls packages/*.ts`.
  - Files: moved `validate.ts`, `scale.ts`, `contrast.ts`, `color-contrast.ts`,
    `contrast-tokens.ts` (+5 tests); `packages/design-tokens/src/index.ts`;
    `packages/theme-editor/src/lib/{theme-api,theme-store}.ts`;
    `components/preview/Preview.tsx`; `demos/radix-ui-starter/package.json` and its
    `src/lib/theme/contract.test.ts`
  - Depends: Task 2
  - Estimated scope: M (13 files, mostly moves and import lines)

### Checkpoint: Core extracted

- [x] `bun run lint`, `bun run typecheck`, and `bun test` pass.
- [x] `packages/design-tokens/` is self-contained and imports nothing above its root.
- [x] Both the editor and the demo consume the core by package name.
- [x] Review with the human before touching package identity.

### Phase 2: Editor package identity, `bunx`, and publish metadata

- [x] **Task 4: Rename the editor, add the bin, and add publish metadata**
  - Description: Rename the editor package to `@applied-design-systems/theme-editor`. Remove
    `private`, set `version` `0.1.0`, and add `bin` (`theme-editor` → `./src/server.tsx`),
    `files` (`src`, `index.html`, `DESIGN.md`, `design-tokens.css`), `publishConfig.access`
    `public`, `license` MIT, `repository` (with `directory`), `description`, and `engines`.
    Add `#!/usr/bin/env bun` as the first line of `src/server.tsx`. Add the editor to the root
    `devDependencies` (`workspace:*`) so the bin links, keeping `@applied-design-systems/design-tokens`
    reachable through it.
  - Acceptance: `bun install` links `node_modules/.bin/theme-editor`; the shebang survives
    formatting; `bun run --cwd packages/theme-editor start` and `bun run --cwd packages/theme-editor
    dev` still work.
  - Verify: `bun install`; `ls -l node_modules/.bin/theme-editor`; `bun run start`; `bun run
    check`.
  - Files: `packages/theme-editor/package.json`, `packages/theme-editor/src/server.tsx`,
    `package.json`
  - Depends: Task 3
  - Estimated scope: S (3 files)

- [x] **Task 5: Verify `bunx` and the publishable tarballs**
  - Description: Exercise the linked bin from the repo root and a nested directory, with a
    `PORT` override, and confirm a theme load/save round-trip. Then run
    `bun publish --dry-run` for both packages and inspect the file lists: the editor tarball
    must carry `src`, `index.html`, `DESIGN.md`, and `design-tokens.css`; both must exclude
    `*.test.ts`; the editor's packed manifest must show the core at the exact `0.1.0`. Fix any
    missing or stray file by adjusting `files`. Note the local `bunx` behavior when the
    package is not yet published (local link only).
  - Acceptance: `bunx theme-editor` serves the editor and `/api/*` from both directories;
    `PORT=5555 bunx theme-editor` listens on 5555; each dry-run pack lists the expected files
    and no `private` error.
  - Verify: the `bunx` runs; `curl http://localhost:4444/api/system`; one load and one save;
    both `bun publish --dry-run` outputs.
  - Files: `packages/theme-editor/package.json`, `packages/design-tokens/package.json` (only if a
    `files` fix is needed)
  - Depends: Task 4
  - Estimated scope: S (0-2 files)

### Checkpoint: Publishable

- [x] `bunx theme-editor` works from the repo root and a nested directory.
- [x] Both packages dry-run pack with the correct files and no `private` error.
- [x] `bun test` passes.

### Phase 3: Documentation

- [x] **Task 6: Create `packages/README.md`**
  - Description: Write the folder index. Introduce the two published packages and their
    dependency direction, then the editor (one-line overview, the `bunx
    @applied-design-systems/theme-editor` run command, a link to `theme-editor/README.md`)
    and the core's public validation API with a short import example. Link to the root README
    and the design-system-tokens skill; do not restate their rules.
  - Acceptance: a reader can name, run, and import both packages from this file alone; no rule
    is duplicated from another document.
  - Verify: apply the `technical-writing` skill; check every relative link resolves.
  - Files: `packages/README.md`
  - Depends: Tasks 1, 3, 4
  - Estimated scope: S (1 file)

- [x] **Task 7: Update the root `README.md`**
  - Description: Build on the current working-tree edits. Fix the layout line that calls
    `packages/` a "planned" validator and update it to name both packages. Add a short "Tools"
    section describing the editor and the core, with the `bunx` command, the one-time
    `bun install` bootstrap note, and a link to `packages/README.md`. Keep the glossary terms
    consistent; change nothing else.
  - Acceptance: the layout reflects reality; the Tools section links to `packages/README.md`;
    the README uses the glossary's terms.
  - Verify: apply the `technical-writing` skill; `git diff README.md` review.
  - Files: `README.md`
  - Depends: Task 6
  - Estimated scope: S (1 file)

- [x] **Task 8: Document each package and its publish procedure**
  - Description: Write `packages/design-tokens/README.md` (what the core exports, the pure-core
    rule, an import example). Extend `packages/theme-editor/README.md` with the `bunx` command
    and the core dependency. Record the publish procedure — create the `@applied-design-systems`
    scope, authenticate, publish the core before the editor, both at the same version — in the
    `packages/README.md` or a short `PUBLISHING` section, and add the AGENTS notes (core purity,
    the public entry, the bin target).
  - Acceptance: each package README states what it exports or how to run it; the publish order
    and the scope prerequisite are written down; the AGENTS files name the purity rule and the
    bin target.
  - Verify: apply the `technical-writing` skill; verify links resolve.
  - Files: `packages/design-tokens/README.md`, `packages/theme-editor/README.md`,
    `packages/theme-editor/AGENTS.md`, `packages/README.md`
  - Depends: Task 6
  - Estimated scope: S (4 files)

### Phase 4: Layout rename (folded into this ticket)

- [x] **Task 9: Rename `tools/` to `packages/`**
  - Description: `git mv tools packages`, then update every live reference: the root
    `workspaces` glob and the three scripts, the root `tsconfig.json` excludes, both
    `repository.directory` fields, the layout blocks in the root `README.md`/`AGENTS.md`, the
    package README/AGENTS files, and `packages/README.md` (title and publish commands). Leave
    the historical tickets untouched: they record what was true at the time.
  - Acceptance: no live reference to `tools/` remains; `bun install` relinks the workspace and
    `node_modules/.bin/theme-editor` points into `packages/`; `bunx theme-editor` serves the
    API and the UI from the repo root and a nested directory; both `bun publish --dry-run`
    packs keep their file lists.
  - Verify: the greps, `bun install`, the three gates, the two `bunx` runs, and both dry-run
    packs.
  - Files: `package.json`, `tsconfig.json`, `README.md`, `AGENTS.md`, `packages/**`
  - Depends: Task 8
  - Estimated scope: S

### Checkpoint: Complete

- [x] All acceptance criteria met; `bun run lint`, `bun run typecheck`, `bun test` pass.
- [x] Docs describe both packages; the publish procedure and prerequisite are recorded.
- [x] The two packages live under `packages/`.
- [x] The lint and format gate runs on oxlint and oxfmt; Biome is gone.
- [ ] Ready for review with the human.

### Phase 5: Toolchain — oxlint and oxfmt replace Biome

- [x] **Task 10: Swap the linter and formatter**
  - Description: Install `oxlint` and `oxfmt`; remove `@biomejs/biome` and `biome.jsonc`.
    Add `.oxlintrc.json` (plugins, the local `code-quality` plugin, `correctness` as error,
    and the repo's ignore paths) and `.oxfmtrc.json` (tabs, `tabWidth` 4, `printWidth` 100,
    double quotes, no trailing commas). Set the scripts to `lint` = `oxlint` and `format` =
    `oxfmt`, with no combined gate. Enable the
    built-in OpenCode `oxfmt` formatter in `.opencode/opencode.jsonc` so every file the
    `write`, `edit`, and `patch` tools change is formatted in place; formatting is applied,
    never checked. Adopt the plugin's `require-exported-jsdoc` and `padding-before-statements` rules and
    fix every finding (575 at the start). Keep `package.json` files and the distributable
    skill reference CSS out of `oxfmt`'s reach. Convert the dead `biome-ignore` comments.
  - Acceptance: `bun run lint`, `bun run typecheck`, and `bun test` pass; `oxlint` reports
    zero findings; protected files are byte-identical after formatting.
  - Verify: the three gates; `bunx theme-editor` from the repo root and a nested directory;
    hash comparison of the protected files.
  - Files: `package.json`, `.oxlintrc.json`, `.oxfmtrc.json`, `tsconfig.json`, `AGENTS.md`,
    `README.md`, `tools/README.md`, and the source files the rules and formatter touch
  - Depends: Task 9
  - Estimated scope: L (the 575-finding cleanup spans both packages and the demo)

### Checkpoint: Toolchain

- [x] `bun run lint` is green on `oxlint` + `oxfmt`; Biome and `biome.jsonc` are gone.
- [x] `package.json` files and `skills/design-system-tokens/references/*.css` are untouched.
- [x] The editor still serves the API and the UI through `bunx`.

### Phase 6: Publish (human-gated)

- [ ] **Task 11: Publish the two packages**
  - Description: Human-gated and outside the codebase's control. Create the
    `@applied-design-systems` organization scope on npm and authenticate, then `bun publish
    --cwd packages/design-tokens` before `bun publish --cwd packages/theme-editor`. Smoke-test
    from an empty directory: `bunx @applied-design-systems/theme-editor` starts the editor, and
    a one-line import of the core resolves.
  - Acceptance: both packages are visible on npm; the registry smoke test passes.
  - Verify: `bun pm view @applied-design-systems/design-tokens`; the empty-directory `bunx`
    run.
  - Files: none (registry + credentials)
  - Depends: Task 10
  - Estimated scope: S

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| The `@applied-design-systems` scope does not exist; every publish fails | High | Treat scope creation as an explicit prerequisite; `--dry-run` is the only step that runs until it exists. |
| A consumer's `exports`/`main` path fails to resolve TypeScript across packages | High | Task 3 repoints two independent consumers (editor + demo) and runs `bun test` and `bun run typecheck` before any publish work. |
| The published editor tarball omits `index.html`, `DESIGN.md`, or `design-tokens.css`, breaking the bin | High | Task 5 inspects both dry-run file lists against the runtime imports, and the post-publish smoke test in Task 9 is the backstop. |
| Publishing raw `.ts` breaks a Node consumer | Medium | Declared `engines.bun`; the constraint is documented as an Open Question with a JS-build fallback. |
| The `#!/usr/bin/env bun` shebang on a `.tsx` entry is dropped or breaks `bun run start` | Medium | Task 4 verifies the shebang and both script paths; fall back to a one-line `src/cli.ts` wrapper. |
| `workspace:*` pins an exact core version, so a core bump silently strands the editor | Medium | Both packages move to `0.1.0` in lockstep; the publish procedure states the order and the pinning rule. |
| The extraction leaves a stale relative import of a moved module | Medium | Tasks 2 and 3 require a grep for the old paths and a full `bun test` and `bun run typecheck` before their checkpoints. |
| README edits collide with the user's uncommitted `README.md` changes | Low | Build on the current working tree; touch only the layout line and the new Tools section. |

## Open Questions

- Ship TypeScript sources (Bun-only) or build JavaScript + `.d.ts` for the core? — **Resolved:
  TypeScript sources, Bun-only** (`engines.bun`).
- Version the two packages in lockstep at `0.1.0`, or independently? — **Resolved: lockstep at
  `0.1.0`.**
- Public npm, or a private registry such as GitHub Packages? — **Resolved: public npm.**
- Remove the vestigial static-client `build` script, or leave it? — **Resolved: removed.**

## Implementation Notes

Tasks 1–10 are delivered. Task 11 (publish) is human-gated: it needs the
`@applied-design-systems` npm organization scope and credentials, so only the `--dry-run`
packs have run.

Deviations from the plan, all deliberate:

- **The DOM helper left the core.** `loadGoogleFont` writes a `<link>` into the document, so
  it moved out of `fonts.ts` into `packages/theme-editor/src/lib/google-font-loader.ts`. The
  core keeps only the pure font catalog and helpers.
- **Two names, one entry.** `contrast.ts` (hex strings) and `color-contrast.ts` (`Rgb`) both
  export `contrastRatio`/`relativeLuminance`, so the hex versions are published as
  `hexContrastRatio`/`hexRelativeLuminance`; the plain names belong to the validator's `Rgb`
  API.
- **The editor's `build` script is gone**, and `yaml` moved to the core's dependencies — the
  editor no longer imports it.
- **The published packages live in `packages/`** (Task 9); `tools/` came back for developer
  tooling only (Task 10). `repository.directory` is baked into the published manifest, so the
  rename had to land before the first publish.
- **The react-plugin rules stay strict.** The five `react/set-state-in-effect` findings are
  intentional reset-on-effect patterns, so each carries a narrow inline suppression with a
  reason instead of a refactor that would change behavior.

Two real bugs, both found by running the **unpacked tarballs** outside the repo and both
fixed:

- `index.html` used an absolute script path (`/src/main.tsx`). Bun resolves a leading `/`
  against the working directory, so `bunx theme-editor` from any other directory served a
  500 for the UI. The path is now relative, with a comment explaining why.
- The published editor could not resolve its `@lib`/`@styles` aliases because
  `tsconfig.json` was not in `files`. The editor's tsconfig is now standalone (no `extends`
  above the package root) and shipped; `files` also excludes `src/**/*.test.ts`.

Verification evidence:

- `bun run lint` (`oxlint` + `oxfmt`), `bun run typecheck`, `bun test` — all green
  (202 tests).
- `bunx theme-editor` from the repo root and from `demos/radix-ui-starter` (nested): API and
  UI both 200; `PORT` honored.
- Both tarballs extracted to `/tmp` with only their declared deps: the editor served the API,
  the HTML, the client module, and a CSS asset, all 200. Repeated after the `packages/`
  rename.
- `bun publish --dry-run` for both: the core packs 11 files (no tests); the editor packs 114
  (no tests, includes `src`, `index.html`, `DESIGN.md`, `design-tokens.css`, `tsconfig.json`);
  the editor manifest rewrites `workspace:*` to `0.1.0`; `repository.directory` reads
  `packages/<name>`.
