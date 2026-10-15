import { expect, test } from "bun:test";
import { nextScrollDirection, shouldHideHeader } from "./direction";

test("keeps the previous direction for movement under the threshold", () => {
	expect(nextScrollDirection(100, 103, "up", 8)).toBe("up");
	expect(nextScrollDirection(100, 97, "down", 8)).toBe("down");
});

test("flips downward once the threshold is passed", () => {
	expect(nextScrollDirection(100, 120, "up", 8)).toBe("down");
});

test("flips upward once the threshold is passed", () => {
	expect(nextScrollDirection(120, 100, "down", 8)).toBe("up");
});

test("flips on any movement when the threshold is zero", () => {
	expect(nextScrollDirection(100, 101, "up", 0)).toBe("down");
});

test("hides only while scrolling down below the top", () => {
	expect(shouldHideHeader("down", 100)).toBe(true);
	expect(shouldHideHeader("up", 100)).toBe(false);
	expect(shouldHideHeader("down", 0)).toBe(false);
});

test("honours an offset before hiding", () => {
	expect(shouldHideHeader("down", 4, 8)).toBe(false);
	expect(shouldHideHeader("down", 12, 8)).toBe(true);
});
