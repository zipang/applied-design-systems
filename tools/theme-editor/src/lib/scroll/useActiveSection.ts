import { useEffect, useState } from "react";
import { type SectionSpan, sectionAtLine } from "./active-section";

/** Options for {@link useActiveSection}. */
export interface UseActiveSectionOptions {
	/** Where to probe the viewport, as a fraction of its height. The default is the middle. */
	ratio?: number;
}

/**
 * Track which of `ids` covers the viewport probe line — by default its vertical middle,
 * the line the fixed section nav sits on. Re-measures on scroll and resize, and reads
 * the live DOM so a section that grows as the theme is edited stays in sync.
 */
export const useActiveSection = (
	ids: string[],
	{ ratio = 0.5 }: UseActiveSectionOptions = {}
): string => {
	const [active, setActive] = useState(ids[0] ?? "");

	useEffect(() => {
		const measure = (): void => {
			const line = window.innerHeight * ratio;
			const spans: SectionSpan[] = [];
			for (const id of ids) {
				const elt = document.getElementById(id);
				if (!elt) continue;
				const { top, bottom } = elt.getBoundingClientRect();
				spans.push({ id, top, bottom });
			}
			const next = sectionAtLine(spans, line);
			if (next !== undefined) setActive(next);
		};

		measure();
		window.addEventListener("scroll", measure, { passive: true });
		window.addEventListener("resize", measure);

		return () => {
			window.removeEventListener("scroll", measure);
			window.removeEventListener("resize", measure);
		};
	}, [ids, ratio]);

	return active;
};
