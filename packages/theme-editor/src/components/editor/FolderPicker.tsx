import { Icon } from "@components/base/Icon";
import { Text } from "@components/base/Text";
import { Button } from "@components/ui/Button";
import { Dialog, DialogContent } from "@components/ui/Dialog";
import { TextField } from "@components/ui/TextField";
import { useDisplayPath } from "@lib/app-state";
import { clsx } from "@lib/clsx";
import type { DirectoryListing } from "@lib/directories";
import type * as React from "react";
import { useEffect, useState } from "react";
import "./FolderPicker.css";

interface FolderPickerProps {
	initialPath?: string;
	onSelect: (path: string, hasContract: boolean) => void;
	onClose: () => void;
}

const errorMessage = (error: unknown): string =>
	error instanceof Error ? error.message : "Could not read the directory.";

/**
 * A server-backed directory browser. The browser cannot expose a real filesystem
 * path, so the list comes from `GET /api/dirs`; the picker returns the resolved
 * absolute path and whether it holds the contract, so the caller can offer a safe load.
 *
 * @param props The initial path, the select callback, and the close callback.
 * @returns The rendered element.
 */
export const FolderPicker: React.FC<FolderPickerProps> = ({ initialPath, onSelect, onClose }) => {
	const [target, setTarget] = useState<string | undefined>(initialPath || undefined);
	const [listing, setListing] = useState<DirectoryListing | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [creating, setCreating] = useState(false);
	const [newName, setNewName] = useState("");
	const [createError, setCreateError] = useState("");
	const displayPath = useDisplayPath(listing?.path ?? target ?? "");

	useEffect(() => {
		let cancelled = false;
		// oxlint-disable-next-line react/set-state-in-effect -- the fetch owns this state; reset it before each request
		setLoading(true);
		setError("");
		const query = target ? `?path=${encodeURIComponent(target)}` : "";
		fetch(`/api/dirs${query}`)
			.then(async (response) => {
				const data = (await response.json()) as DirectoryListing & { message?: string };

				if (!response.ok) {
					throw new Error(data.message ?? "Could not read the directory.");
				}

				if (!cancelled) {
					setListing(data);
				}
			})
			.catch((cause: unknown) => {
				if (!cancelled) {
					setListing(null);
					setError(errorMessage(cause));
				}
			})
			.finally(() => {
				if (!cancelled) {
					setLoading(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [target]);

	const create = async (): Promise<void> => {
		if (!listing) {
			return;
		}
		setCreateError("");

		try {
			const response = await fetch("/api/dirs", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ path: listing.path, name: newName })
			});
			const data = (await response.json()) as { path?: string; message?: string };

			if (!response.ok || !data.path) {
				throw new Error(data.message ?? "Could not create the folder.");
			}
			setCreating(false);
			setTarget(data.path);
		} catch (cause) {
			setCreateError(errorMessage(cause));
		}
	};

	return (
		<Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
			<DialogContent
				className="editor-folder-picker"
				title="Choose a project directory"
				description="Navigate to the folder that holds DESIGN.md and design-tokens.css."
			>
				<div className="editor-folder-picker__path" title={listing?.path ?? target}>
					{displayPath || "Working directory"}
				</div>
				<div className="editor-folder-picker__nav">
					<Button
						label="Home"
						size="sm"
						variant="ghost"
						disabled={loading || !listing?.home}
						onClick={() => listing?.home && setTarget(listing.home)}
					/>
					<Button
						label="Working directory"
						size="sm"
						variant="ghost"
						disabled={loading}
						onClick={() => setTarget(undefined)}
					/>
					<Button
						label="New folder"
						size="sm"
						variant="ghost"
						disabled={loading || !listing}
						onClick={() => {
							setNewName("");
							setCreateError("");
							setCreating(true);
						}}
					/>
				</div>
				{creating ? (
					<form
						className="editor-folder-picker__create"
						onSubmit={(event) => {
							event.preventDefault();
							void create();
						}}
					>
						<TextField
							id="editor-folder-picker-name"
							label="New folder name"
							value={newName}
							onChange={setNewName}
							placeholder="my-theme"
							error={createError || undefined}
						/>
						<Button label="Create" size="sm" variant="primary" type="submit" />
						<Button
							label="Cancel"
							size="sm"
							variant="ghost"
							onClick={() => setCreating(false)}
						/>
					</form>
				) : null}
				<div className="editor-folder-picker__list">
					{loading ? (
						<Text size="sm" tone="muted">
							Reading the directory…
						</Text>
					) : error ? (
						<Text size="sm" className="editor-folder-picker__error">
							{error}
						</Text>
					) : listing ? (
						<>
							{listing.parent ? (
								<button
									type="button"
									className="editor-folder-picker__entry editor-folder-picker__entry--parent"
									onClick={() => listing.parent && setTarget(listing.parent)}
								>
									<Icon name="folder" size="sm" />
									<span className="editor-folder-picker__entry-name">..</span>
								</button>
							) : null}
							{listing.entries.length > 0 ? (
								listing.entries.map((entry) => (
									<button
										key={entry.path}
										type="button"
										className={clsx("editor-folder-picker__entry", {
											"has-contract": entry.hasContract
										})}
										onClick={() => setTarget(entry.path)}
									>
										<Icon name="folder" size="sm" />
										<span className="editor-folder-picker__entry-name">
											{entry.name}
										</span>
										{entry.hasContract ? (
											<span className="editor-folder-picker__tag">theme</span>
										) : null}
									</button>
								))
							) : (
								<Text size="sm" tone="muted">
									No sub-directories here.
								</Text>
							)}
						</>
					) : null}
				</div>
				<div className="editor-folder-picker__actions">
					{listing && !listing.hasContract ? (
						<Text size="sm" tone="muted" className="editor-folder-picker__note">
							No DESIGN.md + design-tokens.css in this folder.
						</Text>
					) : null}
					<Button label="Cancel" size="sm" variant="ghost" onClick={onClose} />
					<Button
						label="Use this directory"
						size="sm"
						variant="primary"
						disabled={!listing}
						onClick={() => listing && onSelect(listing.path, listing.hasContract)}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
};
