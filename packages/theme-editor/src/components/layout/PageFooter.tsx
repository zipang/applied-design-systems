import { clsx } from "@lib/clsx";
import { acceptCommonProps, type CommonProps } from "@lib/common-props";
import type * as React from "react";
import "./PageFooter.css";

interface PageFooterProps extends CommonProps {
	children: React.ReactNode;
	className?: string;
}

/**
 * The page's fixed bottom region. Scoped to the shell, so it is not contentinfo.
 *
 * @param props The optional class and the region content.
 * @returns The rendered element.
 */
export const PageFooter: React.FC<PageFooterProps> = ({ children, className, ...rest }) => (
	<footer className={clsx("layout-page-footer", className)} {...acceptCommonProps(rest)}>
		{children}
	</footer>
);
