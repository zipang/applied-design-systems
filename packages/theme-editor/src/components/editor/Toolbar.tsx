import { Icon } from "@components/base/Icon";
import { EditableText } from "@components/editor/EditableText";
import { Button } from "@components/ui/Button";
import { Pill, type PillTone } from "@components/ui/Pill";
import { useAppState, useDisplayPath } from "@lib/app-state";
import type * as React from "react";
import "./Toolbar.css";

export interface ToolbarProps {
	onShowReference: () => void;
}

/**
 * Top bar: the theme name and save state, its location, load/save/export, and reference.
 *
 * @param props The callback that opens the token reference.
 * @returns The rendered element.
 */
export const Toolbar: React.FC<ToolbarProps> = ({ onShowReference }) => {
	const store = useAppState();
	const location = store.location;
	const displayLocation = useDisplayPath(location?.kind === "directory" ? location.dir : "");
	const errors = store.issues.filter((issue) => issue.level === "error").length;

	const statusLabel =
		errors > 0
			? `${errors} error${errors === 1 ? "" : "s"}`
			: store.dirty
				? "unsaved changes"
				: store.message || store.status;
	const statusTone: PillTone =
		errors > 0 || store.status === "error"
			? "danger"
			: store.dirty
				? "warning"
				: store.status === "saved"
					? "success"
					: "neutral";

	return (
		<header className="editor-toolbar">
			<div className="editor-toolbar__brand">
				<span className="editor-toolbar__mark">THEME EDITOR</span>
			</div>
			<div className="app__container editor-toolbar__center">
				<EditableText
					value={store.themeName}
					onChange={store.setThemeName}
					className="editor-toolbar__name"
				/>
				<Pill tone={statusTone} label={statusLabel} />
				<span className="editor-toolbar__spacer" aria-hidden="true" />
				<div className="editor-toolbar__actions">
					<Button
						label="Load"
						size="sm"
						variant="secondary"
						icon="file"
						onClick={() => store.requestLoad()}
					/>
					<Button
						label="Save"
						size="sm"
						variant="primary"
						icon="save"
						onClick={() => store.requestSave()}
					/>
					<Button
						label="Export"
						size="sm"
						variant="ghost"
						icon="download"
						onClick={store.requestExport}
					/>
				</div>
			</div>
			<span
				className="editor-toolbar__location"
				title={location?.kind === "directory" ? location.dir : undefined}
			>
				{location?.kind === "favorite" ? <Icon name="star" size="sm" /> : null}
				<span className="editor-toolbar__location-text">
					{location?.kind === "directory"
						? displayLocation
						: location?.kind === "favorite"
							? "Favorites"
							: "Not saved"}
				</span>
			</span>
			<div className="editor-toolbar__aside">
				<Button label="Reference" size="sm" variant="ghost" onClick={onShowReference} />
			</div>
		</header>
	);
};
