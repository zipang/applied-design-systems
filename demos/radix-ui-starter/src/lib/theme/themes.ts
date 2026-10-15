import cyanCss from "../../../themes/cyan/design-tokens.css" with { type: "text" };
import draculaCss from "../../../themes/dracula/design-tokens.css" with { type: "text" };
import gruvboxCss from "../../../themes/gruvbox/design-tokens.css" with { type: "text" };
import magentaCss from "../../../themes/magenta/design-tokens.css" with { type: "text" };
import midnightCss from "../../../themes/midnight/design-tokens.css" with { type: "text" };
import monokaiCss from "../../../themes/monokai/design-tokens.css" with { type: "text" };
import paperCss from "../../../themes/paper/design-tokens.css" with { type: "text" };
import referenceCss from "../../../themes/reference/design-tokens.css" with { type: "text" };

/** Identifiers of the bundled themes. */
export type ThemeId =
	| "paper"
	| "midnight"
	| "cyan"
	| "magenta"
	| "reference"
	| "monokai"
	| "dracula"
	| "gruvbox";

/** A complete theme: its id, display label, and stylesheet text. */
export interface Theme {
	id: ThemeId;
	label: string;
	css: string;
}

/**
 * The themes available to the theme switcher. The first four are ported from the
 * applied-design-systems-eliza-chatbot-demo reference; `paper` is the default.
 */
export const themes: Theme[] = [
	{ id: "paper", label: "Paper", css: paperCss },
	{ id: "midnight", label: "Midnight", css: midnightCss },
	{ id: "cyan", label: "Cyan", css: cyanCss },
	{ id: "magenta", label: "Magenta", css: magentaCss },
	{ id: "reference", label: "Reference", css: referenceCss },
	{ id: "monokai", label: "Monokai", css: monokaiCss },
	{ id: "dracula", label: "Dracula", css: draculaCss },
	{ id: "gruvbox", label: "Gruvbox", css: gruvboxCss }
];

/** The theme used on first load. */
export const DEFAULT_THEME: ThemeId = "paper";

const FALLBACK_THEME: Theme = { id: DEFAULT_THEME, label: "Paper", css: "" };

/**
 * Return the theme with the given id. Fall back to the default theme when the id is
 * unknown.
 *
 * @param id The theme identifier.
 * @returns The matching theme, or the fallback theme.
 */
export const getTheme = (id: string): Theme =>
	themes.find((theme) => theme.id === id) ?? FALLBACK_THEME;
