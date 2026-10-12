import { getShortDisplayPath } from "@lib/paths";
import type { SystemInfo } from "@lib/system-info";
import { type ThemeStore, useThemeStore } from "@lib/theme-store";
import type * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

/** The application-wide state: the edited theme plus the host filesystem facts. */
export interface AppState extends ThemeStore, SystemInfo {}

export interface AppStateProviderProps {
	children: React.ReactNode;
}

const AppStateContext = createContext<AppState | null>(null);

/**
 * Provide the application-wide state to the whole tree. The theme store owns the edited
 * contract and its persistence; the host facts (`home`, `cwd`) come from the server,
 * which is the only side that can read the filesystem. Components read both through
 * {@link useAppState} instead of threading them through props.
 */
export const AppStateProvider: React.FC<AppStateProviderProps> = ({ children }) => {
	const theme = useThemeStore();
	const [system, setSystem] = useState<SystemInfo>({ home: "", cwd: "" });

	useEffect(() => {
		let cancelled = false;
		fetch("/api/system")
			.then(async (response) => {
				if (!response.ok) throw new Error("Could not read the system info.");
				const data = (await response.json()) as SystemInfo;
				if (!cancelled) setSystem(data);
			})
			.catch(() => {
				// Host facts only shorten displayed paths; the editor works without them.
			});
		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<AppStateContext.Provider value={{ ...theme, ...system }}>{children}</AppStateContext.Provider>
	);
};

/** Read the application-wide state. Throws when used outside {@link AppStateProvider}. */
export const useAppState = (): AppState => {
	const value = useContext(AppStateContext);
	if (!value) throw new Error("useAppState must be used within an AppStateProvider");
	return value;
};

/** Format a filesystem path for display, shortened against the host home directory. */
export const useDisplayPath = (path: string): string =>
	getShortDisplayPath(path, useAppState().home);
