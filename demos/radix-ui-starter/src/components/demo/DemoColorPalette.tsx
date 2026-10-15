import { Text } from "@components/base/Text";
import { clsx } from "@lib/clsx";
import type * as React from "react";
import "./DemoColorPalette.css";

interface Swatch {
	name: string;
	/** Background utility class from the shared utilities stylesheet. */
	background: string;
}

const SWATCHES: Swatch[] = [
	{ name: "brand primary", background: "bg-brand-primary" },
	{ name: "brand accent", background: "bg-brand-accent" },
	{ name: "brand secondary", background: "bg-brand-secondary" },
	{ name: "action success", background: "bg-success" },
	{ name: "action info", background: "bg-info" },
	{ name: "action warning", background: "bg-warning" },
	{ name: "action danger", background: "bg-danger" },
	{ name: "surface base", background: "bg-surface" },
	{ name: "surface alt", background: "bg-surface-alt" },
	{ name: "surface dark", background: "bg-surface-dark" }
];

/**
 * The color tokens as labeled swatches. Each swatch uses the token's background
 * utility class, so it re-themes with the active theme.
 *
 * @returns The rendered palette of swatches.
 */
export const DemoColorPalette: React.FC = () => (
	<div className="demo-color-palette">
		{SWATCHES.map((swatch) => (
			<div key={swatch.name} className="demo-color-palette__item">
				<span className={clsx("demo-color-palette__swatch", swatch.background)} />
				<Text size="sm" tone="muted">
					{swatch.name}
				</Text>
			</div>
		))}
	</div>
);
