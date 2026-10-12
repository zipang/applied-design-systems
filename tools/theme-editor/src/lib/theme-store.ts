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
	localThemes: LocalThemeSummary[];
	saveDialogOpen: boolean;
	loadDialogOpen: boolean;
	setDir: (dir: string, hasContract?: boolean) => void;
	update: (variable: string, value: string) => void;
	updateTypography: (style: string, field: TypographyField, variable: string) => void;
	reset: () => void;
	requestLoad: () => void;
	loadFromDisk: () => void;
	requestSave: () => void;
	saveAsLocal: (name: string) => void;
	loadLocal: (name: string) => void;
	removeLocal: (name: string) => void;
	closeSaveDialog: () => void;
	closeLoadDialog: () => void;
	exportFiles: () => void;
}

const initialContract = parseContract(DEFAULT_DESIGN_MD, DEFAULT_TOKENS_CSS);
const initialValues = mergeValues(initialContract);

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
	const [localThemes, setLocalThemes] = useState<LocalThemeSummary[]>(() => listLocalThemes());
	const [saveDialogOpen, setSaveDialogOpen] = useState(false);
	const [loadDialogOpen, setLoadDialogOpen] = useState(false);

	const tokensCss = useMemo(() => serializeTokensCss(values), [values]);
	const designMd = useMemo(
		() => serializeDesignMd(values, baseDesignMd, typography),
		[values, baseDesignMd, typography]
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

	const reset = useCallback(() => {
		setBaseDesignMd(DEFAULT_DESIGN_MD);
		setValues(updateThemeContrastTokens(initialValues));
		setTypography(parseDesignMd(DEFAULT_DESIGN_MD).typography);
		setCurrentThemeName("");
		writeLastThemeName("");
		setDirty(true);
		setStatus("idle");
		setMessage("Restored the theme editor's default Design System.");
	}, []);

	const openFromDisk = useCallback(async (): Promise<boolean> => {
		if (!dir) return false;
		setStatus("loading");
		setMessage("");
		try {
			const response = await fetch(`/api/theme?dir=${encodeURIComponent(dir)}`);
			const data = (await response.json()) as {
				message?: string;
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
			setCurrentThemeName("");
			setDirHasContract(true);
			setDirty(false);
			setStatus("saved");
			setMessage(`Opened ${shortenPath(dir)}`);
			return true;
		} catch (error) {
			setStatus("error");
			setMessage(errorMessage(error));
			return false;
		}
	}, [dir]);

	const saveToDisk = useCallback(async () => {
		if (issues.some((issue) => issue.level === "error")) {
			setStatus("error");
			setMessage("Fix the validation errors before saving.");
			return;
		}
		setStatus("saving");
		setMessage("");
		try {
			const response = await fetch("/api/theme", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ dir, designMd, tokensCss })
			});
			const data = (await response.json()) as { message?: string };
			if (!response.ok) throw new Error(data.message ?? "Failed to save the project");
			setBaseDesignMd(designMd);
			setDirty(false);
			setStatus("saved");
			setMessage(`Saved to ${shortenPath(dir)}`);
		} catch (error) {
			setStatus("error");
			setMessage(errorMessage(error));
		}
	}, [dir, designMd, tokensCss, issues]);

	const loadFromDisk = useCallback(async () => {
		if (await openFromDisk()) setLoadDialogOpen(false);
	}, [openFromDisk]);

	const requestLoad = useCallback(() => {
		refreshLocalThemes();
		setStatus("idle");
		setMessage("");
		setLoadDialogOpen(true);
	}, [refreshLocalThemes]);

	const requestSave = useCallback(() => {
		if (dir) {
			void saveToDisk();
			return;
		}
		refreshLocalThemes();
		setSaveDialogOpen(true);
	}, [dir, saveToDisk, refreshLocalThemes]);

	const saveAsLocal = useCallback(
		(name: string) => {
			const trimmed = name.trim();
			if (!trimmed) {
				setStatus("error");
				setMessage("Enter a theme name.");
				return;
			}
			if (issues.some((issue) => issue.level === "error")) {
				setStatus("error");
				setMessage("Fix the validation errors before saving.");
				return;
			}
			writeLocalTheme(trimmed, { designMd, tokensCss });
			writeLastThemeName(trimmed);
			setBaseDesignMd(designMd);
			setCurrentThemeName(trimmed);
			setDirty(false);
			setStatus("saved");
			setMessage(`Saved "${trimmed}" in this browser.`);
			refreshLocalThemes();
			setSaveDialogOpen(false);
		},
		[designMd, tokensCss, issues, refreshLocalThemes]
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
			writeLastThemeName(name);
			setCurrentThemeName(name);
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
			refreshLocalThemes();
			setMessage(`Deleted "${name}".`);
		},
		[currentThemeName, refreshLocalThemes]
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
		localThemes,
		saveDialogOpen,
		loadDialogOpen,
		setDir,
		update,
		updateTypography,
		reset,
		requestLoad,
		loadFromDisk,
		requestSave,
		saveAsLocal,
		loadLocal,
		removeLocal,
		closeSaveDialog,
		closeLoadDialog,
		exportFiles
	};
};
