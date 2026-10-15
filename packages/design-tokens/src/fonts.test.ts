import { describe, expect, test } from "bun:test";
import { fontStackFamilies, googleFontImport, googleFontName } from "./fonts";

describe("fontStackFamilies", () => {
	test("strips quotes and generic keywords", () => {
		expect(fontStackFamilies('"Plus Jakarta Sans", system-ui, sans-serif')).toEqual([
			"Plus Jakarta Sans"
		]);
	});

	test("keeps every named family in order", () => {
		expect(fontStackFamilies("Georgia, 'Times New Roman', serif")).toEqual([
			"Georgia",
			"Times New Roman"
		]);
	});

	test("drops unresolved var() fragments", () => {
		expect(fontStackFamilies("var(--font-family-base)")).toEqual([]);
	});
});

describe("googleFontName", () => {
	test("matches the catalog case-insensitively and returns the canonical name", () => {
		expect(googleFontName("dm serif display")).toBe("DM Serif Display");
	});

	test("returns undefined for families outside the catalog", () => {
		expect(googleFontName("Helvetica Neue")).toBeUndefined();
	});
});

describe("googleFontImport", () => {
	test("builds one import with a shared weight axis", () => {
		expect(googleFontImport(["Plus Jakarta Sans", "JetBrains Mono"], [400, 700])).toBe(
			'@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;700&family=JetBrains+Mono:wght@400;700&display=swap");'
		);
	});

	test("dedupes families and sorts the weights", () => {
		expect(googleFontImport(["Inter", "Inter"], [700, 400, 700])).toBe(
			'@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap");'
		);
	});

	test("ignores families outside the catalog", () => {
		expect(googleFontImport(["Helvetica Neue", "Georgia"], [400])).toBe("");
	});

	test("returns an empty string when there are no families", () => {
		expect(googleFontImport([], [400, 700])).toBe("");
	});
});
