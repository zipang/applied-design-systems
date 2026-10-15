# AGENTS.md — demo TypeScript

TypeScript rules for `demos/radix-ui-starter/src/`. The root and demo `AGENTS.md`
still apply.

- **Arrow functions only.** No `function` declarations for components or helpers.
- **React types.** Use `import type * as React from "react"`. Type-only imports are
  erased at build time, so they never affect the bundle.
- **JSDoc is mandatory** on every exported symbol. State the contract, not the obvious.
- **Object parameters use named interfaces.** Do not inline object types in a signature.
- **`Elt` suffix** for variables that hold a DOM element (for example `composerElt`).
- **No `any`.** Use `unknown` only at a true boundary and state the boundary in JSDoc.
- **Comments explain *why* only**, at non-obvious branches. Do not narrate the code.
- **Path aliases.** Import across directories with the aliases `@components`,
  `@assets`, `@lib`, and `@styles`. The package declares them in
  `demos/radix-ui-starter/tsconfig.json`. Keep imports within the same directory
  relative (for example `./Foo`).
- **Class names use `clsx()`** from `@lib/clsx`. Never concatenate strings by hand
  and never add an external class-name library.
- **Stylesheet import is the last import** in a component module.
- **Logic is tested.** Colocate `<name>.test.ts` next to logic modules. Component
  rendering tests are intentionally omitted (see `src/components/AGENTS.md`).
- Run `bun run lint`, `bun run typecheck`, and `bun test` before committing.

## Example

```ts
import { clsx } from "@lib/clsx";

interface BadgeClassOptions {
	size: "sm" | "md";
	active?: boolean;
}

/**
 * Compose the class string for a badge. `is-active` marks the selected state.
 */
export const badgeClass = ({ size, active }: BadgeClassOptions): string =>
	clsx(`base-badge base-badge--${size}`, { "is-active": active });
```
