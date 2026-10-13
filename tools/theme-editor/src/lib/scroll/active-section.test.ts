import { expect, test } from "bun:test";
import { type SectionSpan, sectionAtLine } from "./active-section";

const SECTIONS: SectionSpan[] = [
	{ id: "typography", top: -400, bottom: 200 },
	{ id: "colors", top: 200, bottom: 900 },
	{ id: "spacing", top: 900, bottom: 1600 }
];

test("picks the section the line falls inside", () => {
	expect(sectionAtLine(SECTIONS, 0)).toBe("typography");
	expect(sectionAtLine(SECTIONS, 500)).toBe("colors");
	expect(sectionAtLine(SECTIONS, 1599)).toBe("spacing");
});

test("treats a section's top as inside it", () => {
	expect(sectionAtLine(SECTIONS, 200)).toBe("colors");
	expect(sectionAtLine(SECTIONS, 900)).toBe("spacing");
});

test("gives a line in the gap between sections to the one above", () => {
	const gapped = [
		{ id: "a", top: -100, bottom: 0 },
		{ id: "b", top: 40, bottom: 400 }
	];
	expect(sectionAtLine(gapped, 20)).toBe("a");
});

test("gives a line past the last section to the last section", () => {
	const gapped = [
		{ id: "a", top: -100, bottom: 0 },
		{ id: "b", top: 40, bottom: 400 }
	];
	expect(sectionAtLine(gapped, 900)).toBe("b");
});

test("gives a line above every section to the first", () => {
	const below = [
		{ id: "a", top: 300, bottom: 600 },
		{ id: "b", top: 600, bottom: 900 }
	];
	expect(sectionAtLine(below, 100)).toBe("a");
});

test("returns undefined with no sections", () => {
	expect(sectionAtLine([], 100)).toBeUndefined();
});
