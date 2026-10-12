import { Heading } from "@components/base/Heading";
import { Text } from "@components/base/Text";
import { FolderPicker } from "@components/editor/FolderPicker";
import { Button } from "@components/ui/Button";
import { Dialog, DialogContent } from "@components/ui/Dialog";
import { Tabs } from "@components/ui/Tabs";
import { TextField } from "@components/ui/TextField";
import { useAppState, useDisplayPath } from "@lib/app-state";
import { DEFAULT_THEME_NAME } from "@lib/theme-store";
import type * as React from "react";
import { useState } from "react";
import "./ThemeLibrary.css";

/**
 * Modal that saves the current theme. Two tabs split the destinations: the project
 * directory on disk, and this browser's localStorage. The front-matter name is the
 * theme's identity, so neither tab asks for a separate label; the directory tab only
 * lets you adjust it before exporting.
 */
export const ThemeLibrary: React.FC = () => {
	const {
		themeName,
		setThemeName,
		currentThemeName,
		dir,
		dirHasContract,
		setDir,
		saveAsLocal,
		exportTo,
		exportFiles,
		closeSaveDialog
	} = useAppState();
	const [tab, setTab] = useState("directory");
	const [pickerOpen, setPickerOpen] = useState(false);
	const [confirming, setConfirming] = useState(false);
	const displayDir = useDisplayPath(dir);
	// The tool's own theme has no project and no browser entry; saving it would shadow it.
	const isDefault = themeName === DEFAULT_THEME_NAME && currentThemeName === "";

	const saveFavorite = (): void => {
		saveAsLocal(themeName);
	};

	const onExport = async (): Promise<void> => {
		if (!dir) return;
		if (await exportTo(dir)) closeSaveDialog();
	};

	return (
		<Dialog open onOpenChange={(open) => (open ? undefined : closeSaveDialog())}>
			<DialogContent
				className="editor-theme-library"
				title="Save theme"
				description="Save the theme to a project directory, or store it in this browser."
			>
				<Tabs
					tabs={[
						{ key: "directory", label: "Directory" },
						{ key: "favorites", label: "Favorites" }
					]}
					active={tab}
					onChange={(key) => {
						setConfirming(false);
						setTab(key);
					}}
				/>
				{tab === "directory" ? (
					<section className="editor-theme-library__section">
						<Heading level={3}>Project directory</Heading>
						<TextField
							id="theme-editor-export-name"
							label="Theme name"
							value={themeName}
							onChange={setThemeName}
							placeholder="My Theme"
						/>
						<span className="editor-theme-library__dir" title={dir || undefined}>
							{displayDir || "No directory selected"}
						</span>
						{dir && dirHasContract ? (
							<Text size="sm" tone="muted">
								This directory already holds a theme; exporting overwrites it.
							</Text>
						) : null}
						<div className="editor-theme-library__actions">
							<Button
								label="Choose…"
								size="sm"
								variant="secondary"
								onClick={() => setPickerOpen(true)}
							/>
							<Button
								label="Save to directory"
								size="sm"
								variant="primary"
								disabled={!dir}
								onClick={() => void onExport()}
							/>
						</div>
					</section>
				) : (
					<section className="editor-theme-library__section">
						<Heading level={3}>This browser</Heading>
						<Text size="sm" tone="muted">
							Store “{themeName || "Untitled theme"}” in this browser's localStorage.
						</Text>
						{isDefault ? (
							<Text size="sm" className="editor-theme-library__warning">
								This is the Theme Editor's own default theme. Saving it here shadows the built-in
								default; export it to a project directory instead.
							</Text>
						) : null}
						{confirming ? (
							<div className="editor-theme-library__confirm">
								<Text size="sm" tone="muted">
									Overwrite the editor's default theme in this browser?
								</Text>
								<div className="editor-theme-library__actions">
									<Button label="Overwrite" size="sm" variant="primary" onClick={saveFavorite} />
									<Button
										label="Export instead"
										size="sm"
										variant="secondary"
										onClick={() => {
											setConfirming(false);
											setTab("directory");
										}}
									/>
								</div>
							</div>
						) : (
							<div className="editor-theme-library__actions">
								<Button
									label="Save in this browser"
									size="sm"
									variant="primary"
									onClick={() => (isDefault ? setConfirming(true) : saveFavorite())}
								/>
							</div>
						)}
					</section>
				)}
				<div className="editor-theme-library__actions">
					<Button label="Download files" size="sm" variant="ghost" onClick={exportFiles} />
					<Button label="Close" size="sm" variant="ghost" onClick={closeSaveDialog} />
				</div>
			</DialogContent>
			{pickerOpen ? (
				<FolderPicker
					initialPath={dir}
					onSelect={(path, hasContract) => {
						setDir(path, hasContract);
						setPickerOpen(false);
					}}
					onClose={() => setPickerOpen(false)}
				/>
			) : null}
		</Dialog>
	);
};
