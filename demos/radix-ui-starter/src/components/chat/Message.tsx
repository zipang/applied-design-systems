import { Box } from "@components/base/Box";
import { Icon } from "@components/base/Icon";
import { Text } from "@components/base/Text";
import { clsx } from "@lib/clsx";
import type * as React from "react";
import type { ChatMessage } from "./types";
import "./Message.css";

interface MessageProps {
	message: ChatMessage;
}

/**
 * One chat message: a speaker label and a bubble. Eliza's bubbles sit left on the
 * alternate surface; the user's sit right on the dark surface.
 *
 * @param props The message props.
 * @returns The rendered message.
 */
export const Message: React.FC<MessageProps> = ({ message }) => {
	const isEliza = message.speaker === "eliza";

	return (
		<li className={clsx("chat-message", { "is-eliza": isEliza, "is-you": !isEliza })}>
			<Text as="span" size="sm" tone="muted" className="chat-message__speaker">
				{isEliza ? "Eliza" : "You"}
			</Text>
			<Box
				background={isEliza ? "surface-alt" : "surface-dark"}
				py="base"
				px="lg"
				className="chat-message__bubble"
			>
				<Text size="md" tone={isEliza ? "base" : "ondark"}>
					{message.text}
				</Text>
				{message.attachment ? (
					<div className="chat-message__attachment">
						<Icon name="file" size="lg" />
						<span className="chat-message__file">
							<Text as="span" size="sm" tone={isEliza ? "base" : "ondark"}>
								{message.attachment.name}
							</Text>
							<Text as="span" size="sm" tone={isEliza ? "muted" : "ondark"}>
								{message.attachment.type} · {message.attachment.size}
							</Text>
						</span>
					</div>
				) : null}
			</Box>
		</li>
	);
};
