import { Box, type BoxProperties } from "@components/base/Box";
import { Heading } from "@components/base/Heading";
import { Text } from "@components/base/Text";
import { clsx } from "@lib/clsx";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import type * as React from "react";
import "./Dialog.css";

interface DialogProps {
	children: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

/**
 * Root of a modal dialog. Composes with {@link DialogTrigger} and {@link DialogContent}.
 *
 * @param props The content, open state, and open-change callback.
 * @returns The rendered element.
 */
export const Dialog: React.FC<DialogProps> = ({ children, open, onOpenChange }) => (
	<DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
		{children}
	</DialogPrimitive.Root>
);

interface DialogTriggerProps {
	children: React.ReactNode;
	className?: string;
}

/**
 * Opens the dialog. Rendered as a button.
 *
 * @param props The optional class and the trigger content.
 * @returns The rendered element.
 */
export const DialogTrigger: React.FC<DialogTriggerProps> = ({ children, className }) => (
	<DialogPrimitive.Trigger className={clsx("ui-dialog__trigger", className)}>
		{children}
	</DialogPrimitive.Trigger>
);

interface DialogContentProps extends BoxProperties {
	title: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
}

/**
 * The portaled dialog surface, with a title, optional description, and a close button.
 * The surface is a `Box`: it inherits `BoxProperties`, so a caller can override any box
 * aspect, and the token defaults keep the dialog's own look.
 *
 * @param props The title, description, box aspects, and content.
 * @returns The rendered element.
 */
export const DialogContent: React.FC<DialogContentProps> = ({
	title,
	description,
	children,
	className,
	...box
}) => (
	<DialogPrimitive.Portal>
		<DialogPrimitive.Overlay className="ui-dialog__overlay" />
		<DialogPrimitive.Content asChild>
			<Box
				background="surface"
				border="sm"
				borderColor="brand-secondary"
				rounded="none"
				elevation="lg"
				p="lg"
				className={clsx("ui-dialog", className)}
				{...box}
			>
				<DialogPrimitive.Title asChild>
					<Heading level={2}>{title}</Heading>
				</DialogPrimitive.Title>
				{description ? (
					<DialogPrimitive.Description asChild>
						<Text size="md" tone="muted">
							{description}
						</Text>
					</DialogPrimitive.Description>
				) : null}
				{children}
				<DialogPrimitive.Close className="ui-dialog__close" aria-label="Close">
					×
				</DialogPrimitive.Close>
			</Box>
		</DialogPrimitive.Content>
	</DialogPrimitive.Portal>
);
