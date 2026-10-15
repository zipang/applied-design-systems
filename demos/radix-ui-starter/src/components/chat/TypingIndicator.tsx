import { Text } from "@components/base/Text";
import type * as React from "react";
import "./TypingIndicator.css";

/**
 * Three animated dots shown while Eliza composes a reply.
 *
 * @returns The rendered typing indicator.
 */
export const TypingIndicator: React.FC = () => (
	<div className="chat-typing" role="status" aria-label="Eliza is responding">
		<Text size="xs" tone="muted" className="chat-typing__speaker">
			Eliza
		</Text>
		<div className="chat-typing__bubble">
			<span className="chat-typing__dot" />
			<span className="chat-typing__dot" />
			<span className="chat-typing__dot" />
		</div>
	</div>
);
