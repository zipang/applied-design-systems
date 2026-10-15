import { expect, test } from "bun:test";
import type { Rgb } from "./color-contrast";
import { contrastRatio, parseHex, relativeLuminance } from "./color-contrast";

const rgb = (hex: string): Rgb => {
	const value = parseHex(hex);

	if (!value) {
		throw new Error(`invalid hex: ${hex}`);
	}

	return value;
};

test("parses six-digit hex", () => {
	expect(parseHex("#111111")).toEqual({ r: 17, g: 17, b: 17 });
	expect(parseHex("#005FCC")).toEqual({ r: 0, g: 95, b: 204 });
});

test("expands three-digit hex", () => {
	expect(parseHex("#fff")).toEqual({ r: 255, g: 255, b: 255 });
	expect(parseHex("#000")).toEqual({ r: 0, g: 0, b: 0 });
});

test("rejects non-hex values", () => {
	expect(parseHex("color-mix(in srgb, red 3%, white)")).toBeNull();
	expect(parseHex("rgba(0, 0, 0, 0.5)")).toBeNull();
	expect(parseHex("white")).toBeNull();
});

test("relative luminance spans black to white", () => {
	expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
	expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5);
});

test("black on white has the maximum ratio", () => {
	expect(contrastRatio(rgb("#000000"), rgb("#ffffff"))).toBeCloseTo(21, 5);
});

test("a known AA boundary pair is about 4.54:1", () => {
	const ratio = contrastRatio(rgb("#767676"), rgb("#ffffff"));

	expect(ratio).toBeGreaterThan(4.5);
	expect(ratio).toBeLessThan(4.6);
});
