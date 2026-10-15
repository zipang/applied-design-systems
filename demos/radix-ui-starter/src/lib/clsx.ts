/**
 * A value accepted by {@link clsx}. Strings are kept, falsy values are dropped, and
 * the true keys of an object are kept.
 */
export type ClassValue =
	| string
	| number
	| boolean
	| null
	| undefined
	| Record<string, boolean | null | undefined>;

/**
 * Combine class names. Accepts strings, falsy values, and conditional objects:
 *
 * ```ts
 * clsx("ui-button", { "is-loading": loading, "is-disabled": disabled });
 * ```
 *
 * @param values Class values to combine.
 * @returns The combined class string.
 */
export const clsx = (...values: ClassValue[]): string => {
	const classes: string[] = [];

	for (const value of values) {
		if (value === null || value === undefined || value === false || value === "") {
			continue;
		}

		if (typeof value === "string" || typeof value === "number") {
			classes.push(String(value));
			continue;
		}

		if (typeof value === "boolean") {
			continue;
		}

		for (const [name, enabled] of Object.entries(value)) {
			if (enabled) {
				classes.push(name);
			}
		}
	}

	return classes.join(" ");
};
