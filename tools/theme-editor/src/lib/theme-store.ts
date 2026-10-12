import { useCallback, useMemo, useState } from "react";
import { updateThemeContrastTokens } from "../../../contrast-tokens";
import DEFAULT_DESIGN_MD from "../../DESIGN.md" with { type: "text" };
import DEFAULT_TOKENS_CSS from "../../design-tokens.css" with { type: "text" };
import {
	mergeValues,
	parseContract,
	parseDesignMd,
	serializeDesignMd,
	serializeTokensCss,
	type TypographyField,
	type TypographyRefs
} from "./contract";
import { type TokenValues, tokenByVariable } from "./design-system";
import {
	deleteLocalTheme,
	type LocalTheme,
	type LocalThemeSummary,
	listLocalThemes,
	readLastThemeName,
	readLocalTheme,
	writeLastThemeName,
	writeLocalTheme
} from "./local-themes";
import { shortenPath } from "./paths";
import { type Issue, validateContract } from "./validate";

/** Async status of the theme store. */
export type ThemeStatus = "idle" | "loading" | "saving" | "saved" | "error";

/** Where the current theme is persisted: a project directory or a browser favorite. */
export type ThemeLocation = { kind: "directory"; dir: string } | { kind: "favorite"; name: string };

/** State and actions the theme editor uses to edit and persist a project's contract. */
export interface ThemeStore {
	values: TokenValues;
	issues: Issue[];
	dir: string;
	dirHasContract: boolean | null;
	status: ThemeStatus;
	message: string;
	dirty: boolean;
	typography: TypographyRefs;
	currentThemeName: string;
	themeName: string;
	location: ThemeLocation | null;
	localThemes: LocalThemeSummary[];
	saveDialogOpen: boolean;
	loadDialogOpen: boolean;
	setDir: (dir: string, hasContract?: boolean) => void;
	setThemeName: (name: string) => void;
	update: (variable: string, value: string) => void;
	updateTypography: (style: string, field: TypographyField, variable: string) => void;
	reset: () => void;
	requestLoad: () => void;
	loadFromDir: (dir: string) => void;
	requestSave: () => void;
	requestExport: () => void;
	saveAsLocal: (name: string) => void;
	loadLocal: (name: string) => void;
	removeLocal: (name: string) => void;
	exportTo: (dir: string) => Promise<boolean>;
	closeSaveDialog: () => void;
	closeLoadDialog: () => void;
	exportFiles: () => void;
}

const initialContract = parseContract(DEFAULT_DESIGN_MD, DEFAULT_TOKENS_CSS);
const initialValues = mergeValues(initialContract);

/** The name of the tool's bundled default theme, used to detect it on save. */
export const DEFAULT_THEME_NAME = parseDesignMd(DEFAULT_DESIGN_MD).name;

const download = (name: string, text: string): void => {
	const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = name;
	anchor.click();
	URL.revokeObjectURL(url);
};

const errorMessage = (error: unknown): string =>
	error instanceof Error ? error.message : "Unexpected error";

/** The theme remembered for this browser, or `null` when there is none. */
const readLastTheme = (): LocalTheme | null => {
	const name = readLastThemeName();
	return name ? readLocalTheme(name) : null;
};

/**
 * The theme editor's state. Token values are the source of truth; both contract files
 * are serialized from them on every change, so the preview, validation, and save stay
 * in sync. A project directory persists to disk through the server; without one, themes
 * are saved by name in this browser's localStorage and restored on the next visit.
 */
export const useThemeStore = (): ThemeStore => {
	const [baseDesignMd, setBaseDesignMd] = useState(
		() => readLastTheme()?.designMd ?? DEFAULT_DESIGN_MD
	);
	const [values, setValues] = useState<TokenValues>(() => {
		const theme = readLastTheme();
		if (!theme) return updateThemeContrastTokens(initialValues);
		try {
			return updateThemeContrastTokens(mergeValues(parseContract(theme.designMd, theme.tokensCss)));
		} catch {
			return updateThemeContrastTokens(initialValues);
		}
	});
	const [typography, setTypography] = useState<TypographyRefs>(() => {
		const theme = readLastTheme();
		return parseDesignMd(theme?.designMd ?? DEFAULT_DESIGN_MD).typography;
	});
	const [dir, setDirState] = useState("");
	const [dirHasContract, setDirHasContract] = useState<boolean | null>(null);
	const [status, setStatus] = useState<ThemeStatus>("idle");
	const [message, setMessage] = useState("");
	const [dirty, setDirty] = useState(false);
	const [currentThemeName, setCurrentThemeName] = useState(() =>
		readLastTheme() ? (readLastThemeName() ?? "") : ""
	);
	const [themeName, setThemeNameState] = useState(
		() => parseDesignMd(readLastTheme()?.designMd ?? DEFAULT_DESIGN_MD).name
	);
	const [location, setLocation] = useState<ThemeLocation | null>(() => {
		const name = readLastThemeName();
		return name && readLocalTheme(name) ? { kind: "favorite", name } : null;
	});
	const [localThemes, setLocalThemes] = useState<LocalThemeSummary[]>(() => listLocalThemes());
	const [saveDialogOpen, setSaveDialogOpen] = useState(false);
	const [loadDialogOpen, setLoadDialogOpen] = useState(false);

	const tokensCss = useMemo(() => serializeTokensCss(values), [values]);
	const designMd = useMemo(
		() => serializeDesignMd(values, baseDesignMd, typography, themeName),
		[values, baseDesignMd, typography, themeName]
	);
	const issues = useMemo(
		() => validateContract(parseContract(designMd, tokensCss)),
		[designMd, tokensCss]
	);

	const refreshLocalThemes = useCallback(() => setLocalThemes(listLocalThemes()), []);
	const closeSaveDialog = useCallback(() => setSaveDialogOpen(false), []);
	const closeLoadDialog = useCallback(() => setLoadDialogOpen(false), []);

	// The picker knows whether the chosen directory holds the contract; a typed path
	// leaves that unknown until a load resolves it.
	const setDir = useCallback((next: string, pickedHasContract?: boolean) => {
		setDirState(next);
		setDirHasContract(pickedHasContract ?? null);
	}, []);

	const update = useCallback((variable: string, value: string) => {
		setValues((prev) => {
			const next = { ...prev, [variable]: value };
			// The contrast pairs derive from the colors, so a color edit re-derives them.
			return tokenByVariable(variable)?.kind === "color" ? updateThemeContrastTokens(next) : next;
		});
		setDirty(true);
		setStatus("idle");
	}, []);

	const updateTypography = useCallback(
		(style: string, field: TypographyField, variable: string) => {
			setTypography((prev) => ({ ...prev, [style]: { ...prev[style], [field]: variable } }));
			setDirty(true);
			setStatus("idle");
		},
		[]
	);

	const setThemeName = useCallback((name: string) => {
		setThemeNameState(name);
		setDirty(true);
		setStatus("idle");
	}, []);

	const reset = useCallback(() => {
		setBaseDesignMd(DEFAULT_DESIGN_MD);
		setValues(updateThemeContrastTokens(initialValues));
		setTypography(parseDesignMd(DEFAULT_DESIGN_MD).typography);
		setThemeNameState(parseDesignMd(DEFAULT_DESIGN_MD).name);
		setCurrentThemeName("");
		setLocation(null);
		writeLastThemeName("");
		setDirty(true);
		setStatus("idle");
		setMessage("Restored the theme editor's default Design System.");
	}, []);

	const openFromDisk = useCallback(async (targetDir: string): Promise<boolean> => {
		if (!targetDir) return false;
		setStatus("loading");
		setMessage("");
		try {
			const response = await fetch(`/api/theme?dir=${encodeURIComponent(targetDir)}`);
			const data = (await response.json()) as {
				message?: string;
				dir?: string;
				designMd?: string;
				tokensCss?: string;
			};
			if (!response.ok || !data.designMd || !data.tokensCss) {
				throw new Error(data.message ?? "Failed to open the project");
			}
			const contract = parseContract(data.designMd, data.tokensCss);
			setBaseDesignMd(data.designMd);
			setValues(updateThemeContrastTokens(mergeValues(contract)));
			setTypography(parseDesignMd(data.designMd).typography);
			setThemeNameState(parseDesignMd(data.designMd).name);
			setCurrentThemeName("");
			setLocation({ kind: "directory", dir: data.dir ?? targetDir });
			setDirState(data.dir ?? targetDir);
			setDirHasContract(true);
			setDirty(false);
			setStatus("saved");
			setMessage(`Opened ${shortenPath(targetDir)}`);
			return true;
		} catch (error) {
			setStatus("error");
			setMessage(errorMessage(error));
			return false;
		}
	}, []);

	const writeTheme = useCallback(
		async (targetDir: string): Promise<boolean> => {
			if (issues.some((issue) => issue.level === "error")) {
				setStatus("error");
				setMessage("Fix the validation errors before saving.");
				return false;
			}
			setStatus("saving");
			setMessage("");
			try {
				const response = await fetch("/api/theme", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({ dir: targetDir, designMd, tokensCss })
				});
				const data = (await response.json()) as { message?: string };
				if (!response.ok) throw new Error(data.message ?? "Failed to save the project");
				// Writing adopts the target, so a later Save keeps using it.
				setDirState(targetDir);
				setDirHasContract(true);
				setLocation({ kind: "directory", dir: targetDir });
				setBaseDesignMd(designMd);
				setDirty(false);
				setStatus("saved");
				setMessage(`Saved to ${shortenPath(targetDir)}`);
				return true;
			} catch (error) {
				setStatus("error");
				setMessage(errorMessage(error));
				return false;
			}
		},
		[designMd, tokensCss, issues]
	);

	const exportTo = useCallback((targetDir: string) => writeTheme(targetDir), [writeTheme]);

	const writeFavorite = useCallback(
		(name: string): boolean => {
			const trimmed = name.trim();
			if (!trimmed) {
				setStatus("error");
				setMessage("Enter a theme name.");
				return false;
			}
			if (issues.some((issue) => issue.level === "error")) {
				setStatus("error");
				setMessage("Fix the validation errors before saving.");
				return false;
			}
			writeLocalTheme(trimmed, { designMd, tokensCss });
			writeLastThemeName(trimmed);
			setBaseDesignMd(designMd);
			setCurrentThemeName(trimmed);
			setLocation({ kind: "favorite", name: trimmed });
			setDirty(false);
			setStatus("saved");
			setMessage(`Saved "${trimmed}" in this browser.`);
			refreshLocalThemes();
			return true;
		},
		[designMd, tokensCss, issues, refreshLocalThemes]
	);

	const loadFromDir = useCallback(
		async (targetDir: string) => {
			if (await openFromDisk(targetDir)) setLoadDialogOpen(false);
		},
		[openFromDisk]
	);

	const requestLoad = useCallback(() => {
		refreshLocalThemes();
		setStatus("idle");
		setMessage("");
		setLoadDialogOpen(true);
	}, [refreshLocalThemes]);

	const requestSave = useCallback(() => {
		// A theme that already has a location saves straight back to it, no dialog.
		if (location?.kind === "directory") {
			void writeTheme(location.dir);
			return;
		}
		if (location?.kind === "favorite") {
			writeFavorite(location.name);
			return;
		}
		refreshLocalThemes();
		setSaveDialogOpen(true);
	}, [location, writeTheme, writeFavorite, refreshLocalThemes]);

	const requestExport = useCallback(() => {
		refreshLocalThemes();
		setSaveDialogOpen(true);
	}, [refreshLocalThemes]);

	const saveAsLocal = useCallback(
		(name: string) => {
			if (writeFavorite(name)) setSaveDialogOpen(false);
		},
		[writeFavorite]
	);

	const loadLocal = useCallback((name: string) => {
		const theme = readLocalTheme(name);
		if (!theme) {
			setStatus("error");
			setMessage(`No saved theme named "${name}".`);
			return;
		}
		try {
			const contract = parseContract(theme.designMd, theme.tokensCss);
			setBaseDesignMd(theme.designMd);
			setValues(updateThemeContrastTokens(mergeValues(contract)));
			setTypography(parseDesignMd(theme.designMd).typography);
			setThemeNameState(parseDesignMd(theme.designMd).name);
			writeLastThemeName(name);
			setCurrentThemeName(name);
			setLocation({ kind: "favorite", name });
			setDirty(false);
			setStatus("saved");
			setMessage(`Loaded "${name}" from this browser.`);
			setLoadDialogOpen(false);
		} catch (error) {
			setStatus("error");
			setMessage(errorMessage(error));
		}
	}, []);

	const removeLocal = useCallback(
		(name: string) => {
			deleteLocalTheme(name);
			if (currentThemeName === name) {
				setCurrentThemeName("");
				writeLastThemeName("");
			}
			if (location?.kind === "favorite" && location.name === name) setLocation(null);
			refreshLocalThemes();
			setMessage(`Deleted "${name}".`);
		},
		[currentThemeName, location, refreshLocalThemes]
	);

	const exportFiles = useCallback(() => {
		download("DESIGN.md", designMd);
		download("design-tokens.css", tokensCss);
	}, [designMd, tokensCss]);

	return {
		values,
		issues,
		dir,
		dirHasContract,
		status,
		message,
		dirty,
		typography,
		currentThemeName,
		themeName,
		location,
		localThemes,
		saveDialogOpen,
		loadDialogOpen,
		setDir,
		setThemeName,
		update,
		updateTypography,
		reset,
		requestLoad,
		loadFromDir,
		requestSave,
		requestExport,
		saveAsLocal,
		loadLocal,
		removeLocal,
		exportTo,
		closeSaveDialog,
		closeLoadDialog,
		exportFiles
	};
};
