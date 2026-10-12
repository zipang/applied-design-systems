# Implementation Plan: T0011 Name themes from the front matter and center the editor container

## Overview

Promote the `DESIGN.md` front-matter `name` to the theme's first-class identity: parse it,
carry it through the contract, expose it in the store, and write it back on save/export. Show
and edit it inline in the toolbar, aligned to a shared centered container that also holds
`.app__content`. Rebuild the Save and Load dialogs around **Directory** and **Favorites**
tabs, add an Export-to-a-new-directory flow (with directory creation on the server), and warn
when the built-in default theme would be shadowed.

## Architecture Decisions

- **Name is metadata, not a token.** `name` stays out of the token registry and out of
  `design-tokens.css`; it lives only in the `DESIGN.md` front matter. `parseDesignMd` returns
  it, `serializeDesignMd` writes it, and the store tracks it.
- **One identity.** The toolbar name is the theme name everywhere: the browser library is
  keyed by it, and the export flow uses it as the project name. The separate "Save as" name
  prompt is retired.
- **Validator owns the required name.** An empty or missing `name` is an error, so a nameless
  contract cannot be saved. `Contract` and `ValidationInput` carry the name through.
- **One container.** A shared `.app__container` (`max-width` + `margin-inline: auto` +
  padding) is applied to `.app__content`, the toolbar's inner row, and the footer, so the
  theme name aligns with the content column.
- **Tabs, not new dialogs.** Reuse the existing `Tabs` component (as the Typography section
  does) for the Directory/Favorites switch, so the dialog styling stays consistent.
- **Directory creation belongs to the server.** The browser cannot create directories, so the
  server gains a `mkdir` capability used by both the picker and the export flow.

## Task List

### Phase 1: The name in the contract (pure core)

- [x] **Task 1: Parse and serialize the front-matter name**
  - Description: Add `name` to `ParsedDesignMd` and `Contract`, read from the front matter when
    it is a non-empty string (otherwise `""`); extend `serializeDesignMd` with a `name`
    parameter that writes `frontMatter.name` and deletes the key when empty, preserving all
    other front matter. Extend `contract.test.ts` with parse/serialize round-trip cases.
  - Acceptance: a named contract parses to its name; serializing an updated name changes only
    that key; an empty name removes the key; an unnamed contract parses to `""`.
  - Verify: `bun test tools/theme-editor/src/lib/contract.test.ts`
  - Files: `src/lib/contract.ts`, `src/lib/contract.test.ts`
  - Depends: None
  - Scope: S

- [x] **Task 2: Validate the required theme name**
  - Description: Add a `theme-name` error to `validateContract` when the contract's `name` is
    empty, threading `name` through `ValidationInput` (and from `parseContract`). Add cases to
    `validate.test.ts`: an unnamed contract yields `theme-name`; a named one does not; keep
    "accepts the tool's own contract" green.
  - Acceptance: an unnamed contract is rejected with `theme-name`; every existing contract
    (tool + eight demo themes, all named) stays valid.
  - Verify: `bun test tools/theme-editor/src/lib/validate.test.ts`
  - Files: `src/lib/validate.ts`, `src/lib/validate.test.ts`
  - Depends: Task 1
  - Scope: S

- [x] **Task 3: Track the name in the store**
  - Description: In `theme-store.ts`, add `themeName` state and `setThemeName(value)` to
    `ThemeStore`; seed it from the active contract's name on init and on `openFromDisk`, and
    restore the bundled default's name in `reset()`. Pass `themeName` to `serializeDesignMd`.
    Editing the name marks the theme dirty.
  - Acceptance: the store exposes the seeded name; editing it changes `designMd`; reset and
    load restore the right name; the exported files carry it.
  - Verify: `bun run --cwd tools/theme-editor typecheck`; manual: edit the name and export.
  - Files: `src/lib/theme-store.ts`
  - Depends: Task 1
  - Scope: S

### Checkpoint: After Tasks 1-3
- [x] `bun test tools/theme-editor/src/lib` passes
- [x] The name round-trips through parse → store → serialize
- [x] The validator rejects a nameless contract

### Phase 2: Toolbar name and centered container

- [x] **Task 4: Show and edit the name in the toolbar**
  - Description: Replace the static `THEME EDITOR` mark with the inline-editable theme name
    (reuse `EditableText`), wired to `store.themeName` / `store.setThemeName`, committing on
    blur. Keep the status text beside it; show a muted placeholder when the name is empty.
  - Acceptance: the toolbar shows the current theme name; editing it updates the preview's
    `DESIGN.md` and marks the theme dirty; a reload/load reflects the new name.
  - Verify: `bun run --cwd tools/theme-editor dev` (manual, live); `bun run check`
  - Files: `src/components/editor/Toolbar.tsx`, `src/components/editor/Toolbar.css`
  - Depends: Task 3
  - Scope: S

- [x] **Task 5: Center one container for content, toolbar, and footer**
  - Description: Add `.app__container` (`width: 100%`, `max-width: 80rem`,
    `margin-inline: auto`, the current horizontal padding) and apply it to `.app__content`,
    a new toolbar inner row, and the footer, so their left edges line up. Drop the ad-hoc
    paddings/max-width these elements carry.
  - Acceptance: the toolbar name's left edge aligns with the content column at all viewport
    widths; the page still scrolls and the sticky toolbar is unaffected.
  - Verify: `bun run --cwd tools/theme-editor dev` (manual, live, with screenshots at wide
    and narrow widths); `bun run check`
  - Files: `src/App.css`, `src/App.tsx`, `src/components/editor/Toolbar.tsx`,
    `src/components/editor/Toolbar.css`
  - Depends: Task 4
  - Scope: S

### Checkpoint: After Tasks 4-5
- [x] The toolbar shows an editable name aligned with the content
- [x] `bun run check`, `bun run typecheck`, `bun test` pass

### Phase 3: Directory creation and the tabbed dialogs

- [x] **Task 6: Add directory creation to the server and picker**
  - Description: Add `createDirectory(path, name)` to `directories.ts` (rejecting separators,
    traversal, and existing targets) behind a `POST /api/dirs` route, and add a "New folder"
    affordance to `FolderPicker`. Cover the pure validation in `directories.test.ts` and the
    route behavior in `theme-api.test.ts`-style server tests.
  - Acceptance: a valid new folder is created and returned; invalid names and escapes are
    rejected; the picker can create and then select it.
  - Verify: `bun test tools/theme-editor/src/lib/directories.test.ts`; `bun run check`
  - Files: `src/lib/directories.ts`, `src/lib/directories.test.ts`, `src/server.tsx`,
    `src/components/editor/FolderPicker.tsx`, `src/components/editor/FolderPicker.css`
  - Depends: None
  - Scope: M

- [x] **Task 7: Split the Load dialog into Directory and Favorites tabs**
  - Description: Wrap the two existing sections of `LoadThemeDialog` in a `Tabs` bar
    (`directory`, `favorites`). Loading either kind seeds `themeName` from the loaded contract.
  - Acceptance: the tabs switch; the directory section keeps its guarded "Load from directory"
    button; the favorites list keeps load/delete; no behavior is lost.
  - Verify: `bun run --cwd tools/theme-editor dev` (manual, live); `bun run check`
  - Files: `src/components/editor/LoadThemeDialog.tsx`,
    `src/components/editor/LoadThemeDialog.css`
  - Depends: Task 3
  - Scope: S

- [x] **Task 8: Rebuild the Save dialog with Directory and Favorites tabs**
  - Description: Replace `ThemeLibrary` with a tabbed Save dialog (`directory`, `favorites`).
    The Favorites tab stores the theme in localStorage under the theme name (prefilled from the
    toolbar) and fires the existing save path. The Directory tab hosts the export flow of
    Task 9. Toolbar Save opens this dialog when no directory is set, and writes straight to
    disk when one is.
  - Acceptance: Save with no directory opens the dialog; the Favorites tab saves and loads the
    theme by name; Save with a directory set is unchanged.
  - Verify: `bun run --cwd tools/theme-editor dev` (manual, live); `bun run check`
  - Files: `src/components/editor/ThemeLibrary.tsx`,
    `src/components/editor/ThemeLibrary.css`, `src/lib/theme-store.ts`
  - Depends: Task 7
  - Scope: M

- [x] **Task 9: Export to a project directory and guard the default theme**
  - Description: Fill the Directory tab: pick or create a directory, ask for the project/theme
    name, write `DESIGN.md` + `design-tokens.css` through `/api/theme`, and adopt the chosen
    directory as the project dir. When the active theme is the built-in `Theme Editor Default`,
    warn first that saving shadows the editor's own default and offer the Directory tab as the
    alternative.
  - Acceptance: exporting to a fresh directory writes both files and sets the project dir;
    the built-in default triggers the confirmation; canceling leaves state untouched.
  - Verify: `bun run --cwd tools/theme-editor dev` (manual, live, in a throwaway `.tmp/`
    directory); `bun test`
  - Files: `src/components/editor/ThemeLibrary.tsx`, `src/lib/theme-store.ts`
  - Depends: Task 6, Task 8
  - Scope: M

### Checkpoint: Complete
- [x] `bun run check`, `bun run typecheck`, `bun test` pass
- [x] The name is shown, editable, saved, and exported; Save/Load have Directory+Favorites tabs
- [x] Export creates a directory and writes the contract; the default theme is guarded
- [x] All spec success criteria met; ready for review

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| `serializeDesignMd` signature change breaks call sites/tests | Med | It has one call site in `theme-store.ts`; make `name` the last optional parameter and run `bun test` early (Task 1). |
| Existing contracts without a `name` now fail validation | Med | Every contract in the repo is named; the rule is new, documented in the spec, and confirmed before implementation. |
| Directory creation via the API is a security surface | High | Reject separators, `..`, absolute names, and existing targets; resolve against the parent's `realpath` like `safeThemePath`. |
| Vertical alignment fights the fixed section nav | Med | The nav is `position: fixed`; verify at narrow widths and adjust the container padding only if it overlaps. |
| Bun `--hot` breaks the client bundle on text-imported CSS edits | Low | Restart the dev server after editing contract files (known pre-existing bug). |
| Favorites/name unification makes the default shadow itself | Med | Task 9's confirmation gates the Favorites save of the built-in default. |

## Open Questions

1. **Empty-name severity.** Taken as an **error** here; a warning is the softer alternative if
   nameless contracts must remain loadable.
2. **`THEME EDITOR` mark.** Assumed removed; restore it beside the name if the brand should stay.
3. **Overwrite semantics of the default.** Read as "warn before a Favorites entry shadows the
   built-in default"; confirm the exact action if writing the tool's own files is intended.
