/** Spacing steps from the fixed token scale, in order. */
export const BOX_SPACES = ["xs", "sm", "md", "base", "lg", "xl", "xxl"] as const;

/** Spacing step from the fixed token scale. */
export type BoxSpace = (typeof BOX_SPACES)[number];

/** Corner radius tokens, in order. */
export const BOX_ROUNDED = ["none", "sm", "md", "lg", "full"] as const;

/** Corner radius token. */
export type BoxRounded = (typeof BOX_ROUNDED)[number];

/** Shadow tokens, in order. */
export const BOX_ELEVATIONS = ["sm", "md", "lg"] as const;

/** Shadow token. */
export type BoxElevation = (typeof BOX_ELEVATIONS)[number];

/** Border width tokens, in order. */
export const BOX_BORDER_WIDTHS = ["sm", "md", "lg"] as const;

/** Border width token. */
export type BoxBorderWidth = (typeof BOX_BORDER_WIDTHS)[number];

/**
 * Every color role exposed as a token. The value is the token name without the
 * `--color-` prefix: `surface-alt` maps to `--color-surface-alt`. Border colors are
 * not tokens, so a box picks the color token it needs for its border.
 */
export const BOX_COLORS = [
	"surface",
	"surface-alt",
	"surface-dark",
	"surface-card",
	"brand-primary",
	"brand-accent",
	"brand-secondary",
	"brand-tertiary",
	"action-success",
	"action-info",
	"action-warning",
	"action-danger"
] as const;

/** A color role exposed as a token. */
export type BoxColor = (typeof BOX_COLORS)[number];

/** Token-backed aspects of a box. Components inherit this to expose the full surface. */
export interface BoxProperties {
	p?: BoxSpace;
	px?: BoxSpace;
	py?: BoxSpace;
	m?: BoxSpace;
	mx?: BoxSpace;
	my?: BoxSpace;
	border?: BoxBorderWidth;
	borderColor?: BoxColor;
	elevation?: BoxElevation;
	rounded?: BoxRounded;
	background?: BoxColor;
}

/**
 * Translate box aspect props into the scoped class string. The string always includes
 * the root `base-box` class, then the aspect classes in a stable order: uniform spacing
 * before its axis, so the axis class wins on equal specificity.
 *
 * @param props The box aspects to translate.
 * @returns The scoped class string.
 */
export const boxClassNames = ({
	p,
	px,
	py,
	m,
	mx,
	my,
	border,
	borderColor,
	elevation,
	rounded,
	background
}: BoxProperties): string => {
	const classes: string[] = ["base-box"];

	if (p) {
		classes.push(`base-box--p-${p}`);
	}

	if (px) {
		classes.push(`base-box--px-${px}`);
	}

	if (py) {
		classes.push(`base-box--py-${py}`);
	}

	if (m) {
		classes.push(`base-box--m-${m}`);
	}

	if (mx) {
		classes.push(`base-box--mx-${mx}`);
	}

	if (my) {
		classes.push(`base-box--my-${my}`);
	}

	if (border) {
		classes.push(`base-box--border-${border}`);
	}

	if (borderColor) {
		classes.push(`base-box--border-color-${borderColor}`);
	}

	if (elevation) {
		classes.push(`base-box--elevation-${elevation}`);
	}

	if (rounded) {
		classes.push(`base-box--rounded-${rounded}`);
	}

	if (background) {
		classes.push(`base-box--bg-${background}`);
	}

	return classes.join(" ");
};
