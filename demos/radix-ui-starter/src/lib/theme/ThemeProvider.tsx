import type * as React from "react";
import { createContext, useContext, useLayoutEffect, useMemo, useState } from "react";
import type { Theme, ThemeId } from "./themes";
import { DEFAULT_THEME, getTheme, themes } from "./themes";

interface ThemeContextValue {
	theme: ThemeId;
	available: Theme[];
	setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
	children: React.ReactNode;
}

/**
 * Injects the active theme's stylesheet into a `<style>` element in `document.head`
 * and exposes the theme list. Each theme is a complete `:root` stylesheet, so
 * switching replaces the element and leaves the cascade unchanged.
 *
 * @param props The provider props.
 * @returns The rendered provider.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
	const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);
	const css = getTheme(theme).css;

	useLayoutEffect(() => {
		const styleElt = document.createElement("style");
		styleElt.textContent = css;
		document.head.append(styleElt);

		return () => {
			styleElt.remove();
		};
	}, [css]);

	const value = useMemo<ThemeContextValue>(
		() => ({ theme, available: themes, setTheme }),
		[theme]
	);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Read the active theme and the theme list. Throws outside a ThemeProvider.
 *
 * @returns The active theme id, the theme list, and the theme setter.
 */
export const useTheme = (): ThemeContextValue => {
	const value = useContext(ThemeContext);

	if (!value) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}

	return value;
};
