import type * as React from "react";
import { useEffect, useRef } from "react";
import { Message } from "./Message";
import { TypingIndicator } from "./TypingIndicator";
import type { ChatMessage } from "./types";
import "./MessageList.css";

interface MessageListProps {
	messages: ChatMessage[];
	pending: boolean;
}

/**
 * The conversation transcript. Keeps the newest message in view as it grows.
 *
 * @param props The message list props.
 * @returns The rendered transcript.
 */
export const MessageList: React.FC<MessageListProps> = ({ messages, pending }) => {
	const endElt = useRef<HTMLLIElement>(null);

	// Re-scroll whenever the transcript or the typing indicator changes.
	useEffect(() => {
		endElt.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, pending]);

	return (
		<ol className="chat-message-list" aria-live="polite">
			{messages.map((message) => (
				<Message key={message.id} message={message} />
			))}
			{pending ? (
				<li>
					<TypingIndicator />
				</li>
			) : null}
			<li ref={endElt} aria-hidden="true" />
		</ol>
	);
};
