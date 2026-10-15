import { clsx } from "@lib/clsx";
import { acceptCommonProps, type CommonProps } from "@lib/common-props";
import type * as React from "react";
import "./Heading.css";

/** Heading levels, mapped to the `h1`–`h6` elements. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** Type sizes from the token scale. */
export type HeadingSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "display";

const DEFAULT_SIZE: Record<HeadingLevel, HeadingSize> = {
	1: "xl",
	2: "lg",
	3: "md",
	4: "sm",
	5: "sm",
	6: "xs"
};

interface HeadingProps extends CommonProps {
	level?: HeadingLevel;
	size?: HeadingSize;
	children: React.ReactNode;
	className?: string;
	ref?: React.Ref<HTMLHeadingElement>;
}

/**
 * Renders a heading element. `level` sets the tag; `size` sets the type size and
 * defaults to the level's step on the token scale.
 *
 * @param props The heading props.
 * @returns The rendered heading element.
 */
export const Heading: React.FC<HeadingProps> = ({
	level = 2,
	size,
	children,
	className,
	ref,
	...rest
}) => {
	const HeadingElt = `h${level}` as const;

	return (
		<HeadingElt
			ref={ref}
			className={clsx(
				"base-heading",
				`base-heading--${size ?? DEFAULT_SIZE[level]}`,
				className
			)}
			{...acceptCommonProps(rest)}
		>
			{children}
		</HeadingElt>
	);
};
