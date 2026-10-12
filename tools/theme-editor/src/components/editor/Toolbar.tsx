import { FolderPicker } from "@components/editor/FolderPicker";
import { Button } from "@components/ui/Button";
import { useAppState, useDisplayPath } from "@lib/app-state";
import type * as React from "react";
import { useState } from "react";
import "./Toolbar.css";

export interface ToolbarProps {
	onShowReference: () => void;
}

/** Top bar: project directory, load/save/export/reset, and the token reference. */
export const Toolbar: React.FC<ToolbarProps> = ({ onShowReference }) => {
	const store = useAppState();
	const displayDir = useDisplayPath(store.dir);
	const errors = store.issues.filter((issue) => issue.level === "error").length;
	const [pickerOpen, setPickerOpen] = useState(false);

	return (
		<header className="editor-toolbar">
			<div className="editor-toolbar__brand">
				<span className="editor-toolbar__mark">THEME EDITOR</span>
				<span
					className="editor-toolbar__status"
					data-status={store.status}
					title={store.message || undefined}
				>
					{errors > 0
						? `${errors} error${errors === 1 ? "" : "s"}`
						: store.dirty
							? "unsaved changes"
							: store.message || store.status}
				</span>
			</div>
			<div className="editor-toolbar__actions">
				<div className="editor-toolbar__dir-group">
					<input
						className="editor-toolbar__dir"
						type="text"
						aria-label="Project directory"
						placeholder="/path/to/project"
						title={store.dir || undefined}
						value={displayDir}
						readOnly
						spellCheck={false}
					/>
					<Button
						label="…"
						size="sm"
						variant="secondary"
						ariaLabel="Browse for a project directory"
						onClick={() => setPickerOpen(true)}
					/>
				</div>
				<Button
					label="Load"
					size="sm"
					variant="secondary"
					icon="file"
					onClick={() => store.requestLoad()}
				/>
				<Button label="Save" size="sm" variant="primary" onClick={() => store.requestSave()} />
				<Button label="Export" size="sm" variant="ghost" onClick={store.exportFiles} />
				<Button label="Reset" size="sm" variant="ghost" icon="reset" onClick={store.reset} />
				<Button label="Reference" size="sm" variant="ghost" onClick={onShowReference} />
			</div>
			{pickerOpen ? (
				<FolderPicker
					initialPath={store.dir}
					onSelect={(path, hasContract) => {
						store.setDir(path, hasContract);
						setPickerOpen(false);
					}}
					onClose={() => setPickerOpen(false)}
				/>
			) : null}
		</header>
	);
};
