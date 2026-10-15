import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import {
	BOX_BORDER_WIDTHS,
	BOX_COLORS,
	BOX_ELEVATIONS,
	BOX_ROUNDED,
	BOX_SPACES,
	type BoxProperties,
	boxClassNames
} from "./box-classes";

const ROOT = "base-box";

/** Split the space-joined class string into individual class names. */
const classesOf = (props: BoxProperties): string[] =>
	boxClassNames(props).split(" ").filter(Boolean);

describe("boxClassNames", () => {
	test("returns only the root class for an empty props object", () => {
		expect(boxClassNames({})).toBe(ROOT);
	});

	test("always includes the root class, so aspect rules always match", () => {
		expect(classesOf({ p: "md" })).toContain(ROOT);
	});

	test("maps every spacing step for each spacing prop", () => {
		for (const step of BOX_SPACES) {
			expect(boxClassNames({ p: step })).toBe(`${ROOT} ${ROOT}--p-${step}`);
			expect(boxClassNames({ px: step })).toBe(`${ROOT} ${ROOT}--px-${step}`);
			expect(boxClassNames({ py: step })).toBe(`${ROOT} ${ROOT}--py-${step}`);
			expect(boxClassNames({ m: step })).toBe(`${ROOT} ${ROOT}--m-${step}`);
			expect(boxClassNames({ mx: step })).toBe(`${ROOT} ${ROOT}--mx-${step}`);
			expect(boxClassNames({ my: step })).toBe(`${ROOT} ${ROOT}--my-${step}`);
		}
	});

	test("maps every rounded value", () => {
		for (const value of BOX_ROUNDED) {
			expect(boxClassNames({ rounded: value })).toBe(`${ROOT} ${ROOT}--rounded-${value}`);
		}
	});

	test("maps every elevation value", () => {
		for (const value of BOX_ELEVATIONS) {
			expect(boxClassNames({ elevation: value })).toBe(`${ROOT} ${ROOT}--elevation-${value}`);
		}
	});

	test("maps every border width value", () => {
		for (const value of BOX_BORDER_WIDTHS) {
			expect(boxClassNames({ border: value })).toBe(`${ROOT} ${ROOT}--border-${value}`);
		}
	});

	test("maps every color role for background and borderColor", () => {
		for (const role of BOX_COLORS) {
			expect(boxClassNames({ background: role })).toBe(`${ROOT} ${ROOT}--bg-${role}`);
			expect(boxClassNames({ borderColor: role })).toBe(
				`${ROOT} ${ROOT}--border-color-${role}`
			);
		}
	});

	test("orders uniform spacing before its axis so the axis class wins", () => {
		expect(boxClassNames({ p: "sm", px: "lg", m: "xs", mx: "xl" })).toBe(
			`${ROOT} ${ROOT}--p-sm ${ROOT}--px-lg ${ROOT}--m-xs ${ROOT}--mx-xl`
		);
	});

	test("returns every aspect class in a stable order for a full object", () => {
		expect(
			boxClassNames({
				p: "md",
				px: "lg",
				py: "base",
				m: "xs",
				mx: "sm",
				my: "xl",
				border: "sm",
				borderColor: "brand-primary",
				elevation: "lg",
				rounded: "md",
				background: "surface-alt"
			})
		).toBe(
			[
				ROOT,
				`${ROOT}--p-md`,
				`${ROOT}--px-lg`,
				`${ROOT}--py-base`,
				`${ROOT}--m-xs`,
				`${ROOT}--mx-sm`,
				`${ROOT}--my-xl`,
				`${ROOT}--border-sm`,
				`${ROOT}--border-color-brand-primary`,
				`${ROOT}--elevation-lg`,
				`${ROOT}--rounded-md`,
				`${ROOT}--bg-surface-alt`
			].join(" ")
		);
	});
});

/** Every aspect class `boxClassNames` can emit, gathered from the enum arrays. */
const emittableClasses = (): string[] => {
	const classes = new Set<string>();
	const add = (props: BoxProperties): void => {
		for (const cls of classesOf(props)) {
			classes.add(cls);
		}
	};

	add({});

	for (const step of BOX_SPACES) {
		add({ p: step, px: step, py: step, m: step, mx: step, my: step });
	}

	for (const value of BOX_BORDER_WIDTHS) {
		add({ border: value });
	}

	for (const value of BOX_ROUNDED) {
		add({ rounded: value });
	}

	for (const value of BOX_ELEVATIONS) {
		add({ elevation: value });
	}

	for (const role of BOX_COLORS) {
		add({ background: role });
		add({ borderColor: role });
	}

	return [...classes];
};

const escapeClassName = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

describe("Box.css", () => {
	const css = readFileSync(new URL("./Box.css", import.meta.url), "utf8");

	test("defines the base-box root", () => {
		expect(css).toMatch(/\.base-box\s*\{/);
	});

	test("defines a rule for every class boxClassNames can emit", () => {
		for (const cls of emittableClasses()) {
			expect(css).toMatch(new RegExp(`\\.${escapeClassName(cls)}(?![\\w-])`));
		}
	});

	test("orders the padding axis rule after the uniform rule", () => {
		expect(css.indexOf(".base-box--p-sm")).toBeLessThan(css.indexOf(".base-box--px-sm"));
	});

	test("orders the margin axis rule after the uniform rule", () => {
		expect(css.indexOf(".base-box--m-sm")).toBeLessThan(css.indexOf(".base-box--mx-sm"));
	});
});
