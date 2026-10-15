import type * as React from "react";

/** Common HTML attribute names that every component forwards to its root element. */
export const COMMON_ATTRIBUTES = [
	"id",
	"role",
	"title",
	"tabIndex",
	"hidden",
	"lang",
	"dir"
] as const;

/**
 * Props shared by every component: a curated list of common HTML attributes, every
 * `aria-*` and `data-*` attribute, and event handlers. `className` and `style` stay
 * component-owned.
 */
export type CommonProps = Pick<
	React.HTMLAttributes<HTMLElement>,
	(typeof COMMON_ATTRIBUTES)[number]
> &
	Omit<React.DOMAttributes<HTMLElement>, "children" | "dangerouslySetInnerHTML"> &
	React.AriaAttributes & {
		[key: `data-${string}`]: string | number | boolean | undefined;
	};

const NAMED_ATTRIBUTES = new Set<string>(COMMON_ATTRIBUTES);

const isCommonAttribute = (name: string): boolean =>
	NAMED_ATTRIBUTES.has(name) ||
	name.startsWith("aria-") ||
	name.startsWith("data-") ||
	/^on[A-Z]/.test(name);

/**
 * Copy the curated common attributes from `props`. Drops `className`, `style`,
 * `children`, unknown keys, and keys with an `undefined` value, so a component's own
 * props cannot leak onto the DOM.
 *
 * @param props - The component props to filter.
 * @returns Only the attributes a root element may receive.
 */
export const acceptCommonProps = <T extends object>(props: T): CommonProps => {
	const accepted: Record<string, unknown> = {};

	for (const [name, value] of Object.entries(props)) {
		if (value !== undefined && isCommonAttribute(name)) {
			accepted[name] = value;
		}
	}

	return accepted as CommonProps;
};
