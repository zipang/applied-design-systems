import { Icon } from "@components/base/Icon";
import { Text } from "@components/base/Text";
import { Button } from "@components/ui/Button";
import { clsx } from "@lib/clsx";
import type * as React from "react";
import { useRef } from "react";
import type { Attachment } from "./types";
import "./Composer.css";

interface ComposerProps {
	draft: string;
	attachment: Attachment | null;
	pending: boolean;
	disabled?: boolean;
	onDraftChange: (value: string) => void;
	onAttach: (file: File) => void;
	onRemoveAttachment: () => void;
	onSend: () => void;
}

/**
 * Message composer: an attachment preview, an attach control, a textarea, and a send
 * button. Enter sends; Shift+Enter starts a new line.
 *
 * @param props The composer props.
 * @returns The rendered message composer.
 */
export const Composer: React.FC<ComposerProps> = ({
	draft,
	attachment,
	pending,
	disabled = false,
	onDraftChange,
	onAttach,
	onRemoveAttachment,
	onSend
}) => {
	const fileElt = useRef<HTMLInputElement>(null);
	const canSend = (draft.trim().length > 0 || attachment !== null) && !pending && !disabled;

	const submit = (event: React.FormEvent): void => {
		event.preventDefault();

		if (canSend) {
			onSend();
		}
	};

	return (
		<form className={clsx("chat-composer", { "is-pending": pending })} onSubmit={submit}>
			{attachment ? (
				<div className="chat-composer__attachment">
					<Icon name="file" size="md" />
					<Text as="span" size="sm">
						{attachment.name}
					</Text>
					<Text as="span" size="xs" tone="muted">
						{attachment.type} · {attachment.size}
					</Text>
					<Button
						icon="cross"
						ariaLabel="Remove attachment"
						variant="ghost"
						size="sm"
						onClick={onRemoveAttachment}
					/>
				</div>
			) : null}

			<div className="chat-composer__row">
				<input
					ref={fileElt}
					className="chat-composer__file"
					type="file"
					aria-hidden="true"
					tabIndex={-1}
					onChange={(event) => {
						const file = event.target.files?.[0];

						if (file) {
							onAttach(file);
						}

						event.target.value = "";
					}}
				/>
				<Button
					className="chat-composer__attach"
					icon="add"
					ariaLabel="Attach a file"
					variant="secondary"
					disabled={disabled}
					onClick={() => fileElt.current?.click()}
				/>
				<textarea
					className="chat-composer__input"
					value={draft}
					placeholder={
						disabled ? "The conversation is over." : "Write what you are thinking…"
					}
					aria-label="Message Eliza"
					rows={1}
					disabled={disabled}
					onChange={(event) => onDraftChange(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter" && !event.shiftKey) {
							event.preventDefault();

							if (canSend) {
								onSend();
							}
						}
					}}
				/>
				<Button
					className="chat-composer__send"
					type="submit"
					icon="send"
					label="Send"
					disabled={!canSend}
				/>
			</div>
		</form>
	);
};
