import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	checkTheme,
	DESIGN_FILE,
	readTheme,
	safeThemePath,
	saveTheme,
	ThemeApiError,
	TOKENS_FILE
} from "./theme-api";

const readThemeFile = async (name: string): Promise<string> =>
	Bun.file(new URL(`../../${name}`, import.meta.url)).text();

let dir = "";
let designMd = "";
let tokensCss = "";

beforeAll(async () => {
	dir = await mkdtemp(join(tmpdir(), "dsv-"));
	designMd = await readThemeFile("DESIGN.md");
	tokensCss = await readThemeFile("design-tokens.css");
	await writeFile(join(dir, DESIGN_FILE), designMd);
	await writeFile(join(dir, TOKENS_FILE), tokensCss);
});

afterAll(async () => {
	await rm(dir, { recursive: true, force: true });
});

describe("theme-api", () => {
	test("reads and validates a project", async () => {
		const theme = await readTheme(dir);
		expect(theme.designMd).toBe(designMd);
		expect(theme.issues).toEqual([]);
	});

	test("checkTheme reports issues without writing", () => {
		const issues = checkTheme({
			designMd,
			tokensCss: tokensCss.replace("--space-md:", "--space-md-typo:")
		});
		expect(issues.some((issue) => issue.code === "missing-token")).toBe(true);
	});

	test("saves a valid payload", async () => {
		const edited = {
			designMd: designMd.replaceAll("#2d2dff", "#2d2dfe"),
			tokensCss: tokensCss.replaceAll("#2d2dff", "#2d2dfe")
		};
		const issues = await saveTheme(dir, edited);
		expect(issues.filter((issue) => issue.level === "error")).toEqual([]);
		expect(await readFile(join(dir, DESIGN_FILE), "utf8")).toContain("#2d2dfe");
	});

	test("refuses to save an invalid contract", async () => {
		await expect(
			saveTheme(dir, {
				designMd,
				tokensCss: tokensCss.replace("--space-md:", "--space-md-typo:")
			})
		).rejects.toBeInstanceOf(ThemeApiError);
	});

	test("rejects a non-contract filename", async () => {
		await expect(safeThemePath(dir, "secret.txt")).rejects.toBeInstanceOf(ThemeApiError);
	});

	test("rejects a missing directory", async () => {
		await expect(readTheme(join(dir, "nope"))).rejects.toBeInstanceOf(ThemeApiError);
	});

	test("rejects a symlink escape", async () => {
		const outside = await mkdtemp(join(tmpdir(), "dsv-outside-"));
		const outsideFile = join(outside, "outside.md");
		await writeFile(outsideFile, designMd);
		const escapeDir = await mkdtemp(join(tmpdir(), "dsv-escape-"));
		await symlink(outsideFile, join(escapeDir, DESIGN_FILE));
		await writeFile(join(escapeDir, TOKENS_FILE), tokensCss);
		await expect(readTheme(escapeDir)).rejects.toBeInstanceOf(ThemeApiError);
		await rm(outside, { recursive: true, force: true });
		await rm(escapeDir, { recursive: true, force: true });
	});
});
