# Spec: T0010 Promote the resolved color-contrast tokens into the contract

## Restate of intent

- **Outcome:** The `--color-on-*` variables stop being a generated companion layer and
  become official, stylesheet-only design tokens defined in `design-tokens.css`. A shared
  pure `updateThemeContrastTokens(tokenList)` computes them; the Theme Editor runs it on
  every color-token change and on load/reset; the validator checks their presence and
  correctness, and checks that `--color-text` is legible on `--color-surface`.
- **User:** AI agents authoring a theme, and the developer using the Theme Editor. Humans
  second.
- **Why now:** The layer is dead code. No component consumes it and nothing loads it, and
  the contract still has no answer for "which text color goes on this background".
  Promoting the tokens is what finally wires them up.
- **Success:** The eleven tokens are in the registry, the skill, every `design-tokens.css`
  (the tool's own and the eight demo themes), and the `DESIGN.md` prose; the demo and tool
  components consume `var(--color-on-*)` with **no fallback**; `ui-theme-overrides.css`,
  the generator, its script, and its tests are gone; the new validator rules are covered by
  `validate.test.ts`; all gates pass.
- **Constraint:** The token list is fixed. This adds eleven documented tokens once, via the
  skill. Contrast logic stays pure and shared; no new dependency. `DESIGN.md` front matter
  is unchanged: these tokens have no front-matter path.
- **Documentation:** each `DESIGN.md` gains a `### Resolved color contrast pairs`
  subsection immediately before `### Color variants`, stating the rule that text drawn on a
  surface uses these tokens.
- **Out of scope:** Roles beyond the existing set; palette changes; the generic
  `base-text--ondark` modifier; `color-variants.css`; component rendering tests.

## Supersedes T0004

T0004 introduced the `--color-on-*` layer and made one decision this ticket reverses:

> "`--color-on-*` variables are **not design tokens**. They never appear in `DESIGN.md`
> front matter or in the fixed token list."
> — `roadmap/T0004/spec.md`

T0010 promotes them into the fixed token list. T0004's other decisions stand unchanged:
the selection rule, the WCAG AA bar, and the "one `:root` block" shape. What T0004 planned
but never landed — components consuming the layer and the runtime loading it — is
delivered here.

## Objective

### The eleven tokens

Each token is the foreground to use on one role's background. All eleven are
**stylesheet-only** (no front-matter path), always present in `design-tokens.css`, and
default to `var(--color-text)`. They are placed at the end of the `colors` group, after
`--color-surface-card`.

| CSS variable | Background role | Default |
|---|---|---|
| `--color-on-primary` | `colors.brand.primary` | `var(--color-text)` |
| `--color-on-accent` | `colors.brand.accent` | `var(--color-text)` |
| `--color-on-secondary` | `colors.brand.secondary` | `var(--color-text)` |
| `--color-on-tertiary` | `colors.brand.tertiary` (falls back to `colors.brand.primary`) | `var(--color-text)` |
| `--color-on-success` | `colors.action.success` | `var(--color-text)` |
| `--color-on-info` | `colors.action.info` | `var(--color-text)` |
| `--color-on-warning` | `colors.action.warning` | `var(--color-text)` |
| `--color-on-danger` | `colors.action.danger` | `var(--color-text)` |
| `--color-on-dark` | `colors.surface.dark` | `var(--color-text)` |
| `--color-on-alt` | `colors.surface.alt` | `var(--color-text)` |
| `--color-on-card` | `colors.surface.card` (falls back to `var(--color-surface)`) | `var(--color-text)` |

### Selection rule (unchanged from T0004)

For each role, resolve the background color and the theme's two text colors
(`--color-text`, `--color-text-ondark`) to hex, then:

1. Pick the text color with the higher WCAG 2.1 contrast ratio against the background.
2. A tie goes to `--color-text-ondark`.
3. If the winning ratio is below 4.5:1, fall back to pure black or white, whichever
   contrasts more.

The output value is `var(--color-text)`, `var(--color-text-ondark)`, `#000000`, or
`#ffffff`. The computation is deterministic and pure.

### Base surface assumption

`--color-surface` has no `--color-on-*` companion. The rule is that **`--color-text` is the
appropriate contrasting color for the base surface** `--color-surface`. This is an
assumption about the theme, not something the utility computes, so the validator enforces
it: `contrast(--color-text, --color-surface)` must be at least 4.5:1. A theme that fails it
is not a valid contract.

### Documentation rule

`DESIGN.md` documents the pairs in prose, not in the front matter. Each theme's `## Colors`
section gains a `### Resolved color contrast pairs` subsection immediately before
`### Color variants` (or at the end of `## Colors` when that subsection is absent). It
states: the `--color-on-*` tokens are auto-calculated, one per role, and **UI components
must use them for any text drawn on that role's background** (for example the `primary`,
`accent`, `success`, `warning`, `danger`, and `info` button variants). The prose does not
list values; values are generated.

## Tech stack

Unchanged: Bun workspaces, React + Radix UI, token-only CSS, Biome, TypeScript, `yaml`.

## Commands

```
Install:   bun install
Check:     bun run check
Typecheck: bun run typecheck
Test:      bun test
Dev:       bun run --cwd tools/theme-editor dev
```

`bun run generate:themes` (`tools/generate-theme-overrides.ts`) is removed with the
generator.

## Project structure

```
tools/
  color-contrast.ts                  unchanged: hex parse, luminance, ratio
  contrast-tokens.ts                 NEW: updateThemeContrastTokens(tokenList)
  contrast-tokens.test.ts            NEW: selection-rule unit tests (migrated from the
                                     deleted generator test's three cases)
  generate-theme-overrides.ts        DELETED
  generate-theme-overrides.test.ts   DELETED
tools/theme-editor/
  DESIGN.md                          gains the "Resolved color contrast pairs" prose
  design-tokens.css                  gains the eleven tokens (computed)
  ui-theme-overrides.css             DELETED
  src/main.tsx                       drops the overrides import and concatenation
  src/lib/design-system.ts           registers the eleven tokens
  src/lib/validate.ts                adds the correctness and base-surface rules
  src/lib/validate.test.ts           gains presence, correctness, and surface cases
  src/lib/theme-store.ts             runs the utility on color edits and on load/reset
  src/components/**/*.css            role-colored consumers migrated; alt/card consumers
                                     that set an explicit foreground migrated too
demos/radix-ui-starter/themes/<name>/
  DESIGN.md                          gains the prose subsection (8 themes)
  design-tokens.css                  gains the eleven tokens (computed)
  ui-theme-overrides.css             DELETED (8 files)
demos/radix-ui-starter/src/lib/theme/
  contract.test.ts                   existence test replaced by a drift check
  themes.ts / ThemeProvider.tsx      unchanged: ThemeProvider already injects the theme's
                                     design-tokens.css, so the tokens now apply at runtime
skills/design-system-tokens/
  SKILL.md                           section 3 subsection + section 10 rules
  references/design-tokens.css       gains the eleven tokens
  references/DESIGN.md               gains the prose subsection
```

## Code style

The extracted utility is pure and shared. It has no React and no DOM, and it does not
import the editor package (the dependency points toward the root).

```ts
/** A flat map of `--variable` to its current value. */
export type TokenList = Record<string, string>;

/**
 * Return a copy of `tokenList` with the eleven `--color-on-*` contrast tokens recomputed
 * from its color values. `var()` references are resolved against the list itself, up to a
 * bounded depth. The input is not mutated.
 */
export const updateThemeContrastTokens = (tokenList: TokenList): TokenList => { /* … */ };
```

- The internal `var()` resolution is bounded (depth ≤ 8) and mirrors the editor's
  `resolveVariables`. Keeping it inside this module preserves the dependency direction:
  the root module depends only on `tools/color-contrast.ts`.
- The Theme Editor imports `updateThemeContrastTokens` and `TokenList` only.

## Testing strategy

- **Selection rule** (`tools/contrast-tokens.test.ts`): the three cases migrated from the
  deleted generator test — picks the theme text token when it meets AA; falls back to black
  when neither text token reaches AA; falls back to white on a dark background. Plus a case
  proving purity (input unchanged) and one proving `var()` resolution. Cover the two new
  surface roles (`alt`, `card`).
- **Validator** (`tools/theme-editor/src/lib/validate.test.ts`): the feature's required new
  test suite. Add a case that a missing `--color-on-*` yields `missing-token`; a case that a
  stale `--color-on-*` (recompute ≠ stored) yields a `contrast-mismatch` error; and a case
  that a `--color-text` / `--color-surface` pair below 4.5:1 yields a
  `text-surface-contrast` error. The existing "accepts the tool's own contract" case must
  stay green, which forces the tool's own `design-tokens.css` to carry correct values.
- **Demo drift** (`demos/radix-ui-starter/src/lib/theme/contract.test.ts`): the obsolete
  "has a generated ui-theme-overrides.css" existence check is replaced by a check that each
  theme's eleven on-* values equal `updateThemeContrastTokens()` and meet AA, so a hand-edit
  of a committed theme fails `bun test`.
- Component rendering tests stay out of scope, as documented.

## Boundaries

- **Always:** keep the fixed token list authoritative in the skill; edit the skill tables
  before the registry; keep the base surface at AA; run `bun run check`,
  `bun run typecheck`, and `bun test` before committing; recompute the eleven after any
  palette change.
- **Ask first:** changing the selection rule or the AA target; adding a role; moving the
  utility's home; changing the default `var(--color-text)`; migrating surfaces that
  currently inherit `--color-text`.
- **Never:** give these tokens a front-matter path; hand-write a value that the utility
  would compute differently; add a runtime dependency; keep the deleted generator, its
  script, or its existence test.

## Success criteria

- [ ] `tools/contrast-tokens.ts` exports a pure, tested `updateThemeContrastTokens`.
- [ ] The eleven tokens are registered in `src/lib/design-system.ts` as stylesheet-only,
      with `fallback: "var(--color-text)"`.
- [ ] The skill documents them (section 3 table, section 10 rules, reference files) and the
      fixed list count matches the registry.
- [ ] The tool's own contract and all eight demo themes carry the eleven tokens with
      computed values, and every `DESIGN.md` has the `### Resolved color contrast pairs`
      prose.
- [ ] Every `ui-theme-overrides.css` file, the generator, its test, and the `generate:themes`
      script are deleted.
- [ ] Demo and tool components that draw text on a role background use `var(--color-on-*)`
      with no fallback, including explicit-foreground alt/card consumers; `base-text--ondark`
      and inherited chrome are untouched.
- [ ] The validator flags a missing contrast token, a stale contrast token, and a
      `--color-text`/`--color-surface` pair below AA; `validate.test.ts` covers all three.
- [ ] `bun run check`, `bun run typecheck`, and `bun test` pass.

## Open questions

1. **Default value.** The spec assumes all eleven default to `var(--color-text)`. Confirm, or
   name a role-aware default (for example `--color-on-dark` → `var(--color-text-ondark)`).
2. **`var()` resolution.** The shared module carries a small bounded resolver so the
   dependency direction stays root-ward, at the cost of a second resolver next to
   `contract.ts`'s `resolveVariables`. A later refactor could lift `resolveVariables` to the
   root and have both import it.
3. **Tool contrast badge.** `tools/theme-editor/src/components/preview/Preview.css` sets one
   foreground for a badge whose background changes per `data-level`. Mapping it to
   `--color-on-success`/`-warning`/`-danger` needs a per-level `color`, a small restructure.
   Confirm it is in scope, or leave the badge as-is.
4. **Other text pairs.** The validator gains the `--color-text`/`--color-surface` check only.
   T0004 also had bars for muted text and the secondary UI border; whether those become
   validator rules is deferred.
