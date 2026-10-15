import type * as React from "react";
import "./Fields.css";

export interface NumberFieldProps {
	label: string;
	value: number;
	min?: number;
	max?: number;
	step?: number;
	suffix?: string;
	onChange: (value: number) => void;
}

/**
 * Labeled numeric input for the settings menus.
 *
 * @param props The label, number value, bounds, step, suffix, and change callback.
 * @returns The rendered element.
 */
export const NumberField: React.FC<NumberFieldProps> = ({
	label,
	value,
	min,
	max,
	step = 1,
	suffix,
	onChange
}) => (
	<label className="editor-field">
		<span className="editor-field__label">{label}</span>
		<span className="editor-field__control">
			<input
				className="editor-field__input"
				type="number"
				value={Number.isFinite(value) ? value : ""}
				min={min}
				max={max}
				step={step}
				onChange={(event) => onChange(Number.parseFloat(event.currentTarget.value))}
			/>
			{suffix ? <span className="editor-field__suffix">{suffix}</span> : null}
		</span>
	</label>
);

export interface FixedFieldProps {
	label: string;
	value: string;
}

/**
 * A read-only field for a step the contract fixes. It keeps the field chrome so the
 * settings column stays aligned, but reads as inactive because no editor applies.
 *
 * @param props The label and the fixed value.
 * @returns The rendered element.
 */
export const FixedField: React.FC<FixedFieldProps> = ({ label, value }) => (
	<label className="editor-field is-fixed">
		<span className="editor-field__label">{label}</span>
		<span className="editor-field__control">
			<input
				className="editor-field__input"
				type="text"
				value={value}
				readOnly
				tabIndex={-1}
			/>
		</span>
	</label>
);

export interface TextInputProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
}

/**
 * Labeled text input for font stacks and free-form token values.
 *
 * @param props The label, text value, and change callback.
 * @returns The rendered element.
 */
export const TextInput: React.FC<TextInputProps> = ({ label, value, onChange }) => (
	<label className="editor-field">
		<span className="editor-field__label">{label}</span>
		<input
			className="editor-field__input"
			type="text"
			value={value}
			spellCheck={false}
			onChange={(event) => onChange(event.currentTarget.value)}
		/>
	</label>
);

export interface SelectFieldOption {
	value: string;
	label: string;
}

export interface TokenFieldProps {
	label: string;
	token: string;
	tokens: SelectFieldOption[];
	value: number;
	min?: number;
	max?: number;
	step?: number;
	onTokenChange: (token: string) => void;
	onValueChange: (value: number) => void;
}

/**
 * One label with a token picker and its value on the same line: choose which token a
 * style uses, then edit that token's value. The value is never free — it belongs to the
 * selected token.
 *
 * @param props The label, selected token, token options, value, and change callbacks.
 * @returns The rendered element.
 */
export const TokenField: React.FC<TokenFieldProps> = ({
	label,
	token,
	tokens,
	value,
	min,
	max,
	step = 1,
	onTokenChange,
	onValueChange
}) => (
	<div className="editor-field">
		<span className="editor-field__label">{label}</span>
		<span className="editor-field__pair">
			<select
				className="editor-field__input editor-field__select"
				aria-label={`${label} token`}
				value={token}
				onChange={(event) => onTokenChange(event.currentTarget.value)}
			>
				{tokens.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			<input
				className="editor-field__input editor-field__number"
				type="number"
				aria-label={`${label} value`}
				value={Number.isFinite(value) ? value : ""}
				min={min}
				max={max}
				step={step}
				onChange={(event) => onValueChange(Number.parseFloat(event.currentTarget.value))}
			/>
		</span>
	</div>
);

export interface ColorFieldProps {
	label: string;
	token: string;
	value: string;
	onChange: (value: string) => void;
}

/**
 * A swatch that opens the native color picker, plus an editable value and token name.
 *
 * @param props The label, token name, color value, and change callback.
 * @returns The rendered element.
 */
export const ColorField: React.FC<ColorFieldProps> = ({ label, token, value, onChange }) => (
	<div className="editor-color">
		<label className="editor-color__swatch" style={{ ["--editor-swatch" as string]: value }}>
			<input
				className="editor-color__picker"
				type="color"
				value={/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? value : "#000000"}
				aria-label={label}
				onChange={(event) => onChange(event.currentTarget.value)}
			/>
		</label>
		<div className="editor-color__meta">
			<span className="editor-color__name">{label}</span>
			<input
				className="editor-color__value"
				type="text"
				value={value}
				spellCheck={false}
				aria-label={`${label} value`}
				onChange={(event) => onChange(event.currentTarget.value)}
			/>
			<code className="editor-color__token">{token}</code>
		</div>
	</div>
);
