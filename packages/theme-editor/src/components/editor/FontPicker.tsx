import {
	FONT_CATEGORIES,
	type FontCategory,
	type FontEntry,
	GOOGLE_FONTS,
	SYSTEM_FONTS
} from "@applied-design-systems/design-tokens";
import { clsx } from "@lib/clsx";
import { loadGoogleFont } from "@lib/google-font-loader";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import "./FontPicker.css";

interface FontCardProps {
	font: FontEntry;
	selected: boolean;
	previewText: string;
	onSelect: (family: string) => void;
}

/** A single selectable font card. The family lazy-loads when it scrolls into view. */
const FontCard: React.FC<FontCardProps> = ({ font, selected, previewText, onSelect }) => {
	const ref = useRef<HTMLButtonElement>(null);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		const elt = ref.current;

		if (!elt) {
			return;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					loadGoogleFont(font.family);
					const timer = setTimeout(() => setLoaded(true), 120);
					observer.disconnect();

					return () => clearTimeout(timer);
				}
			},
			{ rootMargin: "160px" }
		);
		observer.observe(elt);

		return () => observer.disconnect();
	}, [font.family]);

	return (
		<button
			ref={ref}
			type="button"
			className={clsx("ui-fontcard", { "is-selected": selected })}
			onClick={() => onSelect(font.family)}
		>
			<span className="ui-fontcard__head">
				<span className="ui-fontcard__name">{font.family}</span>
				<span
					className={clsx("ui-fontcard__badge", `ui-fontcard__badge--${font.category}`)}
				>
					{font.category === "sans-serif"
						? "sans"
						: font.category === "handwriting"
							? "script"
							: font.category === "monospace"
								? "mono"
								: font.category}
				</span>
			</span>
			<span
				className="ui-fontcard__sample"
				style={{
					fontFamily: loaded ? `"${font.family}"` : "inherit",
					opacity: loaded ? 1 : 0.25
				}}
			>
				{previewText || font.family}
			</span>
		</button>
	);
};

export interface FontPickerProps {
	value: string;
	onChange: (family: string) => void;
	onClose: () => void;
}

/**
 * Modal font browser: providers, category filters, search, preview text, and cards.
 *
 * @param props The current family, the change callback, and the close callback.
 * @returns The rendered element.
 */
export const FontPicker: React.FC<FontPickerProps> = ({ value, onChange, onClose }) => {
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<FontCategory>("all");
	const [provider, setProvider] = useState<"google" | "system">("google");
	const [preview, setPreview] = useState("The quick brown fox");
	const searchRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		loadGoogleFont(value);
		const timer = setTimeout(() => searchRef.current?.focus(), 60);

		return () => clearTimeout(timer);
	}, [value]);

	useEffect(() => {
		const onKey = (event: KeyboardEvent): void => {
			if (event.key === "Escape") {
				onClose();
			}
		};
		window.addEventListener("keydown", onKey);

		return () => window.removeEventListener("keydown", onKey);
	}, [onClose]);

	const catalog = provider === "google" ? GOOGLE_FONTS : SYSTEM_FONTS;
	const filtered = catalog.filter(
		(font) =>
			font.family.toLowerCase().includes(search.toLowerCase()) &&
			(category === "all" || font.category === category)
	);

	const providers = [
		{
			key: "google" as const,
			label: "Google Fonts",
			count: GOOGLE_FONTS.length,
			disabled: false
		},
		{ key: "system" as const, label: "System", count: SYSTEM_FONTS.length, disabled: false },
		{ key: "adobe" as const, label: "Adobe Fonts", count: 0, disabled: true }
	];

	return (
		<div className="ui-fontpicker" role="dialog" aria-modal="true" aria-label="Font picker">
			<button
				type="button"
				className="ui-fontpicker__scrim"
				aria-label="Close font picker"
				onClick={onClose}
			/>
			<div className="ui-fontpicker__panel">
				<header className="ui-fontpicker__head">
					<div>
						<span className="ui-fontpicker__title">Font Picker</span>
						<span className="ui-fontpicker__current">
							Current: <span style={{ fontFamily: `"${value}"` }}>{value}</span>
						</span>
					</div>
					<input
						ref={searchRef}
						className="ui-fontpicker__search"
						type="search"
						placeholder="Search fonts…"
						value={search}
						onChange={(event) => setSearch(event.currentTarget.value)}
					/>
					<button
						type="button"
						className="ui-fontpicker__close"
						aria-label="Close"
						onClick={onClose}
					>
						×
					</button>
				</header>

				<div className="ui-fontpicker__providers" role="tablist">
					{providers.map((entry) => (
						<button
							key={entry.key}
							type="button"
							role="tab"
							aria-selected={provider === entry.key}
							disabled={entry.disabled}
							className={clsx("ui-fontpicker__provider", {
								"is-active": provider === entry.key
							})}
							onClick={() => {
								if (entry.disabled || entry.key === "adobe") {
									return;
								}
								setProvider(entry.key);
								setCategory("all");
							}}
						>
							{entry.label}
							{entry.count > 0 ? (
								<span className="ui-fontpicker__count">{entry.count}</span>
							) : null}
						</button>
					))}
				</div>

				<div className="ui-fontpicker__filters">
					<div className="ui-fontpicker__categories">
						{FONT_CATEGORIES.map((entry) => (
							<button
								key={entry.key}
								type="button"
								className={clsx("ui-fontpicker__category", {
									"is-active": category === entry.key
								})}
								onClick={() => setCategory(entry.key)}
							>
								{entry.label}
							</button>
						))}
					</div>
					<input
						className="ui-fontpicker__preview"
						type="text"
						placeholder="Preview text…"
						value={preview}
						onChange={(event) => setPreview(event.currentTarget.value)}
					/>
				</div>

				<div className="ui-fontpicker__grid">
					{filtered.map((font) => (
						<FontCard
							key={font.family}
							font={font}
							selected={value === font.family}
							previewText={preview}
							onSelect={(family) => {
								loadGoogleFont(family);
								onChange(family);
								onClose();
							}}
						/>
					))}
				</div>

				<footer className="ui-fontpicker__foot">
					<span>
						{filtered.length} font{filtered.length === 1 ? "" : "s"} · click to apply
					</span>
					<button type="button" className="ui-fontpicker__done" onClick={onClose}>
						Done
					</button>
				</footer>
			</div>
		</div>
	);
};
