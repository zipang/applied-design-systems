import { Heading } from "@components/base/Heading";
import { Text } from "@components/base/Text";
import { Button } from "@components/ui/Button";
import { useAppState } from "@lib/app-state";
import { groupTokens } from "@lib/design-system";
import type * as React from "react";
import "./TokenReference.css";

export interface TokenReferenceProps {
	onClose: () => void;
}

/** Modal listing the fixed path ↔ CSS-variable mapping, current value, and status. */
export const TokenReference: React.FC<TokenReferenceProps> = ({ onClose }) => {
	const { values, issues } = useAppState();
	const errorTargets = new Set(issues.map((issue) => issue.target).filter(Boolean));

	return (
		<div className="editor-reference" role="dialog" aria-modal="true" aria-label="Token reference">
			<button
				type="button"
				className="editor-reference__scrim"
				aria-label="Close token reference"
				onClick={onClose}
			/>
			<div className="editor-reference__panel">
				<header className="editor-reference__head">
					<div>
						<Heading level={2} size="md">
							Token reference
						</Heading>
						<Text size="sm" tone="muted">
							The fixed path to CSS variable mapping from the design-system-tokens skill.
						</Text>
					</div>
					<Button label="Close" size="sm" variant="secondary" onClick={onClose} />
				</header>
				<div className="editor-reference__body">
					{groupTokens().map(({ group, label, tokens }) => (
						<section className="editor-reference__group" key={group}>
							<span className="editor-reference__label">{label}</span>
							<table className="editor-reference__table">
								<thead>
									<tr>
										<th>Token path</th>
										<th>CSS variable</th>
										<th>Value</th>
									</tr>
								</thead>
								<tbody>
									{tokens.map((token) => (
										<tr
											key={token.variable}
											className={errorTargets.has(token.variable) ? "is-invalid" : undefined}
										>
											<td>
												<code>{token.path ?? "—"}</code>
											</td>
											<td>
												<code>{token.variable}</code>
											</td>
											<td>
												<code>{values[token.variable] ?? ""}</code>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</section>
					))}
				</div>
			</div>
		</div>
	);
};
