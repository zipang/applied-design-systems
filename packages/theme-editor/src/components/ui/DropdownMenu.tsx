import { clsx } from "@lib/clsx";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type * as React from "react";
import "./DropdownMenu.css";

interface DropdownMenuProps {
	children: React.ReactNode;
}

/**
 * Root of a dropdown menu. Composes with {@link DropdownMenuTrigger},
 * {@link DropdownMenuContent}, and {@link DropdownMenuItem}.
 *
 * @param props The menu content.
 * @returns The rendered element.
 */
export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => (
	<DropdownMenuPrimitive.Root>{children}</DropdownMenuPrimitive.Root>
);

interface DropdownMenuTriggerProps {
	children: React.ReactNode;
	className?: string;
}

/**
 * Opens the dropdown menu. Rendered as a button.
 *
 * @param props The optional class and the trigger content.
 * @returns The rendered element.
 */
export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({
	children,
	className
}) => (
	<DropdownMenuPrimitive.Trigger className={clsx("ui-dropdown__trigger", className)}>
		{children}
	</DropdownMenuPrimitive.Trigger>
);

interface DropdownMenuContentProps {
	children: React.ReactNode;
	align?: "start" | "center" | "end";
	className?: string;
}

/**
 * The portaled menu surface.
 *
 * @param props The optional class, alignment, and menu content.
 * @returns The rendered element.
 */
export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
	children,
	align = "start",
	className
}) => (
	<DropdownMenuPrimitive.Portal>
		<DropdownMenuPrimitive.Content
			className={clsx("ui-dropdown", className)}
			align={align}
			sideOffset={4}
		>
			{children}
		</DropdownMenuPrimitive.Content>
	</DropdownMenuPrimitive.Portal>
);

interface DropdownMenuItemProps {
	children: React.ReactNode;
	onSelect?: () => void;
	disabled?: boolean;
	className?: string;
}

/**
 * A selectable menu entry. Exposes `is-disabled` and `is-selected` classes.
 *
 * @param props The optional class, select callback, disabled state, and content.
 * @returns The rendered element.
 */
export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
	children,
	onSelect,
	disabled = false,
	className
}) => (
	<DropdownMenuPrimitive.Item
		className={clsx("ui-dropdown__item", { "is-disabled": disabled }, className)}
		disabled={disabled}
		onSelect={onSelect}
	>
		{children}
	</DropdownMenuPrimitive.Item>
);

/**
 * A horizontal separator between menu groups.
 *
 * @returns The rendered element.
 */
export const DropdownMenuSeparator: React.FC = () => (
	<DropdownMenuPrimitive.Separator className="ui-dropdown__separator" />
);

interface DropdownMenuLabelProps {
	children: React.ReactNode;
}

/**
 * A non-interactive label inside the menu.
 *
 * @param props The label content.
 * @returns The rendered element.
 */
export const DropdownMenuLabel: React.FC<DropdownMenuLabelProps> = ({ children }) => (
	<DropdownMenuPrimitive.Label className="ui-dropdown__label">
		{children}
	</DropdownMenuPrimitive.Label>
);
