import { clsx } from "@lib/clsx";
import { acceptCommonProps, type CommonProps } from "@lib/common-props";
import type * as React from "react";
import "./PageHeader.css";

interface PageHeaderProps extends CommonProps {
	children: React.ReactNode;
	className?: string;
}

/**
 * The page's fixed top region. Scoped to the shell, so it is not a banner landmark.
 *
 * @param props The optional class and the region content.
 * @returns The rendered element.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({ children, className, ...rest }) => (
	<header className={clsx("layout-page-header", className)} {...acceptCommonProps(rest)}>
		{children}
	</header>
);
