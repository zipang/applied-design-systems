import { clsx } from "@lib/clsx";
import type * as React from "react";
import { useEffect, useRef } from "react";
import "./EditableText.css";

export interface EditableTextProps {
	value: string;
	onChange: (value: string) => void;
	className?: string;
}

/**
 * Inline-editable sample text. The DOM owns the caret while focused; the value is
 * committed on blur so React never fights the user's typing.
 *
 * @param props The current value, the change callback, and the optional class.
 * @returns The rendered element.
 */
export const EditableText: React.FC<EditableTextProps> = ({ value, onChange, className }) => {
	const ref = useRef<HTMLDivElement>(null);
	const focused = useRef(false);

	useEffect(() => {
		if (!focused.current && ref.current && ref.current.textContent !== value) {
			ref.current.textContent = value;
		}
	}, [value]);

	return (
		// Inline sample text needs contentEditable, not a textarea.
		<div
			ref={ref}
			className={clsx("ui-editable", className)}
			contentEditable
			suppressContentEditableWarning
			spellCheck={false}
			role="textbox"
			aria-multiline="true"
			tabIndex={0}
			onFocus={() => {
				focused.current = true;
			}}
			onBlur={(event) => {
				focused.current = false;
				onChange(event.currentTarget.textContent ?? "");
			}}
		/>
	);
};
