/** The shell convention: `~` stands in for the home directory. */
const HOME_PREFIX = "~";

/**
 * Shorten an absolute path for display. When the path sits inside `home`, the home
 * prefix collapses to `~` so long paths stay readable in narrow fields. Every path
 * outside `home`, and every path when `home` is unknown, is returned unchanged. Only
 * the displayed string changes — the stored path stays absolute and intact.
 *
 * @param path - The absolute path to display.
 * @param home - The host home directory to collapse; leave unset when unknown.
 * @returns The path with a leading home directory replaced by `~`.
 */
export const getShortDisplayPath = (path: string, home?: string | null): string => {
	if (!path) {
		return "";
	}
	const base = home?.replace(/\/+$/, "") ?? "";

	if (!base || (path !== base && !path.startsWith(`${base}/`))) {
		return path;
	}

	return `${HOME_PREFIX}${path.slice(base.length)}`;
};

/**
 * The host home directory, published once known. The server publishes it at boot and the
 * client when `/api/system` resolves, so callers that cannot reach the app state (the
 * store sets its messages from event handlers) still shorten paths the same way.
 */
let homeDirectory = "";

/**
 * Publish the host home directory so {@link shortenPath} can shorten against it.
 *
 * @param home - The host home directory.
 */
export const setHomeDirectory = (home: string): void => {
	homeDirectory = home;
};

/**
 * Shorten a path against the published home directory. A no-op until
 * {@link setHomeDirectory} runs, so it degrades to the full path rather than failing.
 *
 * @param path - The path to shorten.
 * @returns The path shortened against the published home directory.
 */
export const shortenPath = (path: string): string => getShortDisplayPath(path, homeDirectory);
