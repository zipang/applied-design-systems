import { clsx } from "@lib/clsx";
import type * as React from "react";
import "./Pill.css";

/** Semantic tone of a {@link Pill}. */
export type PillTone = "neutral" | "accent" | "success" | "warning" | "danger";

export interface PillProps {
	tone?: PillTone;
	/** Accessible name and tooltip. Without it the pill is decorative. */
	label?: string;
	/** Enlarged marker used for the active navigation item. */
	active?: boolean;
	className?: string;
}

/**
 * A small round state marker shared by the section navigation and the toolbar's save
 * state. The pill carries color only; its label lives in the `title`/`aria-label`.
 *
 * @param props The tone, optional label, active state, and optional class.
 * @returns The rendered element.
 */
export const Pill: React.FC<PillProps> = ({ tone = "neutral", label, active, className }) => {
	const classes = clsx("ui-pill", `ui-pill--${tone}`, { "is-active": active }, className);

	return label ? (
		<span className={classes} role="img" aria-label={label} title={label} />
	) : (
		<span className={classes} aria-hidden="true" />
	);
};
