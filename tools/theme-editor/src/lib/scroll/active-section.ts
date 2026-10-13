/** One section's vertical extent, in viewport coordinates. */
export interface SectionSpan {
	id: string;
	top: number;
	bottom: number;
}

/**
 * The id of the section that covers a viewport line. Sections stack in DOM order, so:
 * the section the line falls inside wins; a line in the gap between two sections, or one
 * past the last section, belongs to the last section that starts at or above it; and a
 * line above every section belongs to the first.
 *
 * The fixed section nav sits on the viewport's vertical middle, so passing that line
 * makes the nav agree with what the reader sees at the center of the screen.
 */
export const sectionAtLine = (sections: SectionSpan[], line: number): string | undefined => {
	const covering = sections.find((section) => line >= section.top && line < section.bottom);
	if (covering) return covering.id;

	const above = sections.filter((section) => section.top <= line).at(-1);
	return (above ?? sections[0])?.id;
};
