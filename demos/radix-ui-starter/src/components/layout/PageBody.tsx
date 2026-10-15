import { clsx } from "@lib/clsx";
import { acceptCommonProps, type CommonProps } from "@lib/common-props";
import type * as React from "react";
import { usePageScroll } from "./page-scroll";
import "./PageBody.css";

interface PageBodyProps extends CommonProps {
	children: React.ReactNode;
	className?: string;
}

/**
 * The page's scroll region. Registers itself as the shell's scroll element so
 * descendants such as a collapsible navigation can observe it.
 *
 * @param props The page body props.
 * @returns The rendered page body.
 */
export const PageBody: React.FC<PageBodyProps> = ({ children, className, ...rest }) => {
	const pageScroll = usePageScroll();

	return (
		<article
			ref={pageScroll?.setElement}
			className={clsx("layout-page-body", className)}
			{...acceptCommonProps(rest)}
		>
			{children}
		</article>
	);
};
