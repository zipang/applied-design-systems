import { expect, test } from "bun:test";
import { clsx } from "./clsx";

test("joins string and number values", () => {
	expect(clsx("ui-button", 2, "primary")).toBe("ui-button 2 primary");
});

test("drops falsy values", () => {
	expect(clsx("ui-button", null, undefined, false, "")).toBe("ui-button");
});

test("keeps the true keys of a conditional object", () => {
	expect(clsx("ui-button", { "is-loading": true, "is-disabled": false })).toBe(
		"ui-button is-loading"
	);
});

test("returns an empty string when nothing is kept", () => {
	expect(clsx(false, null, undefined)).toBe("");
});
