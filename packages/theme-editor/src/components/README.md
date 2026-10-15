# Components

The demo's component library. Every style consumes a design token. Pages use these
components only. They never use Radix UI directly.

## Tiers

Components live in five tiers. Add a component to the lowest tier that fits.

- `base/` — Low-level primitives: `Box`, `Heading`, `Text`, `Icon`.
- `ui/` — Radix UI wrappers and generic UI primitives: `Button`, `TextField`,
  `DropdownMenu`, `Dialog`, `Avatar`, `ScrollArea`, `ThemeSwitcher`.
- `layout/` — Layout primitives and the page shell: `Container`, `VStack`, `HStack`,
  `Grid`, `PageLayout`, `PageHeader`, `PageBody`, `PageFooter`, `SiteNavigationHeader`.
- `chat/` — The chat demo components.
- `demo/` — The demo pages and their sections.

Each tier has its own README with the component list and usage examples.

- [base](./base/README.md)
- [ui](./ui/README.md)
- [layout](./layout/README.md)
- [chat](./chat/README.md)
- [demo](./demo/README.md)
- [assets/icons](../assets/icons/README.md)

## Rules

The rules for every component are in [`AGENTS.md`](./AGENTS.md). The most important
rules are:

- One root class per component, prefixed by the tier.
- Scoped stylesheets, nested under the root class.
- Named states as `is-*` classes.
- Class names built with `clsx()` from `@lib/clsx`.
- Token-only CSS with `var(--token)`.
- Cross-directory imports use the aliases `@components`, `@assets`, `@lib`, and
  `@styles`. Same-directory imports stay relative.

## Add a component

1. Put the component in the lowest tier that fits.
2. Create `<Name>.tsx` and `<Name>.css` next to it.
3. Give the root element one tier-prefixed class.
4. Wrap every value in `var(--token)`.
5. Import the stylesheet last.
6. Update the README of the tier.

Component rendering tests are not written. See [`AGENTS.md`](./AGENTS.md) for the
reason.
