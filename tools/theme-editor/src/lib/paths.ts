/** The shell convention: `~` stands in for the home directory. */
const HOME_PREFIX = "~";

/**
 * Shorten an absolute path for display. When the path sits inside `home`, the home
 * prefix collapses to `~` so long paths stay readable in narrow fields. Every path
 * outside `home`, and every path when `home` is unknown, is returned unchanged. Only
 * the displayed string changes — the stored path stays absolute and intact.
 */
export const getShortDisplayPath = (path: string, home?: string | null): string => {
	if (!path) return "";
	const base = home?.replace(/\/+$/, "") ?? "";
	if (!base || (path !== base && !path.startsWith(`${base}/`))) return path;
	return `${HOME_PREFIX}${path.slice(base.length)}`;
};
