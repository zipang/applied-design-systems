/** A theme persisted in the browser, keyed by name. */
export interface LocalTheme {
	designMd: string;
	tokensCss: string;
	savedAt: number;
}

/** Listing entry for a saved theme. */
export interface LocalThemeSummary {
	name: string;
	savedAt: number;
}

/**
 * The subset of the Web Storage API this module needs. Accepting it as a parameter
 * keeps the logic pure and testable without a DOM.
 */
export interface ThemeStorage {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
	removeItem(key: string): void;
}

const THEMES_KEY = "ds-theme-editor:themes";
const LAST_KEY = "ds-theme-editor:last";

const resolveStorage = (storage?: ThemeStorage): ThemeStorage | null => {
	if (storage) {
		return storage;
	}

	if (typeof localStorage === "undefined") {
		return null;
	}

	return localStorage;
};

const readThemes = (storage?: ThemeStorage): Record<string, LocalTheme> => {
	const store = resolveStorage(storage);

	if (!store) {
		return {};
	}

	try {
		const raw = store.getItem(THEMES_KEY);

		if (!raw) {
			return {};
		}
		const parsed = JSON.parse(raw) as Record<string, LocalTheme>;

		return parsed && typeof parsed === "object" ? parsed : {};
	} catch {
		// A corrupt library must not break the editor.
		return {};
	}
};

const writeThemes = (themes: Record<string, LocalTheme>, storage?: ThemeStorage): void => {
	const store = resolveStorage(storage);

	if (!store) {
		return;
	}

	try {
		store.setItem(THEMES_KEY, JSON.stringify(themes));
	} catch {
		// Storage can be full or blocked (private mode); a failed write is not fatal.
	}
};

/**
 * List saved themes, newest first.
 *
 * @param storage - The storage to read; defaults to `localStorage`.
 * @returns The saved theme summaries, most recently saved first.
 */
export const listLocalThemes = (storage?: ThemeStorage): LocalThemeSummary[] =>
	Object.entries(readThemes(storage))
		.map(([name, theme]) => ({ name, savedAt: theme.savedAt ?? 0 }))
		.sort((a, b) => b.savedAt - a.savedAt);

/**
 * Read one saved theme by name.
 *
 * @param name - The saved theme name.
 * @param storage - The storage to read; defaults to `localStorage`.
 * @returns The stored theme, or `null` when it is missing.
 */
export const readLocalTheme = (name: string, storage?: ThemeStorage): LocalTheme | null =>
	readThemes(storage)[name] ?? null;

/**
 * Create or overwrite a saved theme.
 *
 * @param name - The name to store the theme under.
 * @param theme - The contract text to persist.
 * @param storage - The storage to write; defaults to `localStorage`.
 */
export const writeLocalTheme = (
	name: string,
	theme: Pick<LocalTheme, "designMd" | "tokensCss">,
	storage?: ThemeStorage
): void => {
	const themes = readThemes(storage);
	themes[name] = { ...theme, savedAt: Date.now() };
	writeThemes(themes, storage);
};

/**
 * Delete a saved theme.
 *
 * @param name - The saved theme name to remove.
 * @param storage - The storage to write; defaults to `localStorage`.
 */
export const deleteLocalTheme = (name: string, storage?: ThemeStorage): void => {
	const themes = readThemes(storage);

	if (!(name in themes)) {
		return;
	}
	delete themes[name];
	writeThemes(themes, storage);
};

/**
 * The name of the theme to restore on the next visit.
 *
 * @param storage - The storage to read; defaults to `localStorage`.
 * @returns The remembered theme name, or `null` when none is stored.
 */
export const readLastThemeName = (storage?: ThemeStorage): string | null => {
	const store = resolveStorage(storage);

	if (!store) {
		return null;
	}

	try {
		return store.getItem(LAST_KEY) || null;
	} catch {
		return null;
	}
};

/**
 * Remember the active theme name for the next visit. Pass `""` to forget it.
 *
 * @param name - The active theme name, or `""` to clear it.
 * @param storage - The storage to write; defaults to `localStorage`.
 */
export const writeLastThemeName = (name: string, storage?: ThemeStorage): void => {
	const store = resolveStorage(storage);

	if (!store) {
		return;
	}

	try {
		if (name) {
			store.setItem(LAST_KEY, name);
		} else {
			store.removeItem(LAST_KEY);
		}
	} catch {
		// ignore
	}
};
