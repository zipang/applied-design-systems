import { clsx } from "@lib/clsx";
import { acceptCommonProps, type CommonProps } from "@lib/common-props";
import type * as React from "react";
import { useMemo, useState } from "react";
import { PageScrollContext } from "./page-scroll";
import "./PageLayout.css";

interface PageLayoutProps extends CommonProps {
	children: React.ReactNode;
	className?: string;
}

/**
 * Viewport-tall application shell. Its header and footer stay pinned while its body
 * scrolls. Children self-position by grid row, so the regions are optional and their
 * order does not matter. The scrolling body element is shared through the page scroll
 * context; holding the element (not a ref) lets consumers re-subscribe when a page swap
 * replaces the body.
 *
 * @param props The optional class and the shell content.
 * @returns The rendered element.
 */
export const PageLayout: React.FC<PageLayoutProps> = ({ children, className, ...rest }) => {
	const [element, setElement] = useState<HTMLElement | null>(null);
	const value = useMemo(() => ({ element, setElement }), [element]);

	return (
		<PageScrollContext.Provider value={value}>
			<main className={clsx("layout-page", className)} {...acceptCommonProps(rest)}>
				{children}
			</main>
		</PageScrollContext.Provider>
	);
};
