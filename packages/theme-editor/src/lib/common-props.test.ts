import { describe, expect, test } from "bun:test";
import { acceptCommonProps, COMMON_ATTRIBUTES } from "./common-props";

describe("acceptCommonProps", () => {
	test("keeps every named common attribute", () => {
		const props = {
			id: "panel",
			role: "dialog",
			title: "A title",
			tabIndex: 0,
			hidden: true,
			lang: "en",
			dir: "ltr"
		};

		expect(acceptCommonProps(props)).toEqual(props);
	});

	test("keeps aria attributes, data attributes, and event handlers", () => {
		const onClick = (): void => undefined;
		const props = { "aria-label": "Close", "data-testid": "panel", onClick };

		expect(acceptCommonProps(props)).toEqual(props);
	});

	test("drops className, style, children, and unknown keys", () => {
		const result = acceptCommonProps({
			id: "keep",
			className: "drop",
			style: { color: "red" },
			children: "drop",
			foo: "drop"
		});

		expect(result).toEqual({ id: "keep" });
	});

	test("drops keys whose value is undefined", () => {
		expect(acceptCommonProps({ id: undefined, role: "dialog" })).toEqual({ role: "dialog" });
	});

	test("returns a new object instead of the input", () => {
		const props = { id: "panel" };

		expect(acceptCommonProps(props)).not.toBe(props);
	});

	test("exposes the named attribute list", () => {
		expect(COMMON_ATTRIBUTES).toEqual([
			"id",
			"role",
			"title",
			"tabIndex",
			"hidden",
			"lang",
			"dir"
		]);
	});
});
