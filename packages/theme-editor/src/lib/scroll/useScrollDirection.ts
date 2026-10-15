import { useEffect, useState } from "react";
import type { ScrollDirection } from "./direction";
import { nextScrollDirection, shouldHideHeader } from "./direction";

/** Options for the scroll hooks. */
export interface UseScrollDirectionOptions {
	/** Pixels of movement ignored as jitter before the direction flips. */
	threshold?: number;
}

const topOf = (target: HTMLElement | null): number => (target ? target.scrollTop : window.scrollY);

const sizeOf = (target: HTMLElement | null): number =>
	target ? target.clientHeight : window.innerHeight;

/**
 * Report the vertical scroll direction of `target`, or of the window when `target` is
 * null. The listener is passive and the value changes only when the direction flips,
 * so consumers re-render on reversal, not on every scroll event. Ported from
 * `react-headroom` and `use-scroll-direction` (both MIT).
 *
 * @param target - The scroll container to watch, or `null` for the window.
 * @param options - The jitter threshold; defaults to 8 pixels.
 * @returns The current scroll direction.
 */
export const useScrollDirection = (
	target: HTMLElement | null,
	{ threshold = 8 }: UseScrollDirectionOptions = {}
): ScrollDirection => {
	const [direction, setDirection] = useState<ScrollDirection>("up");

	useEffect(() => {
		// oxlint-disable-next-line react/set-state-in-effect -- reset when the watched container changes
		setDirection("up");

		let previousTop = topOf(target);
		let previousSize = sizeOf(target);
		let previousDirection: ScrollDirection = "up";

		const onScroll = (): void => {
			const top = topOf(target);
			const size = sizeOf(target);

			// A collapsing header changes the scroll container's height, and the
			// browser then clamps scrollTop upward. That clamp is a reverse "scroll"
			// we did not cause, so ignore it and resync. A downward move during the
			// resize is still a real scroll and is processed.
			if (size !== previousSize) {
				previousSize = size;

				if (top - previousTop <= 0) {
					previousTop = top;

					return;
				}
			}

			const next = nextScrollDirection(previousTop, top, previousDirection, threshold);

			previousTop = top;

			if (next !== previousDirection) {
				previousDirection = next;
				setDirection(next);
			}
		};

		if (target) {
			target.addEventListener("scroll", onScroll, { passive: true });

			return () => target.removeEventListener("scroll", onScroll);
		}

		window.addEventListener("scroll", onScroll, { passive: true });

		return () => window.removeEventListener("scroll", onScroll);
	}, [target, threshold]);

	return direction;
};

/**
 * Whether a reveal-on-scroll navigation is hidden. It hides while the tracked element is
 * scrolled down below the top, and returns at the top and on upward movement. Resets to
 * visible whenever the tracked element changes (for example on a page swap).
 *
 * @param target - The scroll container to watch, or `null` for the window.
 * @param options - The jitter threshold; defaults to 8 pixels.
 * @returns Whether the navigation is currently hidden.
 */
export const useHideOnScroll = (
	target: HTMLElement | null,
	{ threshold = 8 }: UseScrollDirectionOptions = {}
): boolean => {
	const [hidden, setHidden] = useState(false);

	useEffect(() => {
		// oxlint-disable-next-line react/set-state-in-effect -- reset when the watched container changes
		setHidden(false);

		let previousTop = topOf(target);
		let previousSize = sizeOf(target);
		let previousDirection: ScrollDirection = "up";

		const onScroll = (): void => {
			const top = topOf(target);
			const size = sizeOf(target);

			// See useScrollDirection: ignore the upward clamp that follows our own
			// resize, but keep processing real downward scrolls.
			if (size !== previousSize) {
				previousSize = size;

				if (top - previousTop <= 0) {
					previousTop = top;

					return;
				}
			}

			previousDirection = nextScrollDirection(previousTop, top, previousDirection, threshold);
			previousTop = top;
			setHidden(shouldHideHeader(previousDirection, top));
		};

		if (target) {
			target.addEventListener("scroll", onScroll, { passive: true });

			return () => target.removeEventListener("scroll", onScroll);
		}

		window.addEventListener("scroll", onScroll, { passive: true });

		return () => window.removeEventListener("scroll", onScroll);
	}, [target, threshold]);

	return hidden;
};
