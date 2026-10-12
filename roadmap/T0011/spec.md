# Spec: T0011 Name themes from the front matter and center the editor container

## Restate of intent

- **Outcome:** The Theme Editor treats the `DESIGN.md` front-matter `name` as the theme's
  single identity. The name is parsed from the contract, shown and edited inline in the
  toolbar, written back into the front matter on save/export, and used wherever a theme is
  identified. The Save and Load dialogs each gain two tabs — **Directory** and **Favorites**
  (the browser's localStorage) — using the existing `Tabs` component. The toolbar's inner
  row and the main content share one centered container so the name's left edge lines up
  with the content column.
- **User:** the developer and the AI agent authoring a theme; humans second.
- **Why now:** themes cannot be told apart in the editor, and the tool's own default theme
  has no visible, editable name. Naming is the last piece the theme-library UX is missing.
- **Success:** the toolbar shows the edited theme name; editing it updates the front matter
  on save and export; Save with no project directory offers a Directory tab (export to a
  chosen project directory) and a Favorites tab (browser storage); saving the built-in
  default warns first; the toolbar name aligns with `.app__content`; all gates pass.
- **Constraint:** the token list is fixed; the front matter keeps its shape; the name is
  metadata, not a token; token-only CSS; no new runtime dependency.
- **Out of scope:** the default theme's font-weight/line-height values (the user edits those
  in the tool); the eight demo themes; the contrast tokens; component rendering tests.

## Objective

### The theme name

The `name` key is top-level `DESIGN.md` front matter. It is already parsed today and skipped
by the validator (`isIgnoredPath` covers `name`); this ticket promotes it to first-class
metadata: read, editable, and re-serialized.

- `parseDesignMd` returns `name: string` (the front matter's `name` when it is a non-empty
  string, otherwise `""`); `Contract` and `ValidationInput` carry it through.
- `serializeDesignMd(values, original, typography, name)` writes `frontMatter.name = name`
  (and deletes the key when `name` is empty), preserving everything else.
- The store gains `themeName` and `setThemeName(value)`. It seeds from the active contract's
  name on init, load-from-disk, and load-favorite; `reset()` restores the bundled default's
  name (`Theme Editor Default`). Editing it marks the theme dirty.
- The name stays excluded from the token registry (it is metadata), but the validator gains
  one rule: a contract whose `name` is missing or empty is an error (see Open Questions).

### Toolbar shows and edits the name

- The `THEME EDITOR` mark stays at the start of `.editor-toolbar__brand`, at the toolbar's
  left edge, and the toolbar keeps its full width.
- The inline-editable theme name (reusing `EditableText`, committing on blur/Enter) and the
  actions live in a centered group (`.editor-toolbar__center`, `max-width: 80rem`) with a
  spacer between the name and the actions. An empty name falls back to a muted placeholder.
- The save state becomes a small round `Pill` beside the name — green when saved, amber when
  dirty, red on error — whose text label lives in `title`. `Pill` is a shared UI component;
  the section navigation's dots use it too.

### Centered container

- A shared `.app__container` (`width: 100%`, `max-width: 80rem`, `margin-inline: auto`, the
  current horizontal padding) owns the main content column and the footer.
- The toolbar is *not* wrapped wholesale: it spans the full header width, and only the
  name + actions group is constrained to the same `max-width`.

### Save dialog: Directory | Favorites tabs

The current `ThemeLibrary` save dialog is replaced by a tabbed dialog:

- **Directory** — pick a project directory (reusing `FolderPicker`) and the theme name;
  Save writes `DESIGN.md` + `design-tokens.css` there and adopts that directory. An empty
  directory is preferred; a directory that already holds a contract asks to overwrite.
- **Favorites** — store the theme in the browser (localStorage) under the theme name. The
  name field is prefilled from the toolbar name.

The theme's **location** is the directory or favorite it was last loaded from or saved to.
Toolbar **Save** writes straight back to that location — no dialog, no confirmation. Only a
theme with no location yet (the built-in default) opens this dialog. Loading from a directory
or a favorite records that location too, so a following Save needs no confirmation. To write
the theme somewhere else, use the toolbar **Export**, which always opens this dialog.

### The default theme is special on Save

When the active theme is the built-in `Theme Editor Default`, the Save dialog warns before it
would shadow the editor's own default: it offers to overwrite/submit anyway or to use the
Directory tab (export to a project directory) instead. This confirms intent while keeping the
default recoverable.

### Load dialog: Directory | Favorites tabs

`LoadThemeDialog` gains the same two tabs: **Directory** (the current "from project directory"
section) and **Favorites** (the current "from this browser" list). Loading either kind seeds
`themeName` from the loaded contract.

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

## Project structure

```
tools/theme-editor/
  DESIGN.md                          unchanged: name "Theme Editor Default"
  design-tokens.css                  unchanged
  src/lib/contract.ts                parse/serialize the front-matter `name`
  src/lib/contract.test.ts           name round-trip cases
  src/lib/design-system.ts           unchanged: `name` stays ignored by the registry
  src/lib/validate.ts               `theme-name` rule
  src/lib/validate.test.ts           name-rule cases
  src/lib/theme-store.ts             `themeName` state, seeding, and save/load wiring
  src/lib/local-themes.ts            unchanged (already keyed by name)
  src/components/editor/Toolbar.tsx  editable name replaces the mark
  src/components/editor/Toolbar.css  toolbar inner row uses the shared container
  src/components/editor/ThemeLibrary.tsx   tabbed Save dialog (Directory | Favorites)
  src/components/editor/LoadThemeDialog.tsx  tabbed Load dialog
  src/App.css                        shared `.app__container`
  src/App.tsx                        apply the container
```

## Code style

Reuse the existing `Tabs` component (as the Typography section does for Headings/Body/Mono):

```tsx
<Tabs
  tabs={[
    { key: "directory", label: "Directory" },
    { key: "favorites", label: "Favorites" }
  ]}
  active={tab}
  onChange={setTab}
/>
```

Serialization stays pure and lossless:

```ts
/** Write the theme name into the front matter, preserving every other key. */
export const serializeDesignMd = (
  values: TokenValues,
  original: string,
  typography?: TypographyRefs,
  name?: string
): string => { /* … */ };
```

## Testing strategy

- **Contract** (`src/lib/contract.test.ts`): parsing yields the front-matter `name`;
  serializing writes an updated name; serializing an empty name removes the key; a contract
  without a name parses to `""`; all other front matter round-trips unchanged.
- **Validator** (`src/lib/validate.test.ts`): a missing/empty `name` yields the `theme-name`
  issue; a named contract passes. The existing "accepts the tool's own contract" case stays
  green.
- **UI** is verified manually against the running editor (toolbar edit → dirty; save/export
  writes the name; both dialogs' tabs switch). Component rendering tests stay out of scope,
  as documented.

## Boundaries

- **Always:** keep `name` out of the token registry; preserve the rest of the front matter;
  run `bun run check`, `bun run typecheck`, and `bun test`; use tokens in every stylesheet.
- **Ask first:** making an empty name a hard error versus a warning; adding a directory
  `mkdir` to the server API; removing the `THEME EDITOR` mark; renaming `ThemeLibrary`.
- **Never:** give the name a CSS variable or a `design-tokens.css` entry; store it in
  localStorage as a token; rewrite the demo themes.

## Success criteria

- [x] `parseDesignMd` exposes the front-matter `name`; `serializeDesignMd` writes it back
      losslessly and drops it when empty.
- [x] The store carries `themeName`, seeded on init/load and reset to the default's name.
- [x] The toolbar keeps its full width with the `THEME EDITOR` mark at the left; the theme
      name is inline-editable and sits with the save-state `Pill` in a group constrained to
      the main column's `max-width`.
- [x] `.app__container` centers the main content and the footer (`margin-inline: auto` +
      max-width); the toolbar's name + actions group uses the same `max-width`.
- [x] The Save dialog has Directory and Favorites tabs; Save opens it only when the theme
      has no location yet; **Export** opens it to adopt a new location; the built-in default
      warns before it is shadowed.
- [x] The Load dialog has Directory and Favorites tabs.
- [x] The validator rejects a contract with no theme name; `validate.test.ts` covers it.
- [x] `bun run check`, `bun run typecheck`, and `bun test` pass.

## Open questions

1. **Empty-name severity.** Error or warning? The spec assumes **error** (identity is
   required); the Google Labs spec does not mandate `name`, so a warning is the softer
   alternative.
2. **New directory on export.** The API can write only into an existing directory today.
   Either require the user to create a preferably-empty directory first (picker-only), or add
   a `mkdir` capability to `/api/dirs`/save.
3. **`THEME EDITOR` mark.** Removed (assumed) versus kept beside the name.
4. **Overwrite semantics of the default.** "Overwrite the editor's default" is read here as
   warning before a Favorites entry shadows the built-in default; writing the tool's own
   files is the Directory flow. Confirm the exact behavior.
