import { type BoxProperties, boxClassNames } from "@components/base/Box";
import { clsx } from "@lib/clsx";
import { acceptCommonProps, type CommonProps } from "@lib/common-props";
import type * as React from "react";
import "./HStack.css";
import type { Space } from "./space";

interface HStackProps extends BoxProperties, CommonProps {
	gap?: Space;
	align?: "start" | "center" | "end" | "stretch";
	justify?: "start" | "center" | "end" | "between";
	wrap?: boolean;
	children: React.ReactNode;
	className?: string;
}

/**
 * Stacks children horizontally with an optional token gap, alignment, distribution,
 * and the full box surface.
 *
 * @param props The gap, alignment, distribution, wrapping, box aspects, and content.
 * @returns The rendered element.
 */
export const HStack: React.FC<HStackProps> = ({
	gap = "md",
	align = "center",
	justify = "start",
	wrap = false,
	children,
	className,
	...rest
}) => (
	<div
		className={clsx(
			"layout-hstack",
			`layout-hstack--gap-${gap}`,
			`layout-hstack--align-${align}`,
			`layout-hstack--justify-${justify}`,
			{ "layout-hstack--wrap": wrap },
			boxClassNames(rest),
			className
		)}
		{...acceptCommonProps(rest)}
	>
		{children}
	</div>
);
