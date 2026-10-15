import { type BoxProperties, boxClassNames } from "@components/base/Box";
import { clsx } from "@lib/clsx";
import { acceptCommonProps, type CommonProps } from "@lib/common-props";
import type * as React from "react";
import "./Container.css";

/**
 * Max-width presets for {@link Container}. `fluid` has no limit, `lg` is a wide
 * layout column, and `prose` is tuned to a comfortable reading measure (70ch).
 */
export type ContainerWidth = "fluid" | "lg" | "prose";

interface ContainerProps extends BoxProperties, CommonProps {
	as?: "div" | "main" | "section" | "nav";
	width?: ContainerWidth;
	children: React.ReactNode;
	className?: string;
}

/**
 * Centers content and applies horizontal padding. `width` picks the max width. The
 * inline padding is the default for the `px` box aspect, so callers can override any
 * box aspect (padding, margin, border, elevation, rounded, background).
 *
 * @param props The emitted tag, max width, box aspects, and content.
 * @returns The rendered element.
 */
export const Container: React.FC<ContainerProps> = ({
	as = "div",
	width = "lg",
	px = "lg",
	children,
	className,
	...rest
}) => {
	const ContainerElt: React.ElementType = as;

	return (
		<ContainerElt
			className={clsx(
				"layout-container",
				`layout-container--${width}`,
				boxClassNames({ px, ...rest }),
				className
			)}
			{...acceptCommonProps(rest)}
		>
			{children}
		</ContainerElt>
	);
};
