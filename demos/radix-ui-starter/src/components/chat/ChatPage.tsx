import { Container } from "@components/layout/Container";
import { PageBody } from "@components/layout/PageBody";
import { PageFooter } from "@components/layout/PageFooter";
import type * as React from "react";
import { ChatHeader } from "./ChatHeader";
import { Composer } from "./Composer";
import { MessageList } from "./MessageList";
import { useChat } from "./useChat";

/**
 * The chat page regions. A sticky header and the transcript scroll in the page body;
 * the composer is pinned in the page footer.
 *
 * @returns The rendered chat page.
 */
export const ChatPage: React.FC = () => {
	const chat = useChat();

	return (
		<>
			<PageBody>
				<Container width="lg">
					<ChatHeader onReset={chat.reset} />
					<MessageList messages={chat.messages} pending={chat.pending} />
				</Container>
			</PageBody>
			<PageFooter>
				<Container width="lg">
					<Composer
						draft={chat.draft}
						attachment={chat.attachment}
						pending={chat.pending}
						disabled={chat.finished}
						onDraftChange={chat.setDraft}
						onAttach={chat.attach}
						onRemoveAttachment={chat.removeAttachment}
						onSend={chat.send}
					/>
				</Container>
			</PageFooter>
		</>
	);
};
