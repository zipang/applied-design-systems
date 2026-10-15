# AGENTS.md — demo components

Rules for the component library under `packages/theme-editor/src/components/`. The
root, tool, and `src/AGENTS.md` rules still apply.

## Tiers

Components live in tiers. Place each component in the lowest tier that fits.

- **`base/`** — low-level primitives (`Box`, `Heading`, `Text`, `Icon`). `Heading` and
  `Text` replace raw text tags. `Box` is the token-driven structural primitive.
- **`ui/`** — Radix UI wrappers and generic UI primitives (`Button`,
  `TextField`, `DropdownMenu`, `Dialog`, `ScrollArea`).
- **`layout/`** — layout primitives only (`Container`, `VStack`, `HStack`, `Grid`, and the
  page shell: `PageLayout`, `PageHeader`, `PageBody`, `PageFooter`,
  `SiteNavigationHeader`).
- **`editor/`** — editor controls (`Toolbar`, `Fields`, `TokenReference`,
  `IssuesPanel`).
- **`preview/`** — preview sections (`Preview`).

Rules:

- Product-named components live in `editor/` or `preview/`, never in `layout/` or `ui/`.
- Dependencies flow downward only: `editor` and `preview` may use `ui`, `layout`, and
  `base`; never the reverse.
- **No raw `h1`–`h6` or `p` in pages or components.** Typography goes through
  `base/Heading` and `base/Text` exclusively.

## Styling

- **Token-only CSS.** Use `var(--token)` for every color, size, radius, and shadow.
  Never write a raw value.
- **Mono for UI.** Every UI component uses `--font-family-mono`. Only `base/Heading`
  (display) and `base/Text` (base) use the other font families.
- **Minimum UI text size.** UI chrome and controls never use `--font-size-xs`; the
  smallest UI size is `--font-size-sm`. (`--font-size-xs` stays defined for the token
  scale and may only be rendered as previewed content, never as tool UI.)
- **One unique class per component, prefixed by tier.** The root element carries one
  class: `base-<name>`, `ui-<name>`, `layout-<name>`, or `chat-<name>` (for example
  `ui-button`, never `.button`).
- **Scoped stylesheets.** Every rule in a component stylesheet is nested under the
  component's root class. Use native CSS nesting for states and descendants, so the
  file folds as one block. Compound Radix components with portals are the documented
  exception: pieces that are not descendants of the root (a dropdown trigger, a dialog
  overlay) use their own `ui-<component>__<part>` class and their own scoped block.
- **Named states are classes.** Every named state has an `is-<state>` class nested under
  the root (`.ui-button.is-loading`). When Radix exposes a state only as a `data-*`
  attribute, mirror it to the matching `is-*` class. Common states: `is-disabled`,
  `is-loading`, `is-active`, `is-open`, `is-selected`, `is-invalid`, `is-readonly`,
  `is-placeholder`.
- **Compose classes with `clsx()`** from `@lib/clsx`.
- **Page shell.** `PageLayout` is the `main` grid; `PageHeader`/`PageBody`/`PageFooter`
  are its `header`/`article`/`footer` rows and self-position by `grid-row`, so a page
  renders only the regions it needs. `PageBody` is the scroller; it attaches the scroll
  ref from `layout/page-scroll.ts`. `SiteNavigationHeader` collapses on scroll-down via
  `lib/scroll/useScrollDirection.ts`. Never nest a `<header>` inside another `<header>`:
  a page's own header block goes in `PageBody` (the `article`).

## The box surface

`base/Box` exposes the box aspects as enum props through `BoxProperties`: spacing
(`p`, `px`, `py`, `m`, `mx`, `my`), `border` and `borderColor`, `elevation`, `rounded`,
and `background`. A component consumes the surface in one of three modes.

1. **Inherit.** The props extend `BoxProperties`, and the component spreads the
   remaining props onto an internal `Box`. A caller can override every box aspect.
   `DialogContent` does this.
2. **Layout inherit.** A layout primitive extends `BoxProperties` and merges
   `boxClassNames(props)` into its own root class. `boxClassNames` always returns the
   root `base-box` class, so the aspect rules always match. `HStack`, `VStack`, `Grid`,
   and `Container` do this.
3. **Compose.** The component renders a `Box` internally and keeps its `DESIGN.md` look
   in CSS. The `Message` bubble does this.

A component that exposes a box aspect must not set that aspect in its own stylesheet.
`Box.css` and the component stylesheet have equal specificity, so the winner would
depend on import order. Set the default on the prop instead.

## Common props

Every base and layout component extends `CommonProps` and forwards the result of
`acceptCommonProps(rest)` to its root element. The helper keeps a curated set and drops
every other key, so a component's own props cannot leak onto the DOM.

- Named attributes: `id`, `role`, `title`, `tabIndex`, `hidden`, `lang`, `dir`.
- Families: every `aria-*` attribute, every `data-*` attribute, and every `on*` handler.

`className` and `style` are not common props. A component owns its `className` and its
token styling. Destructure the component's own props, then spread the result:

```tsx
export const Thing: React.FC<ThingProps> = ({ label, className, ...rest }) => (
	<div className={clsx("ui-thing", className)} {...acceptCommonProps(rest)}>
		{label}
	</div>
);
```

`acceptCommonProps` and `CommonProps` live in `@lib/common-props`. Add them to a
component in `ui/`, `chat/`, or `demo/` when you next touch it.

## Example

```tsx
import type * as React from "react";
import { clsx } from "@lib/clsx";
import "./Button.css";

interface ButtonProps {
	label: string;
	onClick: () => void;
	loading?: boolean;
	disabled?: boolean;
}

/**
 * Token-styled button. Named states are exposed as `is-*` classes.
 */
export const Button: React.FC<ButtonProps> = ({ label, onClick, loading, disabled }) => (
	<button
		type="button"
		className={clsx("ui-button", { "is-loading": loading, "is-disabled": disabled })}
		disabled={disabled || loading}
		aria-busy={loading}
		onClick={onClick}
	>
		{label}
	</button>
);
```

```css
/* Button.css — every rule is scoped under .ui-button */
.ui-button {
	background: var(--color-brand-primary);
	color: var(--color-text-ondark);

	&.is-disabled {
		opacity: 0.5;
	}
}
```

## Tests

Component rendering tests are **intentionally omitted**. Radix UI primitives are
already tested upstream and this library only adds styling, so a DOM test of a wrapper
asserts little. Test pure logic (`src/lib/**`) and the per-theme token contract
instead. This is the documented exception to the root rule "one test per source".
