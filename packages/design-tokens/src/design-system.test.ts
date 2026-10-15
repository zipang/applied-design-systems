import { describe, expect, test } from "bun:test";
import {
	createDefaultValues,
	GROUP_LABELS,
	groupTokens,
	isIgnoredPath,
	TOKENS,
	tokenByPath,
	tokenByVariable
} from "./design-system";

describe("design-system registry", () => {
	test("every variable is unique and prefixed", () => {
		const variables = TOKENS.map((token) => token.variable);
		expect(new Set(variables).size).toBe(variables.length);

		for (const variable of variables) {
			expect(variable.startsWith("--")).toBe(true);
		}
	});

	test("required tokens have no fallback; optional tokens do", () => {
		for (const token of TOKENS) {
			if (token.required) {
				expect(token.fallback).toBeUndefined();
			} else {
				expect(typeof token.fallback).toBe("string");
			}
		}
	});

	test("maps the drop-.base paths and families", () => {
		expect(tokenByPath("colors.text.base")?.variable).toBe("--color-text");
		expect(tokenByPath("colors.surface.base")?.variable).toBe("--color-surface");
		expect(tokenByPath("typography.base.fontFamily")?.variable).toBe("--font-family-base");
		expect(tokenByVariable("--space-base")?.path).toBe("spacing.base");
	});

	test("stylesheet-only tokens have no front-matter path", () => {
		for (const variable of [
			"--font-size-md",
			"--font-weight-bold",
			"--line-height-tight",
			"--letter-spacing-wide"
		]) {
			expect(tokenByVariable(variable)?.path).toBeUndefined();
		}
	});

	test("grouping covers every token", () => {
		const grouped = groupTokens().flatMap((entry) => entry.tokens);
		expect(grouped.length).toBe(TOKENS.length);
		expect(groupTokens().length).toBe(GROUP_LABELS.length);
	});

	test("ignore list covers metadata, components, and typography presets", () => {
		expect(isIgnoredPath("version")).toBe(true);
		expect(isIgnoredPath("components.button")).toBe(true);
		expect(isIgnoredPath("typography.base.lineHeight")).toBe(true);
		expect(isIgnoredPath("colors.brand.primary")).toBe(false);
	});

	test("defaults keep documented fallbacks", () => {
		const values = createDefaultValues();
		expect(values["--color-brand-secondary"]).toBe("var(--color-brand-primary)");
		expect(values["--elevation-sm"]).toBe("none");
	});
});
