import { type BoxProperties, boxClassNames } from "@components/base/Box";
import { clsx } from "@lib/clsx";
import { acceptCommonProps, type CommonProps } from "@lib/common-props";
import type * as React from "react";
import "./VStack.css";
import type { Space } from "./space";

interface VStackProps extends BoxProperties, CommonProps {
	gap?: Space;
	align?: "start" | "center" | "end" | "stretch";
	children: React.ReactNode;
	className?: string;
}

/**
 * Stacks children vertically with an optional token gap, cross-axis alignment, and the
 * full box surface.
 *
 * @param props The gap, cross-axis alignment, box aspects, and content.
 * @returns The rendered element.
 */
export const VStack: React.FC<VStackProps> = ({
	gap = "md",
	align = "stretch",
	children,
	className,
	...rest
}) => (
	<div
		className={clsx(
			"layout-vstack",
			`layout-vstack--gap-${gap}`,
			`layout-vstack--align-${align}`,
			boxClassNames(rest),
			className
		)}
		{...acceptCommonProps(rest)}
	>
		{children}
	</div>
);
