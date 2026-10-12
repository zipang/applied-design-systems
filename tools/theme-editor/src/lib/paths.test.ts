import { describe, expect, test } from "bun:test";
import { getShortDisplayPath } from "./paths";

describe("getShortDisplayPath", () => {
	test("collapses the home prefix to a tilde", () => {
		expect(getShortDisplayPath("/home/ada/Projects/app", "/home/ada")).toBe("~/Projects/app");
	});

	test("shortens the home directory itself to a bare tilde", () => {
		expect(getShortDisplayPath("/home/ada", "/home/ada")).toBe("~");
	});

	test("tolerates a trailing slash on home", () => {
		expect(getShortDisplayPath("/home/ada/src", "/home/ada/")).toBe("~/src");
	});

	test("keeps a sibling with a shared prefix untouched", () => {
		expect(getShortDisplayPath("/home/adam/src", "/home/ada")).toBe("/home/adam/src");
	});

	test("returns the path unchanged when home is unknown", () => {
		expect(getShortDisplayPath("/home/ada/src")).toBe("/home/ada/src");
		expect(getShortDisplayPath("/home/ada/src", "")).toBe("/home/ada/src");
	});

	test("returns an empty string for an empty path", () => {
		expect(getShortDisplayPath("", "/home/ada")).toBe("");
	});

	test("ignores a root home directory", () => {
		expect(getShortDisplayPath("/etc/hosts", "/")).toBe("/etc/hosts");
	});
});
