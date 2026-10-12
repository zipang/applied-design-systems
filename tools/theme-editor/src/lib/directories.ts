import type { Dirent } from "node:fs";
import { readdir, realpath, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { DESIGN_FILE, ThemeApiError, TOKENS_FILE } from "./theme-api";

/** One sub-directory the picker may navigate into. */
export interface DirectoryEntry {
	name: string;
	path: string;
	hasContract: boolean;
}

/** A directory the picker is showing, with its sub-directories. */
export interface DirectoryListing {
	path: string;
	parent: string | null;
	home: string;
	hasContract: boolean;
	entries: DirectoryEntry[];
}

/** True when `dir` holds both halves of the Design System contract. */
export const hasContract = async (dir: string): Promise<boolean> => {
	const [design, tokens] = await Promise.all([
		Bun.file(join(dir, DESIGN_FILE)).exists(),
		Bun.file(join(dir, TOKENS_FILE)).exists()
	]);
	return design && tokens;
};

/**
 * Resolve and verify a directory the picker may list. Rejects relative paths and
 * paths that do not resolve to a readable directory, so the picker never carries a
 * path the theme API would later refuse.
 */
const resolveDirectory = async (dir: string): Promise<string> => {
	if (!isAbsolute(dir)) throw new ThemeApiError("Project directory must be absolute", 400);

	let real: string;
	try {
		real = await realpath(resolve(dir));
	} catch {
		throw new ThemeApiError(`Directory not found: ${dir}`, 404);
	}
	const info = await stat(real);
	if (!info.isDirectory()) throw new ThemeApiError(`Not a directory: ${dir}`, 400);
	return real;
};

/**
 * List the sub-directories of `dir`, defaulting to the server's working directory.
 * Hidden (dot) directories are skipped to keep the list focused; each entry reports
 * whether it holds the contract so the picker can point at loadable projects.
 */
export const listDirectories = async (dir?: string): Promise<DirectoryListing> => {
	const target = await resolveDirectory(dir ?? process.cwd());

	let dirents: Dirent[];
	try {
		dirents = await readdir(target, { withFileTypes: true });
	} catch {
		throw new ThemeApiError(`Cannot read directory: ${target}`, 403);
	}

	const entries: DirectoryEntry[] = [];
	for (const entry of dirents) {
		if (entry.name.startsWith(".")) continue;
		if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;

		const entryPath = join(target, entry.name);
		try {
			const info = await stat(entryPath);
			if (!info.isDirectory()) continue;
		} catch {
			// A broken symlink or a race is not worth surfacing in the list.
			continue;
		}
		entries.push({ name: entry.name, path: entryPath, hasContract: await hasContract(entryPath) });
	}
	entries.sort((a, b) => a.name.localeCompare(b.name));

	const parent = target === dirname(target) ? null : dirname(target);
	return { path: target, parent, home: homedir(), hasContract: await hasContract(target), entries };
};
