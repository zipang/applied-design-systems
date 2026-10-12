# Implementation Plan: T0010 Promote the resolved color-contrast tokens into the contract

## Overview

Promote the `--color-on-*` contrast variables from the generated `ui-theme-overrides.css`
companion into the fixed token contract. Extract the selection logic into a pure, shared
`updateThemeContrastTokens(tokenList)` at the repo root, register the eleven tokens in the
Theme Editor, make the editor recompute them on every color edit and on load/reset, teach
the validator to check presence, correctness, and the base `--color-text`/`--color-surface`
pair, fold the tokens and the prose into the tool's own contract and the eight demo themes,
delete the generator and its files, and finally migrate the components so the layer is
actually consumed.

## Architecture Decisions

- **Tokens, not a companion layer.** The eleven `--color-on-*` variables enter the fixed
  token list as stylesheet-only tokens (no front-matter path), defaulting to
  `var(--color-text)`. This reverses T0004's "not tokens" decision; T0004's selection rule
  and AA bar are retained.
- **Pure shared core at the root.** `tools/contrast-tokens.ts` exports
  `updateThemeContrastTokens(tokenList)` next to `tools/color-contrast.ts`. The root module
  depends only on the root module; the editor imports it one way. This avoids a dependency
  from the root tools into the editor package.
- **Skill first.** AGENTS requires the skill to define the token list before the registry
  changes. The skill gains a section 3 subsection, a section 10 rule, and reference updates
  before `design-system.ts` is touched.
- **Validator owns correctness.** Presence and correctness are validation rules, tested in
  the existing `validate.test.ts`. The editor recomputes, so it cannot emit a stale value
  itself; the rules catch hand-edited or externally authored contracts.
- **Recompute is idempotent.** Running the utility on already-correct values is a no-op, so
  applying it on change, on load, and on reset is safe.
- **Delete the dead layer.** `ui-theme-overrides.css` (nine files), the generator, its test,
  and the `generate:themes` script are removed. The runtime starts working for free because
  `ThemeProvider` already injects the theme's `design-tokens.css`.
- **Components get migrated.** Role-colored consumers and explicit-foreground alt/card
  consumers switch to `var(--color-on-*)` with no fallback. Inherited chrome and the generic
  `base-text--ondark` modifier are left alone.

## Task List

### Phase 1: Extraction and skill of record

- [ ] **Task 1: Extract the pure contrast-token utility**
  - Description: Create `tools/contrast-tokens.ts` exporting `TokenList` and a pure
    `updateThemeContrastTokens(tokenList)` that computes the eleven `--color-on-*` values
    with the T0004 selection rule (higher contrast text token; tie to on-dark; black/white
    fallback below 4.5:1). Resolve `var()` against the list with a bounded depth. Move the
    three selection-rule cases out of the generator test into a new
    `tools/contrast-tokens.test.ts`, plus purity and `var()`-resolution cases, plus the two
    surface roles.
  - Acceptance: the utility is pure (input not mutated); the eleven variables are produced;
    `--color-on-tertiary` follows `--color-brand-tertiary`'s fallback to primary;
    `--color-on-card` follows `--color-surface-card`'s fallback to `--color-surface`.
  - Verify: `bun test tools/contrast-tokens.test.ts`
  - Files: `tools/contrast-tokens.ts`, `tools/contrast-tokens.test.ts`
  - Depends: None
  - Scope: S

- [ ] **Task 2: Document the eleven tokens in the skill**
  - Description: Add a "Resolved color contrast pairs" subsection and table to section 3 of
    the skill (stylesheet-only, default `var(--color-text)`, computed per role), add the
    section 10 rules (present, correct, and `--color-text` legible on `--color-surface`),
    and update the reference files: the eleven tokens in `references/design-tokens.css` and
    the `### Resolved color contrast pairs` prose before `### Color variants` in
    `references/DESIGN.md`.
  - Acceptance: the token list in the skill matches the eleven registry entries exactly; the
    mapping table stays the source of truth; no other token is added or renamed.
  - Verify: manual read against the spec table; `bun run check`
  - Files: `skills/design-system-tokens/SKILL.md`,
    `skills/design-system-tokens/references/design-tokens.css`,
    `skills/design-system-tokens/references/DESIGN.md`
  - Depends: None
  - Scope: M

### Checkpoint: After Tasks 1-2
- [ ] `bun test tools/contrast-tokens.test.ts` passes
- [ ] The skill documents the eleven tokens and the three validation rules
- [ ] Review with human before touching the registry

### Phase 2: Registry, contract, and validation (editor core)

- [ ] **Task 3: Register the tokens and fold them into the tool's own contract**
  - Description: Add the eleven `TokenDef`s to `src/lib/design-system.ts` as
    stylesheet-only (`required: false`, `fallback: "var(--color-text)"`) after the surface
    colors. Add the eleven computed values to `tools/theme-editor/design-tokens.css` and the
    prose subsection to `tools/theme-editor/DESIGN.md`. Delete
    `tools/theme-editor/ui-theme-overrides.css` and drop its import and concatenation from
    `src/main.tsx`. Compute the two new surface values with the Task 1 utility (the existing
    nine values can be carried over from the deleted overrides file).
  - Acceptance: `parseContract` + `serializeTokensCss` round-trip the tool's contract with
    the eleven tokens in the colors group; `validateContract` reports only expected issues
    (Task 4 adds the new rules); the tool starts and its chrome renders unchanged.
  - Verify: `bun run --cwd tools/theme-editor typecheck`; `bun run --cwd tools/theme-editor dev`
    (manual: the tool loads).
  - Files: `tools/theme-editor/src/lib/design-system.ts`,
    `tools/theme-editor/design-tokens.css`, `tools/theme-editor/DESIGN.md`,
    `tools/theme-editor/src/main.tsx`, `tools/theme-editor/ui-theme-overrides.css` (delete)
  - Depends: Task 1, Task 2
  - Scope: M

- [ ] **Task 4: Add the validator rules and tests**
  - Description: In `src/lib/validate.ts`, import `updateThemeContrastTokens` and add (a) a
    `contrast-mismatch` error when a stored `--color-on-*` differs from its recomputed value
    (resolving `var()` against `cssValues`), and (b) a `text-surface-contrast` error when
    `contrast(--color-text, --color-surface)` is below 4.5:1. Presence is already covered by
    the generic `missing-token` loop. Extend `validate.test.ts` with a missing-token case, a
    stale-value case, and a low base-surface case; keep "accepts the tool's own contract"
    green.
  - Acceptance: a hand-edited or stale contract is rejected; a theme whose base pair fails
    AA is rejected; the tool's own contract passes.
  - Verify: `bun test tools/theme-editor/src/lib/validate.test.ts`
  - Files: `tools/theme-editor/src/lib/validate.ts`,
    `tools/theme-editor/src/lib/validate.test.ts`
  - Depends: Task 3
  - Scope: M

- [ ] **Task 5: Recompute in the store on color edits and on load/reset**
  - Description: In `src/lib/theme-store.ts`, run `updateThemeContrastTokens` inside
    `update()` when the edited variable is a color token (`tokenByVariable(variable)?.kind
    === "color"`), and normalize the value map after `openFromDisk`, `loadLocal`, and
    `reset`. Leave non-color edits untouched. Confirm the serializer needs no change because
    it already emits every registry token.
  - Acceptance: editing any color recomputes all eleven; loading a stale contract normalizes
    it; editing spacing/typography does not touch them; the scoped preview reflects the new
    values.
  - Verify: `bun run --cwd tools/theme-editor typecheck`; manual: change a brand color and
    watch the on-* tokens update in the preview and the exported `design-tokens.css`.
  - Files: `tools/theme-editor/src/lib/theme-store.ts`
  - Depends: Task 4
  - Scope: S

### Checkpoint: After Tasks 3-5
- [ ] `bun run check`, `bun run typecheck`, `bun test` pass
- [ ] The editor recomputes the eleven on a color change and on load
- [ ] The validator rejects stale and low-contrast contracts

### Phase 3: Demo themes and removal of the generator

- [ ] **Task 6: Promote the tokens into four demo themes**
  - Description: For `paper`, `midnight`, `cyan`, `magenta`: add the eleven computed values
    to `design-tokens.css`, add the `### Resolved color contrast pairs` prose to `DESIGN.md`,
    and delete `ui-theme-overrides.css`. Derive the values with the Task 1 utility via a
    throwaway script in `.tmp/` (do not add a committed generator).
  - Acceptance: each theme's eleven values equal `updateThemeContrastTokens()` and meet AA;
    no `ui-theme-overrides.css` remains for these four.
  - Verify: `bun test demos/radix-ui-starter/src/lib/theme/contract.test.ts` (after Task 8)
  - Files: 4 × `themes/<id>/design-tokens.css`, 4 × `themes/<id>/DESIGN.md`,
    4 × `themes/<id>/ui-theme-overrides.css` (delete)
  - Depends: Task 1, Task 2
  - Scope: L

- [ ] **Task 7: Promote the tokens into the other four demo themes**
  - Description: Same as Task 6 for `reference`, `monokai`, `dracula`, `gruvbox`.
  - Acceptance: as Task 6 for these four themes.
  - Verify: `bun test demos/radix-ui-starter/src/lib/theme/contract.test.ts` (after Task 8)
  - Files: 4 × `themes/<id>/design-tokens.css`, 4 × `themes/<id>/DESIGN.md`,
    4 × `themes/<id>/ui-theme-overrides.css` (delete)
  - Depends: Task 1, Task 2
  - Scope: L

- [ ] **Task 8: Delete the generator and replace the demo existence test**
  - Description: Delete `tools/generate-theme-overrides.ts`,
    `tools/generate-theme-overrides.test.ts`, and the `generate:themes` script in
    `package.json`. In the demo `contract.test.ts`, replace the
    "has a generated ui-theme-overrides.css" test with a drift check that each theme's
    eleven on-* values equal `updateThemeContrastTokens()` and meet AA.
  - Acceptance: nothing imports the generator; `generate:themes` is gone; the demo drift
    test fails on a hand-edited value.
  - Verify: `bun test`; `grep -rn "generate-theme-overrides\|generate:themes" .`
  - Files: `tools/generate-theme-overrides.ts` (delete),
    `tools/generate-theme-overrides.test.ts` (delete), `package.json`,
    `demos/radix-ui-starter/src/lib/theme/contract.test.ts`
  - Depends: Task 6, Task 7
  - Scope: M

### Checkpoint: After Tasks 6-8
- [ ] Every `ui-theme-overrides.css` is gone; no generator or script remains
- [ ] All nine contracts (tool + 8 themes) carry correct, AA-compliant values
- [ ] `bun test` passes, including the new drift check

### Phase 4: Components consume the layer

- [ ] **Task 9: Migrate the demo components**
  - Description: Replace hardcoded foregrounds with the matching token, no fallback:
    `ui/Button.css` — `primary`→`--color-on-primary`, `accent`→`--color-on-accent`
    (currently `--color-surface-dark`), `success`/`warning`/`danger`/`info`→their on-tokens,
    `secondary`→`--color-on-alt`; `ui/Avatar.css`→`--color-on-secondary`;
    `chat/Composer.css` send→`--color-on-dark`; `chat/Message.css` user bubble→
    `--color-on-dark`. Leave `base-text--ondark` and inherited chrome untouched.
  - Acceptance: no component sets a foreground on a role/surface background without the
    on-token; the demo renders correctly across all eight themes.
  - Verify: `bun run --cwd demos/radix-ui-starter dev` + switch themes; `bun test`
  - Files: `demos/radix-ui-starter/src/components/ui/Button.css`,
    `demos/radix-ui-starter/src/components/ui/Avatar.css`,
    `demos/radix-ui-starter/src/components/chat/Composer.css`,
    `demos/radix-ui-starter/src/components/chat/Message.css`
  - Depends: Task 6, Task 7
  - Scope: M

- [ ] **Task 10: Migrate the tool components**
  - Description: Same migration for `tools/theme-editor/src/components/ui/Button.css` (six
    variants plus `secondary`→`--color-on-alt`) and `preview/Preview.css`'s contrast badge
    (per `data-level`, use `--color-on-success`/`-warning`/`-danger`).
  - Acceptance: the tool's chrome and preview use the on-tokens; the badge stays legible at
    every level.
  - Verify: `bun run --cwd tools/theme-editor dev` (manual: preview renders); `bun run check`
  - Files: `tools/theme-editor/src/components/ui/Button.css`,
    `tools/theme-editor/src/components/preview/Preview.css`
  - Depends: Task 3
  - Scope: S

### Checkpoint: Complete
- [ ] `bun run check`, `bun run typecheck`, `bun test` pass
- [ ] The demo and the tool render correctly across every theme
- [ ] All spec success criteria met; ready for review

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Editor package cannot import the root module (`tsconfig` includes only `src`) | High | Verify `bun run --cwd tools/theme-editor typecheck` in Task 1/3; if TS rejects it, add the file to the editor `include` or a path alias. Same check for the demo test in Task 8. |
| `design-system.test.ts` asserts "required tokens have no fallback; optional do" | Med | Register the eleven as `required: false` with `fallback`, matching stylesheet-only tokens. |
| Bun `--hot` breaks the client bundle when a text-imported CSS changes | Med | Restart the dev server after each contract-file edit; known pre-existing bug. |
| Migrating components changes rendering for a theme whose computed value differs from the hardcoded one | Med | Visual check every theme in Task 9; the drift test guarantees AA, and the change is the point of the ticket. |
| `--color-on-tertiary` / `--color-on-card` backgrounds may be absent in a theme | Med | Resolve through the documented fallback (`brand.primary`, `surface.base`) before computing; cover in Task 1 tests. |
| Message bubble's background is not declared in `Message.css` | Low | Confirm the intended surface from the rendered demo before choosing `--color-on-dark`; adjust to the actual role token if different. |
| New validator rules reject a committed theme | Low | Tasks 6-7 compute values with the same utility the validator uses, so they agree by construction. |

## Open Questions

1. **Default value.** The spec assumes all eleven default to `var(--color-text)`. Confirm
   before Task 3.
2. **`var()` resolution.** The shared module carries its own bounded resolver, duplicating
   `contract.ts`'s `resolveVariables`. Accept the duplication now, or lift `resolveVariables`
   to the root as a follow-up.
3. **Tool contrast badge.** Treated as in scope (per the interview). The per-`data-level`
   `color` restructure in Task 10 may be deferred if it proves noisy.
4. **Other text pairs.** Only the `--color-text`/`--color-surface` pair is validated here;
   T0004's muted-text and secondary-border bars are deferred.
