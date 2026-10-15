import { clsx } from "@lib/clsx";
import { acceptCommonProps, type CommonProps } from "@lib/common-props";
import type * as React from "react";
import { icons } from "./icons";
import "./Icon.css";

/** Names of the bundled SVG icons. */
export type IconName = keyof typeof icons;

interface IconProps extends CommonProps {
	name: IconName;
	size?: "sm" | "md" | "lg";
	label?: string;
	className?: string;
}

/**
 * Renders a bundled SVG icon inline so its strokes follow `currentColor`. Give a
 * `label` for a meaningful icon. Without one the icon is decorative and hidden from
 * assistive technology.
 *
 * @param props The icon name, size, and optional label.
 * @returns The rendered element.
 */
export const Icon: React.FC<IconProps> = ({ name, size = "md", label, className, ...rest }) => {
	const a11y = label
		? ({ role: "img", "aria-label": label } as const)
		: ({ "aria-hidden": true } as const);

	const glyph = { dangerouslySetInnerHTML: { __html: icons[name] } };

	return (
		<span
			className={clsx("base-icon", `base-icon--${size}`, className)}
			{...acceptCommonProps(rest)}
			{...a11y}
			{...glyph}
		/>
	);
};
