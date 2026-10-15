import { type BoxProperties, boxClassNames } from "@components/base/Box";
import { clsx } from "@lib/clsx";
import { acceptCommonProps, type CommonProps } from "@lib/common-props";
import type * as React from "react";
import "./Grid.css";
import type { Space } from "./space";

interface GridProps extends BoxProperties, CommonProps {
	columns?: 1 | 2 | 3 | 4;
	gap?: Space;
	children: React.ReactNode;
	className?: string;
}

/**
 * A grid with a fixed column count, an optional token gap, and the full box surface.
 *
 * @param props The grid props.
 * @returns The rendered grid.
 */
export const Grid: React.FC<GridProps> = ({
	columns = 1,
	gap = "md",
	children,
	className,
	...rest
}) => (
	<div
		className={clsx(
			"layout-grid",
			`layout-grid--columns-${columns}`,
			`layout-grid--gap-${gap}`,
			boxClassNames(rest),
			className
		)}
		{...acceptCommonProps(rest)}
	>
		{children}
	</div>
);
