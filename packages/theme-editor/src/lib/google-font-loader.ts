/** Families already injected into the document head, so a font loads at most once. */
const loaded = new Set<string>();

/**
 * Lazily load a Google Font so previews render once they scroll into view.
 *
 * @param family - The Google Font family name to inject.
 */
export const loadGoogleFont = (family: string): void => {
	if (loaded.has(family) || typeof document === "undefined") {
		return;
	}
	loaded.add(family);
	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@400;700&display=block`;
	document.head.append(link);
};
