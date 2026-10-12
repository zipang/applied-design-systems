import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { listDirectories } from "./directories";
import { DESIGN_FILE, ThemeApiError, TOKENS_FILE } from "./theme-api";

let dir = "";

beforeAll(async () => {
	dir = await mkdtemp(join(tmpdir(), "ds-dirs-"));
	await mkdir(join(dir, "with-theme"));
	await mkdir(join(dir, "empty"));
	await mkdir(join(dir, ".hidden"));
	await writeFile(join(dir, "with-theme", DESIGN_FILE), "---\n---\n");
	await writeFile(join(dir, "with-theme", TOKENS_FILE), ":root {}\n");
	await writeFile(join(dir, "not-a-directory.txt"), "x");
});

afterAll(async () => {
	await rm(dir, { recursive: true, force: true });
});

describe("listDirectories", () => {
	test("lists sub-directories and marks the ones with a contract", async () => {
		const listing = await listDirectories(dir);
		expect(listing.path).toBe(await realpath(dir));
		expect(listing.entries.map((entry) => entry.name)).toEqual(["empty", "with-theme"]);
		expect(listing.entries.find((entry) => entry.name === "with-theme")?.hasContract).toBe(true);
		expect(listing.entries.find((entry) => entry.name === "empty")?.hasContract).toBe(false);
	});

	test("skips files and hidden directories", async () => {
		const listing = await listDirectories(dir);
		const names = listing.entries.map((entry) => entry.name);
		expect(names).not.toContain("not-a-directory.txt");
		expect(names).not.toContain(".hidden");
	});

	test("reports the parent directory and the home directory", async () => {
		const listing = await listDirectories(dir);
		expect(listing.parent).toBe(await realpath(join(dir, "..")));
		expect(listing.home.length).toBeGreaterThan(0);
		expect(listing.hasContract).toBe(false);
	});

	test("rejects a relative path", async () => {
		await expect(listDirectories("relative/dir")).rejects.toBeInstanceOf(ThemeApiError);
	});

	test("rejects a missing directory", async () => {
		await expect(listDirectories(join(dir, "nope"))).rejects.toBeInstanceOf(ThemeApiError);
	});
});
