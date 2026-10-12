import { Button } from "@components/ui/Button";
import { Dialog, DialogContent } from "@components/ui/Dialog";
import { TextField } from "@components/ui/TextField";
import { useAppState } from "@lib/app-state";
import type * as React from "react";
import { useState } from "react";
import "./ThemeLibrary.css";

/** Modal that names and stores the current theme in this browser's localStorage. */
export const ThemeLibrary: React.FC = () => {
	const { currentThemeName, saveAsLocal, closeSaveDialog } = useAppState();
	const [name, setName] = useState(currentThemeName);

	const submit = (event: React.FormEvent<HTMLFormElement>): void => {
		event.preventDefault();
		saveAsLocal(name);
	};

	return (
		<Dialog open onOpenChange={(open) => (open ? undefined : closeSaveDialog())}>
			<DialogContent
				className="editor-theme-library"
				title="Save theme"
				description="Store this theme in your browser, under a name."
			>
				<form className="editor-theme-library__form" onSubmit={submit}>
					<TextField
						id="theme-editor-name"
						label="Theme name"
						value={name}
						onChange={setName}
						placeholder="My Theme"
					/>
					<div className="editor-theme-library__actions">
						<Button label="Save" type="submit" size="sm" variant="primary" />
						<Button label="Cancel" size="sm" variant="ghost" onClick={closeSaveDialog} />
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
