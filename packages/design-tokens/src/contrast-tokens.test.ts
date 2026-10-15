import { expect, test } from "bun:test";
import type { TokenList } from "./contrast-tokens";
import { updateThemeContrastTokens } from "./contrast-tokens";

test("uses the theme text token when it meets AA", () => {
	const next = updateThemeContrastTokens({
		"--color-text": "#111111",
		"--color-text-ondark": "#ffffff",
		"--color-brand-primary": "#111111"
	});

	expect(next["--color-on-primary"]).toBe("var(--color-text-ondark)");
});

test("falls back to black ink when neither text token meets AA", () => {
	const next = updateThemeContrastTokens({
		"--color-text": "#f8f8f2",
		"--color-text-ondark": "#ffffff",
		"--color-brand-primary": "#bd93f9"
	});

	expect(next["--color-on-primary"]).toBe("#000000");
});

test("falls back to white ink on a dark background", () => {
	const next = updateThemeContrastTokens({
		"--color-text": "#111111",
		"--color-text-ondark": "#222222",
		"--color-brand-primary": "#000000"
	});

	expect(next["--color-on-primary"]).toBe("#ffffff");
});

test("resolves var() references before measuring", () => {
	const next = updateThemeContrastTokens({
		"--color-text": "var(--color-ink)",
		"--color-ink": "#111111",
		"--color-text-ondark": "#ffffff",
		"--color-brand-primary": "#111111",
		"--color-brand-tertiary": "var(--color-brand-primary)"
	});

	expect(next["--color-on-primary"]).toBe("var(--color-text-ondark)");
	expect(next["--color-on-tertiary"]).toBe("var(--color-text-ondark)");
});

test("computes the surface pairs", () => {
	const next = updateThemeContrastTokens({
		"--color-text": "#111111",
		"--color-text-ondark": "#ffffff",
		"--color-surface-alt": "#f2f2f2",
		"--color-surface-card": "#111111"
	});

	expect(next["--color-on-alt"]).toBe("var(--color-text)");
	expect(next["--color-on-card"]).toBe("var(--color-text-ondark)");
});

test("does not mutate the input list", () => {
	const input: TokenList = {
		"--color-text": "#111111",
		"--color-text-ondark": "#ffffff",
		"--color-brand-primary": "#111111"
	};
	const copy = { ...input };

	const next = updateThemeContrastTokens(input);

	expect(input).toEqual(copy);
	expect(next).not.toBe(input);
	expect(next["--color-on-primary"]).toBe("var(--color-text-ondark)");
});

test("uses the default when a background is not a plain color", () => {
	const next = updateThemeContrastTokens({
		"--color-text": "#111111",
		"--color-text-ondark": "#ffffff",
		"--color-surface-alt": "color-mix(in srgb, #fff 50%, #000)"
	});

	expect(next["--color-on-alt"]).toBe("var(--color-text)");
});

test("returns the list unchanged when the text colors are unparseable", () => {
	const next = updateThemeContrastTokens({ "--color-brand-primary": "#111111" });

	expect(next).toEqual({ "--color-brand-primary": "#111111" });
});
