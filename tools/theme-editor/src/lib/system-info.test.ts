import { describe, expect, test } from "bun:test";
import { isAbsolute } from "node:path";
import { readSystemInfo } from "./system-info";

describe("readSystemInfo", () => {
	test("reports absolute home and working directories", () => {
		const info = readSystemInfo();
		expect(info.home.length).toBeGreaterThan(0);
		expect(isAbsolute(info.home)).toBe(true);
		expect(isAbsolute(info.cwd)).toBe(true);
	});
});
