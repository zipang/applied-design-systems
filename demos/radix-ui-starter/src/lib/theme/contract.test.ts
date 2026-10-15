import { expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CONTRAST_TOKENS, updateThemeContrastTokens } from "@applied-design-systems/design-tokens";
import { parse } from "yaml";

const THEMES_DIR = join(import.meta.dir, "../../../themes");
const THEME_IDS = readdirSync(THEMES_DIR)
	.filter((name) => existsSync(join(THEMES_DIR, name, "design-tokens.css")))
	.sort();

/** Front-matter path to stylesheet variable, for the tokens every theme overrides. */
const COLOR_MAP: [string, string][] = [
	["colors.brand.primary", "--color-brand-primary"],
	["colors.brand.accent", "--color-brand-accent"],
	["colors.brand.secondary", "--color-brand-secondary"],
	["colors.action.success", "--color-action-success"],
	["colors.action.info", "--color-action-info"],
	["colors.action.warning", "--color-action-warning"],
	["colors.action.danger", "--color-action-danger"],
	["colors.text.base", "--color-text"],
	["colors.text.accent", "--color-text-accent"],
	["colors.text.muted", "--color-text-muted"],
	["colors.text.ondark", "--color-text-ondark"],
	["colors.surface.base", "--color-surface"],
	["colors.surface.alt", "--color-surface-alt"],
	["colors.surface.dark", "--color-surface-dark"]
];

const REQUIRED_COLOR_VARS = [
	"--color-brand-primary",
	"--color-brand-accent",
	"--color-action-success",
	"--color-action-info",
	"--color-action-warning",
	"--color-action-danger",
	"--color-text",
	"--color-surface",
	"--color-surface-alt"
];

const readTheme = (id: string, file: string): string =>
	readFileSync(join(THEMES_DIR, id, file), "utf8");

const frontMatter = (markdown: string): Record<string, unknown> => {
	const match = markdown.match(/^---\n([\s\S]*?)\n---/);

	if (!match?.[1]) {
		throw new Error("front matter not found");
	}

	return parse(match[1]) as Record<string, unknown>;
};

const cssVariables = (css: string): Record<string, string> => {
	const vars: Record<string, string> = {};
	const pattern = /(--[a-z0-9-]+):\s*([^;]+);/g;

	for (const match of css.matchAll(pattern)) {
		const key = match[1];
		const value = match[2];

		if (key && value) {
			vars[key] = value.trim();
		}
	}

	return vars;
};

const resolveValue = (value: string, vars: Record<string, string>): string => {
	const name = value.match(/^var\((--[a-z0-9-]+)\)$/)?.[1];

	return name ? (vars[name] ?? value) : value;
};

/** Compare values ignoring whitespace and case (color-mix spans lines). */
const normalize = (value: string, vars: Record<string, string>): string =>
	resolveValue(value, vars).toLowerCase().replace(/\s+/g, "");

const readPath = (source: unknown, path: string): unknown =>
	path.split(".").reduce<unknown>((current, key) => {
		if (current && typeof current === "object" && key in current) {
			return (current as Record<string, unknown>)[key];
		}

		return undefined;
	}, source);

for (const id of THEME_IDS) {
	test(`${id}: defines every required color token`, () => {
		const vars = cssVariables(readTheme(id, "design-tokens.css"));

		for (const name of REQUIRED_COLOR_VARS) {
			expect(vars[name]).toBeDefined();
		}
	});

	test(`${id}: contrast pairs match the derivation rule`, () => {
		const vars = cssVariables(readTheme(id, "design-tokens.css"));
		const derived = updateThemeContrastTokens(vars);

		for (const variable of CONTRAST_TOKENS) {
			expect(vars[variable]).toBe(derived[variable]);
		}
	});

	test(`${id}: DESIGN.md color values match design-tokens.css`, () => {
		const vars = cssVariables(readTheme(id, "design-tokens.css"));
		const data = frontMatter(readTheme(id, "DESIGN.md"));

		for (const [path, cssVar] of COLOR_MAP) {
			const declared = readPath(data, path);

			if (declared === undefined) {
				continue;
			}

			const cssValue = vars[cssVar] ?? "";

			expect(cssValue).not.toBe("");
			expect(normalize(String(declared), vars)).toBe(normalize(cssValue, vars));
		}
	});
}
