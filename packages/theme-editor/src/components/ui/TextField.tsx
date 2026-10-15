import { clsx } from "@lib/clsx";
import { Label } from "@radix-ui/react-label";
import type * as React from "react";
import "./TextField.css";

interface TextFieldProps {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	error?: string;
	disabled?: boolean;
	readOnly?: boolean;
	className?: string;
}

/**
 * Token-styled single-line text field with a label and an optional error message.
 * Named states are exposed as `is-invalid`, `is-disabled`, and `is-readonly`.
 *
 * @param props The field id, label, value, change callback, and field state.
 * @returns The rendered element.
 */
export const TextField: React.FC<TextFieldProps> = ({
	id,
	label,
	value,
	onChange,
	placeholder,
	error,
	disabled = false,
	readOnly = false,
	className
}) => {
	const invalid = Boolean(error);

	return (
		<div
			className={clsx(
				"ui-field",
				{ "is-invalid": invalid, "is-disabled": disabled, "is-readonly": readOnly },
				className
			)}
		>
			<Label className="ui-field__label" htmlFor={id}>
				{label}
			</Label>
			<input
				id={id}
				className="ui-field__input"
				value={value}
				placeholder={placeholder}
				disabled={disabled}
				readOnly={readOnly}
				aria-invalid={invalid}
				onChange={(event) => onChange(event.target.value)}
			/>
			{error ? <span className="ui-field__error">{error}</span> : null}
		</div>
	);
};
