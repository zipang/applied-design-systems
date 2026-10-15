/**
 * Format a byte count as `B`, `KB`, or `MB`.
 *
 * @param bytes The byte count.
 * @returns The formatted byte count.
 */
export const formatBytes = (bytes: number): string => {
	if (bytes < 1024) {
		return `${bytes} B`;
	}

	if (bytes < 1024 * 1024) {
		return `${Math.round(bytes / 1024)} KB`;
	}

	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
