import { describe, expect, test } from "bun:test";
import { contrastLevel, contrastRatio, isLight, relativeLuminance } from "./contrast";

describe("contrast", () => {
	test("black on white is 21:1", () => {
		expect(contrastRatio("#000000", "#ffffff")).toBe(21);
	});

	test("relativeluminance ignores an invalid value", () => {
		expect(relativeLuminance("nope")).toBe(0);
	});

	test("levels follow WCAG thresholds", () => {
		expect(contrastLevel(7)).toBe("AAA");
		expect(contrastLevel(4.5)).toBe("AA");
		expect(contrastLevel(3)).toBe("AA Large");
		expect(contrastLevel(2.9)).toBe("Fail");
	});

	test("isLight treats white as light and black as dark", () => {
		expect(isLight("#ffffff")).toBe(true);
		expect(isLight("#000000")).toBe(false);
	});
});
