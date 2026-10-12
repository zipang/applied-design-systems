import { Heading } from "@components/base/Heading";
import { Text } from "@components/base/Text";
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
 * The load dialog. It offers the two places a theme can come from: the project
 * directory on disk, or a theme saved in this browser's localStorage. The disk option
 * is only offered when the directory is known to be loadable; a typed path stays
 * enabled and reports its error inline.
 */
export const LoadThemeDialog: React.FC = () => {
	const {
		dir,
		dirHasContract,
		localThemes,
		currentThemeName,
		status,
		message,
		loadFromDisk,
		loadLocal,
		removeLocal,
		closeLoadDialog
	} = useAppState();
	const displayDir = useDisplayPath(dir);
	const [tab, setTab] = useState("directory");

	const diskReady = Boolean(dir) && dirHasContract !== false;
	const diskHint = !dir
		? "Choose a project directory with the … button first."
		: dirHasContract === false
			? "This directory has no DESIGN.md + design-tokens.css."
			: "";

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
						{diskHint ? (
							<Text size="sm" tone="muted">
								{diskHint}
							</Text>
						) : null}
						<Button
							label="Load from directory"
							size="sm"
							variant="secondary"
							disabled={!diskReady}
							loading={status === "loading"}
							onClick={loadFromDisk}
						/>
					</section>
				) : (
					<section className="editor-load-theme__section">
						<Heading level={3}>From this browser</Heading>
						{localThemes.length === 0 ? (
							<Text size="sm" tone="muted">
								No saved themes yet. Edit the theme, then use Save to store one in this browser.
							</Text>
						) : (
							<ul className="editor-load-theme__list">
								{localThemes.map((theme) => (
									<li key={theme.name} className="editor-load-theme__item">
										<div className="editor-load-theme__info">
											<span className="editor-load-theme__name">{theme.name}</span>
											<span className="editor-load-theme__meta">
												{theme.name === currentThemeName ? "current · " : ""}
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
		</Dialog>
	);
};
