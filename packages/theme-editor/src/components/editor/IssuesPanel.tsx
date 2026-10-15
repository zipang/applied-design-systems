import { Button } from "@components/ui/Button";
import { useAppState } from "@lib/app-state";
import type * as React from "react";
import "./IssuesPanel.css";

export interface IssuesPanelProps {
	onShowReference: () => void;
}

/**
 * Banner that surfaces contract validation errors before an invalid save.
 *
 * @param props The callback that opens the token reference.
 * @returns The rendered element, or null when there are no errors.
 */
export const IssuesPanel: React.FC<IssuesPanelProps> = ({ onShowReference }) => {
	const { issues } = useAppState();
	const errors = issues.filter((issue) => issue.level === "error");

	if (errors.length === 0) {
		return null;
	}

	return (
		<div className="editor-issues" role="status">
			<span className="editor-issues__title">
				{errors.length} validation error{errors.length === 1 ? "" : "s"}
			</span>
			<ul className="editor-issues__list">
				{errors.slice(0, 5).map((issue) => (
					<li key={`${issue.code}:${issue.target ?? ""}`}>{issue.message}</li>
				))}
			</ul>
			<div className="editor-issues__action">
				<Button
					label="Inspect tokens"
					size="sm"
					variant="ghost"
					onClick={onShowReference}
				/>
			</div>
		</div>
	);
};
