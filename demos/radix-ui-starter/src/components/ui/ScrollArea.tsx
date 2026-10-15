import { clsx } from "@lib/clsx";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import type * as React from "react";
import "./ScrollArea.css";

interface ScrollAreaProps {
	children: React.ReactNode;
	className?: string;
}

/**
 * A vertically scrollable region with a token-styled scrollbar.
 *
 * @param props The scroll area props.
 * @returns The rendered scroll area.
 */
export const ScrollArea: React.FC<ScrollAreaProps> = ({ children, className }) => (
	<ScrollAreaPrimitive.Root className={clsx("ui-scroll-area", className)} type="auto">
		<ScrollAreaPrimitive.Viewport className="ui-scroll-area__viewport">
			{children}
		</ScrollAreaPrimitive.Viewport>
		<ScrollAreaPrimitive.Scrollbar className="ui-scroll-area__scrollbar" orientation="vertical">
			<ScrollAreaPrimitive.Thumb className="ui-scroll-area__thumb" />
		</ScrollAreaPrimitive.Scrollbar>
	</ScrollAreaPrimitive.Root>
);
