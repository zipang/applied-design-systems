import { createContext, useContext } from "react";

/** The page body scroll state shared by the shell. */
export interface PageScroll {
	/** The element that scrolls, or null before it mounts. */
	element: HTMLElement | null;
	/** Callback ref for the scrolling element. */
	setElement: (element: HTMLElement | null) => void;
}

export const PageScrollContext = createContext<PageScroll | null>(null);

/**
 * Read the page scroll state. Null when used outside a `PageLayout`.
 *
 * @returns The page scroll state, or null outside a `PageLayout`.
 */
export const usePageScroll = (): PageScroll | null => useContext(PageScrollContext);
