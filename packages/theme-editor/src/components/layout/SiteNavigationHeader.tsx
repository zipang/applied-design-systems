import { clsx } from "@lib/clsx";
import { acceptCommonProps, type CommonProps } from "@lib/common-props";
import { useHideOnScroll } from "@lib/scroll/useScrollDirection";
import type * as React from "react";
import { usePageScroll } from "./page-scroll";
import "./SiteNavigationHeader.css";

interface SiteNavigationHeaderProps extends CommonProps {
	children: React.ReactNode;
	className?: string;
}

/**
 * The primary site navigation. Collapses to zero height while the page body is scrolled
 * down and returns on scroll-up, so the body gains the space. While collapsed its
 * controls are inert and hidden from assistive technology.
 *
 * @param props The optional class and the navigation content.
 * @returns The rendered element.
 */
export const SiteNavigationHeader: React.FC<SiteNavigationHeaderProps> = ({
	children,
	className,
	...rest
}) => {
	const pageScroll = usePageScroll();
	const hidden = useHideOnScroll(pageScroll?.element ?? null);

	return (
		<div
			className={clsx("layout-site-navigation", { "is-hidden": hidden }, className)}
			{...acceptCommonProps(rest)}
		>
			<div
				className="layout-site-navigation__inner"
				inert={hidden || undefined}
				aria-hidden={hidden || undefined}
			>
				{children}
			</div>
		</div>
	);
};
