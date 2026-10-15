import type { IconName } from "@components/base/Icon";
import { Icon } from "@components/base/Icon";
import { clsx } from "@lib/clsx";
import type * as React from "react";
import "./Button.css";

/** Visual variants for {@link Button}. */
export type ButtonVariant =
	| "primary"
	| "accent"
	| "secondary"
	| "ghost"
	| "success"
	| "warning"
	| "danger"
	| "info";

/** Sizes for {@link Button}. */
export type ButtonSize = "sm" | "default" | "lg";

interface ButtonProps {
	label?: string;
	icon?: IconName;
	ariaLabel?: string;
	onClick?: () => void;
	variant?: ButtonVariant;
	size?: ButtonSize;
	type?: "button" | "submit" | "reset";
	loading?: boolean;
	disabled?: boolean;
	className?: string;
	ref?: React.Ref<HTMLButtonElement>;
}

/**
 * Token-styled button. Named states are exposed as `is-loading` and `is-disabled`.
 *
 * @param props The button props.
 * @returns The rendered button.
 */
export const Button: React.FC<ButtonProps> = ({
	label,
	icon,
	ariaLabel,
	onClick,
	variant = "primary",
	size = "default",
	type = "button",
	loading = false,
	disabled = false,
	className,
	ref
}) => (
	<button
		ref={ref}
		type={type}
		className={clsx(
			"ui-button",
			`ui-button--${variant}`,
			`ui-button--${size}`,
			{ "is-loading": loading, "is-disabled": disabled },
			className
		)}
		disabled={disabled || loading}
		aria-busy={loading}
		aria-label={ariaLabel}
		onClick={onClick}
	>
		{icon ? <Icon name={icon} size={size === "sm" ? "sm" : "md"} /> : null}
		{label ? <span className="ui-button__label">{label}</span> : null}
	</button>
);
