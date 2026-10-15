import { Heading } from "@components/base/Heading";
import { Text } from "@components/base/Text";
import { Button } from "@components/ui/Button";
import type * as React from "react";
import "./ChatHeader.css";

interface ChatHeaderProps {
	onReset: () => void;
}

/**
 * Chat identity and the start-over action.
 *
 * @param props The chat header props.
 * @returns The rendered chat header.
 */
export const ChatHeader: React.FC<ChatHeaderProps> = ({ onReset }) => (
	<header className="chat-header">
		<div className="chat-header__identity">
			<Heading level={1}>Eliza</Heading>
			<Text as="span" size="sm" tone="muted">
				What's on your mind?
			</Text>
		</div>
		<Button icon="reset" label="Start over" variant="ghost" onClick={onReset} />
	</header>
);
