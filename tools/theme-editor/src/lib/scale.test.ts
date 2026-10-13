import { describe, expect, test } from "bun:test";
import {
	formatRem,
	geometricSpacingScaleRem,
	linearSpacingScaleRem,
	SPACE_MULTIPLIER_DEFAULT,
	SPACE_SEED_DEFAULT,
	SPACE_UNIT_DEFAULT,
	typeScaleRem
} from "./scale";

describe("scales", () => {
	test("type scale keeps the base at 1rem", () => {
		const scale = typeScaleRem(1.5);
		expect(scale.md).toBe("1rem");
		expect(scale.lg).toBe("1.5rem");
		expect(scale.xs).toBe(`${Number(1.5 ** -2)}rem`);
	});

	test("linear spacing scale matches the skill's multipliers", () => {
		const scale = linearSpacingScaleRem(SPACE_UNIT_DEFAULT);
		expect(scale.xs).toBe("0.25rem");
		expect(scale.base).toBe("1rem");
		expect(scale.xxl).toBe("3rem");
	});

	test("geometric spacing scale grows from the seed", () => {
		const scale = geometricSpacingScaleRem(SPACE_SEED_DEFAULT, SPACE_MULTIPLIER_DEFAULT);
		expect(scale.base).toBe("1rem");
		expect(scale.lg).toBe("1.5rem");
		expect(scale.sm).toBe("0.4444rem");
		expect(scale.xxl).toBe("3.375rem");
	});

	test("the seed lands on the base step", () => {
		const scale = geometricSpacingScaleRem(2, 2);
		expect(scale.base).toBe("2rem");
		expect(scale.md).toBe("1rem");
		expect(scale.lg).toBe("4rem");
	});

	test("formatRem trims trailing zeros", () => {
		expect(formatRem(16)).toBe("1rem");
		expect(formatRem(24)).toBe("1.5rem");
	});
});
