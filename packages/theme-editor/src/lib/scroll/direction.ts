/** Vertical scroll direction. */
export type ScrollDirection = "up" | "down";

/**
 * Decide the direction after a scroll sample. Movement smaller than `threshold` is
 * treated as jitter and keeps the previous direction; otherwise the sign of the delta
 * wins. Ported from the reducer used by `react-headroom` and `use-scroll-direction`
 * (both MIT).
 *
 * @param previousTop - The scroll offset of the previous sample.
 * @param top - The scroll offset of the current sample.
 * @param previous - The direction before this sample.
 * @param threshold - Movement below this many pixels is treated as jitter.
 * @returns The direction to report after the sample.
 */
export const nextScrollDirection = (
	previousTop: number,
	top: number,
	previous: ScrollDirection,
	threshold: number
): ScrollDirection => {
	const delta = top - previousTop;

	if (Math.abs(delta) < threshold) {
		return previous;
	}

	return delta > 0 ? "down" : "up";
};

/**
 * Whether a reveal-on-scroll navigation hides. It hides only while scrolling down below
 * `offset`, and returns at the top or on any upward movement.
 *
 * @param direction - The current scroll direction.
 * @param top - The current scroll offset.
 * @param offset - The offset below which the header always shows.
 * @returns Whether the header should hide.
 */
export const shouldHideHeader = (direction: ScrollDirection, top: number, offset = 0): boolean =>
	direction === "down" && top > offset;
