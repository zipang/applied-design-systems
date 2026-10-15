import { clsx } from "@lib/clsx";
import { acceptCommonProps, type CommonProps } from "@lib/common-props";
import type * as React from "react";
import { type BoxProperties, boxClassNames } from "./box-classes";
import "./Box.css";

export type {
	BoxBorderWidth,
	BoxColor,
	BoxElevation,
	BoxProperties,
	BoxRounded,
	BoxSpace
} from "./box-classes";
export {
	BOX_BORDER_WIDTHS,
	BOX_COLORS,
	BOX_ELEVATIONS,
	BOX_ROUNDED,
	BOX_SPACES,
	boxClassNames
} from "./box-classes";

/**
 * Semantic tags `Box` may emit. `div` is the default. The set is deliberately small:
 * `Box` is a structural primitive, not a general HTML factory.
 */
export type BoxTag =
	| "div"
	| "span"
	| "section"
	| "article"
	| "aside"
	| "header"
	| "footer"
	| "nav"
	| "main";

export interface BoxProps extends BoxProperties, CommonProps {
	as?: BoxTag;
	children?: React.ReactNode;
	className?: string;
	ref?: React.Ref<HTMLElement>;
}

/**
 * The props `Box` passes to the emitted element. The polymorphic `ref` is typed once
 * here so TypeScript does not have to resolve a different ref type per tag.
 */
type BoxElementProps = React.HTMLAttributes<HTMLElement> & {
	ref?: React.Ref<HTMLElement>;
};

/**
 * A token-driven box. Every aspect prop accepts only a token-derived enum; the `as`
 * prop picks the emitted semantic tag. Forwards `ref` and the common HTML attributes to
 * the element, so it works as a Radix `asChild` target.
 *
 * @param props The box props.
 * @returns The rendered element.
 */
export const Box: React.FC<BoxProps> = ({
	as = "div",
	className,
	children,
	ref,
	p,
	px,
	py,
	m,
	mx,
	my,
	border,
	borderColor,
	elevation,
	rounded,
	background,
	...rest
}) => {
	const BoxElt = as as React.ElementType<BoxElementProps>;

	return (
		<BoxElt
			ref={ref}
			className={clsx(
				boxClassNames({
					p,
					px,
					py,
					m,
					mx,
					my,
					border,
					borderColor,
					elevation,
					rounded,
					background
				}),
				className
			)}
			{...acceptCommonProps(rest)}
		>
			{children}
		</BoxElt>
	);
};
