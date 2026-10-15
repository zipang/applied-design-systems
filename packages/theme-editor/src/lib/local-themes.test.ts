import { describe, expect, test } from "bun:test";
import {
	deleteLocalTheme,
	listLocalThemes,
	readLastThemeName,
	readLocalTheme,
	type ThemeStorage,
	writeLastThemeName,
	writeLocalTheme
} from "./local-themes";

const createStorage = (): ThemeStorage => {
	const map = new Map<string, string>();

	return {
		getItem: (key) => map.get(key) ?? null,
		setItem: (key, value) => {
			map.set(key, value);
		},
		removeItem: (key) => {
			map.delete(key);
		}
	};
};

describe("local theme library", () => {
	test("writes, reads, and lists themes", () => {
		const storage = createStorage();
		writeLocalTheme("Alpha", { designMd: "a", tokensCss: "a" }, storage);
		writeLocalTheme("Beta", { designMd: "b", tokensCss: "b" }, storage);

		expect(
			listLocalThemes(storage)
				.map((theme) => theme.name)
				.sort()
		).toEqual(["Alpha", "Beta"]);
		expect(readLocalTheme("Alpha", storage)?.designMd).toBe("a");
		expect(readLocalTheme("Missing", storage)).toBeNull();
	});

	test("overwrites an existing theme", () => {
		const storage = createStorage();
		writeLocalTheme("Alpha", { designMd: "a", tokensCss: "a" }, storage);
		writeLocalTheme("Alpha", { designMd: "a2", tokensCss: "a2" }, storage);

		expect(listLocalThemes(storage)).toHaveLength(1);
		expect(readLocalTheme("Alpha", storage)?.designMd).toBe("a2");
	});

	test("deletes a theme", () => {
		const storage = createStorage();
		writeLocalTheme("Alpha", { designMd: "a", tokensCss: "a" }, storage);
		deleteLocalTheme("Alpha", storage);
		expect(listLocalThemes(storage)).toEqual([]);
	});

	test("remembers and forgets the last theme name", () => {
		const storage = createStorage();
		writeLastThemeName("Alpha", storage);
		expect(readLastThemeName(storage)).toBe("Alpha");
		writeLastThemeName("", storage);
		expect(readLastThemeName(storage)).toBeNull();
	});

	test("tolerates corrupt storage", () => {
		const storage = createStorage();
		storage.setItem("ds-theme-editor:themes", "not json");
		expect(listLocalThemes(storage)).toEqual([]);
	});
});
