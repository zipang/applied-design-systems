import { createEliza } from "@lib/eliza/eliza";
import { formatBytes } from "@lib/format";
import { useState } from "react";
import type { Attachment, ChatMessage } from "./types";

/** The conversation state and the actions that mutate it. */
export interface Chat {
	messages: ChatMessage[];
	pending: boolean;
	finished: boolean;
	draft: string;
	attachment: Attachment | null;
	setDraft: (value: string) => void;
	attach: (file: File) => void;
	removeAttachment: () => void;
	send: () => void;
	reset: () => void;
}

/**
 * Own the Eliza conversation: messages, composer draft, attachment, and the reply
 * engine. The chat page binds the returned state and actions to its regions.
 *
 * @returns The conversation state and actions.
 */
export const useChat = (): Chat => {
	const [eliza] = useState(createEliza);
	const [messages, setMessages] = useState<ChatMessage[]>(() => [
		{ id: 1, speaker: "eliza", text: eliza.opening }
	]);
	const [draft, setDraft] = useState("");
	const [attachment, setAttachment] = useState<Attachment | null>(null);
	const [pending, setPending] = useState(false);
	const [finished, setFinished] = useState(false);

	const attach = (file: File): void => {
		setAttachment({
			name: file.name,
			size: formatBytes(file.size),
			type: file.type.split("/")[1]?.toUpperCase() || "FILE"
		});
	};

	const send = (): void => {
		const text = draft.trim();
		const includedFile = attachment;

		if (!text && !includedFile) {
			return;
		}

		setMessages((current) => [
			...current,
			{
				id: Date.now(),
				speaker: "you",
				text: text || "I'd like to share this with you.",
				attachment: includedFile ?? undefined
			}
		]);
		setDraft("");
		setAttachment(null);
		setPending(true);

		window.setTimeout(() => {
			setMessages((current) => [
				...current,
				{ id: Date.now() + 1, speaker: "eliza", text: eliza.reply(text) }
			]);
			setPending(false);
			setFinished(eliza.isFinished());
		}, 650);
	};

	const reset = (): void => {
		eliza.reset();
		setMessages([{ id: Date.now(), speaker: "eliza", text: eliza.opening }]);
		setDraft("");
		setAttachment(null);
		setPending(false);
		setFinished(false);
	};

	return {
		messages,
		pending,
		finished,
		draft,
		attachment,
		setDraft,
		attach,
		removeAttachment: () => setAttachment(null),
		send,
		reset
	};
};
