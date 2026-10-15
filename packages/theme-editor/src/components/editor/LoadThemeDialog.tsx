import { Heading } from "@components/base/Heading";
import { Text } from "@components/base/Text";
import { FolderPicker } from "@components/editor/FolderPicker";
import { Button } from "@components/ui/Button";
import { Dialog, DialogContent } from "@components/ui/Dialog";
import { Tabs } from "@components/ui/Tabs";
import { useAppState, useDisplayPath } from "@lib/app-state";
import type * as React from "react";
import { useState } from "react";
import "./LoadThemeDialog.css";

const formatSavedAt = (value: number): string =>
	value ? new Date(value).toLocaleString() : "unknown time";

/**
 * The load dialog. Two tabs split the places a theme can come from: a project directory
 * chosen with the folder picker, and the themes saved in this browser. Loading records the
 * theme's location, so a later Save writes straight back to it.
 *
 * @returns The rendered element.
 */
export const LoadThemeDialog: React.FC = () => {
	const {
		dir,
		localThemes,
		currentThemeName,
		status,
		message,
		setDir,
		loadFromDir,
		loadLocal,
		removeLocal,
		closeLoadDialog
	} = useAppState();
	const displayDir = useDisplayPath(dir);
	const [tab, setTab] = useState("directory");
	const [pickerOpen, setPickerOpen] = useState(false);

	return (
		<Dialog open onOpenChange={(open) => (open ? undefined : closeLoadDialog())}>
			<DialogContent
				className="editor-load-theme"
				title="Load a theme"
				description="Load the contract from a project directory, or restore a theme saved in this browser."
			>
				<Tabs
					tabs={[
						{ key: "directory", label: "Directory" },
						{ key: "favorites", label: "Favorites" }
					]}
					active={tab}
					onChange={setTab}
				/>
				{tab === "directory" ? (
					<section className="editor-load-theme__section">
						<Heading level={3}>From project directory</Heading>
						<span className="editor-load-theme__dir" title={dir || undefined}>
							{displayDir || "No directory selected"}
						</span>
						<Button
							label="Choose a directory…"
							size="sm"
							variant="secondary"
							loading={status === "loading"}
							onClick={() => setPickerOpen(true)}
						/>
					</section>
				) : (
					<section className="editor-load-theme__section">
						<Heading level={3}>From this browser</Heading>
						{localThemes.length === 0 ? (
							<Text size="sm" tone="muted">
								No saved themes yet. Edit the theme, then use Save to store one in
								this browser.
							</Text>
						) : (
							<ul className="editor-load-theme__list">
								{localThemes.map((theme) => (
									<li key={theme.name} className="editor-load-theme__item">
										<div className="editor-load-theme__info">
											<span className="editor-load-theme__name">
												{theme.name}
											</span>
											<span className="editor-load-theme__meta">
												{theme.name === currentThemeName
													? "current · "
													: ""}
												{formatSavedAt(theme.savedAt)}
											</span>
										</div>
										<Button
											label="Load"
											size="sm"
											variant="secondary"
											onClick={() => loadLocal(theme.name)}
										/>
										<Button
											label="Delete"
											size="sm"
											variant="ghost"
											onClick={() => removeLocal(theme.name)}
										/>
									</li>
								))}
							</ul>
						)}
					</section>
				)}
				{status === "error" && message ? (
					<Text size="sm" className="editor-load-theme__error">
						{message}
					</Text>
				) : null}
				<div className="editor-load-theme__actions">
					<Button label="Close" size="sm" variant="ghost" onClick={closeLoadDialog} />
				</div>
			</DialogContent>
			{pickerOpen ? (
				<FolderPicker
					initialPath={dir}
					onSelect={(path, hasContract) => {
						setDir(path, hasContract);
						setPickerOpen(false);
						void loadFromDir(path);
					}}
					onClose={() => setPickerOpen(false)}
				/>
			) : null}
		</Dialog>
	);
};
