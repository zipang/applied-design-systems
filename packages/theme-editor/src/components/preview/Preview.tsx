import {
	contrastLevel,
	formatRem,
	geometricSpacingScaleRem,
	hexContrastRatio,
	linearSpacingScaleRem,
	resolveVariables,
	SPACE_MULTIPLIER_DEFAULT,
	SPACE_SEED_DEFAULT,
	SPACE_UNIT_DEFAULT,
	TOKENS,
	type TokenValues
} from "@applied-design-systems/design-tokens";
import { Heading } from "@components/base/Heading";
import { Text } from "@components/base/Text";
import { EditableText } from "@components/editor/EditableText";
import { FixedField, NumberField, TextInput, TokenField } from "@components/editor/Fields";
import { FontPicker } from "@components/editor/FontPicker";
import { SettingsCog } from "@components/editor/SettingsCog";
import { Button } from "@components/ui/Button";
import { Tabs } from "@components/ui/Tabs";
import { TextField } from "@components/ui/TextField";
import { useAppState } from "@lib/app-state";
import { clsx } from "@lib/clsx";
import type * as React from "react";
import { useState } from "react";
import "./Preview.css";

const read = (values: TokenValues, variable: string): string => values[variable] ?? "";
const px = (values: TokenValues, variable: string): number => {
	const raw = read(values, variable);
	const parsed = Number.parseFloat(raw);

	if (Number.isNaN(parsed)) {
		return 0;
	}

	return raw.endsWith("px") ? parsed : parsed * 16;
};
/** A length token as a `rem` number, so length editors speak the contract's own unit. */
const rem = (values: TokenValues, variable: string): number =>
	Number((px(values, variable) / 16).toFixed(4));
const resolved = (values: TokenValues, variable: string): string =>
	resolveVariables(read(values, variable), values);
const resolvedNumber = (values: TokenValues, variable: string): number =>
	Number.parseFloat(resolveVariables(read(values, variable), values)) || 0;
const primaryFamily = (value: string): string =>
	value.split(",")[0]?.replace(/["']/g, "").trim() ?? value;
const tokenName = (variable: string, prefix: string): string =>
	variable.startsWith(prefix) ? variable.slice(prefix.length) : variable;

/** Offsets from step 0 (`1rem`) for the fixed size scale. */
const SIZE_OFFSETS: [string, number][] = [
	["xs", -2],
	["sm", -1],
	["md", 0],
	["lg", 1],
	["xl", 2],
	["2xl", 3],
	["display", 4]
];

/** The fixed weight and line-height tokens, as selectable options. */
const WEIGHT_OPTIONS = TOKENS.filter((token) => token.kind === "font-weight").map((token) => ({
	value: token.variable,
	label: tokenName(token.variable, "--font-weight-")
}));
const LINE_HEIGHT_OPTIONS = TOKENS.filter((token) => token.kind === "line-height").map((token) => ({
	value: token.variable,
	label: tokenName(token.variable, "--line-height-")
}));

/** Fallback token per track when the loaded `DESIGN.md` omits a style reference. */
const DEFAULT_WEIGHT: Record<TrackKey, string> = {
	heading: "--font-weight-bold",
	body: "--font-weight-regular",
	mono: "--font-weight-thin"
};
const DEFAULT_LINE_HEIGHT: Record<TrackKey, string> = {
	heading: "--line-height-tight",
	body: "--line-height-regular",
	mono: "--line-height-regular"
};
const DEFAULT_LETTER_SPACING: Record<TrackKey, string | undefined> = {
	heading: "--letter-spacing-tight",
	body: undefined,
	mono: undefined
};

const SectionHeader: React.FC<{ index: string; title: string }> = ({ index, title }) => (
	<header className="vz-section__head">
		<span className="vz-section__index">{index}</span>
		<Heading level={2} size="lg" className="vz-section__title">
			{title}
		</Heading>
	</header>
);

/**
 * The settings row: an optional meta summary line, plus the single settings cog. The cog is
 * right-aligned like the reference; with no summary the row collapses onto the cog alone.
 */
const MetaRow: React.FC<{
	summary?: React.ReactNode;
	cogLabel: string;
	children: React.ReactNode;
}> = ({ summary, cogLabel, children }) => (
	<div className={clsx("vz-meta", { "is-end": summary === undefined })}>
		{summary === undefined ? null : <div className="vz-meta__text">{summary}</div>}
		<SettingsCog label={cogLabel}>{children}</SettingsCog>
	</div>
);

/**
 * One tab panel, carrying the shared preview scope. Every panel of a tabbed section stays
 * mounted: `.vz-panels` stacks them in one grid cell, so the group is always as tall as
 * the tallest tab and switching tabs never reflows the page below it.
 */
const TabPanel: React.FC<{ active: boolean; children: React.ReactNode }> = ({
	active,
	children
}) => (
	<div className={clsx("vz-preview", "vz-panel", { "is-active": active })} data-ds-preview>
		{children}
	</div>
);

/* ── Typography ──────────────────────────────────────────────────────────── */

type TrackKey = "heading" | "body" | "mono";

/** The three type tracks, in tab order. Drives both the tab bar and the panels. */
const TRACKS: { key: TrackKey; label: string }[] = [
	{ key: "heading", label: "Headings" },
	{ key: "body", label: "Body" },
	{ key: "mono", label: "Mono" }
];

interface TrackConfig {
	base: number;
	ratio: number;
	steps: number;
}

const TRACK_DEFAULTS: Record<TrackKey, TrackConfig> = {
	heading: { base: 16, ratio: 1.333, steps: 7 },
	body: { base: 14, ratio: 1.25, steps: 5 },
	mono: { base: 13, ratio: 1.2, steps: 4 }
};

const HEADING_LABELS = ["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9"];
const BODY_LABELS = ["xl", "lg", "base", "sm", "xs"];
const MONO_LABELS = ["lg", "base", "sm", "xs"];

const HEADING_TEXTS = [
	"The Architecture of Type",
	"Form Follows Function",
	"Swiss Design Principles",
	"Grid and Proportion",
	"Negative Space",
	"Typographic Hierarchy",
	"Details Matter",
	"Craft",
	"Form"
];
const BODY_TEXTS = [
	"The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. Every good boy does fine.",
	"A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart.",
	"Typography is the craft of endowing human language with a durable visual form, and thus with an independent existence.",
	"The choice of typeface is the most fundamental typographic act and the one most likely to determine the outcome of a design.",
	"Good typography makes the reading experience better."
];
const MONO_TEXTS = [
	"const scale = (base, ratio, step) => base * ratio ** step;",
	"--ds-color-brand-accent: #2D2DFF;",
	"font-size: clamp(1rem, 2vw, 1.5rem);",
	"// 16px → 1rem → t-base"
];

const stepSizes = (base: number, ratio: number, steps: number): number[] =>
	Array.from({ length: steps }, (_, i) => base * ratio ** (steps - 1 - i));

interface TrackView {
	key: TrackKey;
	styleKey: string;
	familyVariable: string;
	defaultFamily: string;
	cogLabel: string;
	tabLabel: string;
	labels: string[];
	texts: string[];
	metaExtra: string;
}

/**
 * Typography: Headings / Body / Mono tracks, one cog each, faithful to the reference.
 *
 * @returns The rendered element.
 */
export const TypographySection: React.FC = () => {
	const { values, update, typography, updateTypography } = useAppState();
	const [track, setTrack] = useState<TrackKey>("heading");
	const [configs, setConfigs] = useState<Record<TrackKey, TrackConfig>>(TRACK_DEFAULTS);
	const [texts, setTexts] = useState<Record<TrackKey, string[]>>({
		heading: HEADING_TEXTS,
		body: BODY_TEXTS,
		mono: MONO_TEXTS
	});
	const [picking, setPicking] = useState(false);

	const config = configs[track];

	const setConfig = (patch: Partial<TrackConfig>): void => {
		const next = { ...config, ...patch };
		setConfigs((prev) => ({ ...prev, [track]: next }));

		if (track === "heading") {
			// The contract has a single size scale; the heading track owns it.
			update("--font-size-base", "1rem");

			for (const [name, offset] of SIZE_OFFSETS) {
				update(`--font-size-${name}`, formatRem(next.base * next.ratio ** offset));
			}
		}
	};

	const setText = (key: TrackKey, index: number, value: string): void =>
		setTexts((prev) => {
			const list = [...prev[key]];
			list[index] = value;

			return { ...prev, [key]: list };
		});

	const views: Record<TrackKey, TrackView> = {
		heading: {
			key: "heading",
			styleKey: "display",
			familyVariable: "--font-family-display",
			defaultFamily: "DM Serif Display",
			cogLabel: "Heading Scale",
			tabLabel: "Headings",
			labels: HEADING_LABELS,
			texts: texts.heading,
			metaExtra: `${config.steps} steps`
		},
		body: {
			key: "body",
			styleKey: "base",
			familyVariable: "--font-family-base",
			defaultFamily: "Plus Jakarta Sans",
			cogLabel: "Body Scale",
			tabLabel: "Body",
			labels: BODY_LABELS,
			texts: texts.body,
			metaExtra: ""
		},
		mono: {
			key: "mono",
			styleKey: "mono",
			familyVariable: "--font-family-mono",
			defaultFamily: "JetBrains Mono",
			cogLabel: "Mono Scale",
			tabLabel: "Mono",
			labels: MONO_LABELS,
			texts: texts.mono,
			metaExtra: ""
		}
	};

	const view = views[track];
	const family = read(values, view.familyVariable) || view.defaultFamily;
	const weightVariable = typography[view.styleKey]?.fontWeight ?? DEFAULT_WEIGHT[view.key];
	const lineHeightVariable =
		typography[view.styleKey]?.lineHeight ?? DEFAULT_LINE_HEIGHT[view.key];
	const weightName = tokenName(weightVariable, "--font-weight-");
	const lineHeightName = tokenName(lineHeightVariable, "--line-height-");

	/**
	 * The sample list for one track. Every panel renders its own track, so the sizes and
	 * styles come from that track's config and its own weight, line height, and letter
	 * spacing — never from whichever track the cog is currently editing.
	 */
	const trackSamples = (key: TrackKey): React.ReactNode => {
		const stepView = views[key];
		const stepConfig = configs[key];
		const stepWeight = typography[stepView.styleKey]?.fontWeight ?? DEFAULT_WEIGHT[key];
		const stepLineHeight =
			typography[stepView.styleKey]?.lineHeight ?? DEFAULT_LINE_HEIGHT[key];
		const stepLetterSpacing =
			typography[stepView.styleKey]?.letterSpacing ?? DEFAULT_LETTER_SPACING[key];
		const stepSizesList = stepSizes(stepConfig.base, stepConfig.ratio, stepConfig.steps);

		return stepSizesList.map((size, index) => (
			<div className="vz-sample" key={`${key}-${stepView.labels[index] ?? index}`}>
				<div className="vz-sample__meta">
					<div>{stepView.labels[index] ?? `step-${index}`}</div>
					<div>{`${(size / 16).toFixed(3)}rem`}</div>
				</div>
				<div
					className="vz-sample__body"
					style={{
						fontFamily: `var(${stepView.familyVariable})`,
						fontSize: `${size / 16}rem`,
						lineHeight: `var(${stepLineHeight})`,
						fontWeight: `var(${stepWeight})`,
						...(stepLetterSpacing ? { letterSpacing: `var(${stepLetterSpacing})` } : {})
					}}
				>
					<EditableText
						value={texts[key][index] ?? "Sample text"}
						onChange={(value) => setText(key, index, value)}
					/>
				</div>
			</div>
		));
	};

	return (
		<section id="typography" className="vz-section">
			<SectionHeader index="01" title="Typography" />
			<Tabs tabs={TRACKS} active={track} onChange={(key) => setTrack(key as TrackKey)} />
			<MetaRow
				cogLabel={view.cogLabel}
				summary={
					<>
						<span style={{ fontFamily: `var(${view.familyVariable})` }}>
							{primaryFamily(family)}
						</span>
						<span className="vz-meta__sep">·</span>
						<span>×{config.ratio}</span>
						{view.metaExtra ? (
							<>
								<span className="vz-meta__sep">·</span>
								<span>{view.metaExtra}</span>
							</>
						) : null}
						<span className="vz-meta__sep">·</span>
						<span>w {weightName}</span>
						<span className="vz-meta__sep">·</span>
						<span>lh {lineHeightName}</span>
					</>
				}
			>
				<div className="vz-family">
					<input
						className="vz-family__input"
						value={family}
						style={{ fontFamily: `var(${view.familyVariable})` }}
						spellCheck={false}
						aria-label="Font family"
						onChange={(event) => update(view.familyVariable, event.currentTarget.value)}
					/>
					<button
						type="button"
						className="vz-family__browse"
						onClick={() => setPicking(true)}
					>
						⋯
					</button>
				</div>
				<NumberField
					label="Base size (px)"
					value={config.base}
					min={8}
					max={32}
					onChange={(value) => setConfig({ base: value })}
				/>
				<NumberField
					label="Scale ratio"
					value={config.ratio}
					min={1.05}
					max={2}
					step={0.05}
					onChange={(value) => setConfig({ ratio: value })}
				/>
				<NumberField
					label="Steps"
					value={config.steps}
					min={2}
					max={track === "heading" ? 9 : 5}
					onChange={(value) => setConfig({ steps: Math.round(value) })}
				/>
				<TokenField
					label="Weight"
					token={weightVariable}
					tokens={WEIGHT_OPTIONS}
					value={resolvedNumber(values, weightVariable)}
					step={100}
					min={100}
					max={900}
					onTokenChange={(variable) =>
						updateTypography(view.styleKey, "fontWeight", variable)
					}
					onValueChange={(value) => update(weightVariable, String(value))}
				/>
				<TokenField
					label="Line height"
					token={lineHeightVariable}
					tokens={LINE_HEIGHT_OPTIONS}
					value={resolvedNumber(values, lineHeightVariable)}
					step={0.01}
					onTokenChange={(variable) =>
						updateTypography(view.styleKey, "lineHeight", variable)
					}
					onValueChange={(value) => update(lineHeightVariable, String(value))}
				/>
			</MetaRow>

			<div className="vz-panels">
				{TRACKS.map(({ key }) => (
					<TabPanel active={key === track} key={key}>
						{trackSamples(key)}
					</TabPanel>
				))}
			</div>

			{picking ? (
				<FontPicker
					value={family}
					onChange={(next) => update(view.familyVariable, next)}
					onClose={() => setPicking(false)}
				/>
			) : null}
		</section>
	);
};

/* ── Colors ──────────────────────────────────────────────────────────────── */

const COLOR_GROUPS: { label: string; items: { label: string; variable: string }[] }[] = [
	{
		label: "Brand",
		items: ["accent", "primary", "secondary", "tertiary"].map((name) => ({
			label: name,
			variable: `--color-brand-${name}`
		}))
	},
	{
		label: "Action",
		items: ["success", "info", "warning", "danger"].map((name) => ({
			label: name,
			variable: `--color-action-${name}`
		}))
	},
	{
		label: "Text",
		items: [
			{ label: "base", variable: "--color-text" },
			{ label: "accent", variable: "--color-text-accent" },
			{ label: "muted", variable: "--color-text-muted" },
			{ label: "ondark", variable: "--color-text-ondark" }
		]
	},
	{
		label: "Surface",
		items: [
			{ label: "base", variable: "--color-surface" },
			{ label: "alt", variable: "--color-surface-alt" },
			{ label: "dark", variable: "--color-surface-dark" },
			{ label: "card", variable: "--color-surface-card" }
		]
	}
];

const SURFACES = [
	{ label: "base", variable: "--color-surface", text: "--color-text" },
	{ label: "alt", variable: "--color-surface-alt", text: "--color-text" },
	{ label: "dark", variable: "--color-surface-dark", text: "--color-text-ondark" },
	{ label: "card", variable: "--color-surface-card", text: "--color-text" }
];

const Swatch: React.FC<{
	label: string;
	variable: string;
	value: string;
	onChange: (value: string) => void;
}> = ({ label, variable, value, onChange }) => (
	<label className="vz-swatch">
		<span className="vz-swatch__chip" style={{ background: `var(${variable})` }}>
			<input
				type="color"
				className="vz-swatch__picker"
				aria-label={label}
				value={/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) ? value : "#000000"}
				onChange={(event) => onChange(event.currentTarget.value)}
			/>
		</span>
		<span className="vz-swatch__name">{label}</span>
		<code className="vz-code">{variable}</code>
		<code className="vz-code">{value}</code>
	</label>
);

/**
 * Colors: Palette / Usage tabs.
 *
 * @returns The rendered element.
 */
export const ColorsSection: React.FC = () => {
	const { values, update } = useAppState();
	const [tab, setTab] = useState("palette");

	return (
		<section id="colors" className="vz-section">
			<SectionHeader index="02" title="Color" />
			<Tabs
				tabs={[
					{ key: "palette", label: "Palette" },
					{ key: "usage", label: "Usage" }
				]}
				active={tab}
				onChange={setTab}
			/>
			<div className="vz-panels">
				<TabPanel active={tab === "palette"}>
					{COLOR_GROUPS.map((group) => (
						<div className="vz-palette__group" key={group.label}>
							<span className="vz-label">{group.label}</span>
							<div className="vz-swatches">
								{group.items.map((item) => (
									<Swatch
										key={item.variable}
										label={item.label}
										variable={item.variable}
										value={read(values, item.variable)}
										onChange={(value) => update(item.variable, value)}
									/>
								))}
							</div>
						</div>
					))}
				</TabPanel>
				<TabPanel active={tab === "usage"}>
					<div className="vz-surfaces">
						{SURFACES.map((surface) => {
							const bg = resolved(values, surface.variable);
							const fg = resolved(values, surface.text);
							const ratio = hexContrastRatio(fg, bg);

							return (
								<div
									className="vz-surface"
									key={surface.variable}
									style={{ background: `var(${surface.variable})` }}
								>
									<div className="vz-surface__row">
										<span style={{ color: `var(${surface.text})` }}>
											{surface.label} — the quick brown fox
										</span>
										<span
											className="vz-contrast"
											data-level={contrastLevel(ratio)}
										>
											{ratio}:1
										</span>
									</div>
									<code className="vz-code">{surface.variable}</code>
								</div>
							);
						})}
					</div>
				</TabPanel>
			</div>
		</section>
	);
};

/* ── Spacing ─────────────────────────────────────────────────────────────── */

const SPACE_STEPS = ["xs", "sm", "md", "base", "lg", "xl", "xxl"].map((name) => ({
	variable: `--space-${name}`,
	label: name
}));

type SpaceMode = "linear" | "geometric";

/** The two ways the spacing scale can be generated. */
const SPACE_MODE_TABS = [
	{ key: "linear", label: "Linear" },
	{ key: "geometric", label: "Geometric" }
];

/**
 * Spacing: one scale cog, a gap ramp, and a square per size token.
 *
 * @returns The rendered element.
 */
export const SpacingSection: React.FC = () => {
	const { values, update } = useAppState();
	const [mode, setMode] = useState<SpaceMode>("linear");
	const [unit, setUnit] = useState(SPACE_UNIT_DEFAULT);
	const [seed, setSeed] = useState(SPACE_SEED_DEFAULT);
	const [multiplier, setMultiplier] = useState(SPACE_MULTIPLIER_DEFAULT);

	const generate = (): void => {
		const scale =
			mode === "linear"
				? linearSpacingScaleRem(unit)
				: geometricSpacingScaleRem(seed, multiplier);

		for (const [name, value] of Object.entries(scale)) {
			update(`--space-${name}`, value);
		}
	};

	return (
		<section id="spacing" className="vz-section">
			<SectionHeader index="03" title="Spacing" />
			<MetaRow
				cogLabel="Spacing Scale"
				summary={
					<span>
						{SPACE_STEPS.map((step) => read(values, step.variable)).join(" · ")}
					</span>
				}
			>
				<Tabs
					tabs={SPACE_MODE_TABS}
					active={mode}
					onChange={(key) => setMode(key as SpaceMode)}
				/>
				{mode === "linear" ? (
					<NumberField
						label="Unit (rem)"
						value={unit}
						min={0}
						step={0.0625}
						onChange={setUnit}
					/>
				) : (
					<div className="vz-field-pair">
						<NumberField
							label="Seed (rem)"
							value={seed}
							min={0}
							step={0.0625}
							onChange={setSeed}
						/>
						<NumberField
							label="Multiplier"
							value={multiplier}
							min={1.05}
							max={2}
							step={0.05}
							onChange={setMultiplier}
						/>
					</div>
				)}
				<Button label="Generate scale" size="sm" variant="secondary" onClick={generate} />
				{SPACE_STEPS.map((step) => (
					<NumberField
						key={step.variable}
						label={step.label}
						suffix="rem"
						min={0}
						step={0.0625}
						value={rem(values, step.variable)}
						onChange={(value) => update(step.variable, formatRem(value * 16))}
					/>
				))}
			</MetaRow>
			<div className="vz-preview" data-ds-preview>
				<div className="vz-space-preview">
					{SPACE_STEPS.map((step) => (
						<div
							key={step.variable}
							className="vz-space-square"
							title={step.label}
							style={{
								width: `var(${step.variable})`,
								height: `var(${step.variable})`
							}}
						/>
					))}
				</div>
				<div className="vz-space-ramp">
					{SPACE_STEPS.map((step) => (
						<div
							className="vz-space-ramp__box"
							key={step.variable}
							style={{ marginInlineEnd: `var(${step.variable})` }}
						/>
					))}
					{/* The closing box: seven steps make seven gaps between eight boxes. */}
					<div className="vz-space-ramp__box" />
				</div>
			</div>
		</section>
	);
};

/* ── Shapes ──────────────────────────────────────────────────────────────── */

const ROUNDED_STEPS = ["none", "sm", "md", "lg", "full"].map((name) => ({
	variable: `--rounded-${name}`,
	label: name
}));
/** Radius steps the contract fixes: sentinel values, so the editor never edits them. */
const FIXED_RADIUS_STEPS = new Set(["--rounded-none", "--rounded-full"]);
const BORDER_STEPS = ["sm", "md", "lg"].map((name) => ({
	variable: `--border-${name}`,
	label: name
}));
const ELEVATION_STEPS = ["sm", "md", "lg"].map((name) => ({
	variable: `--elevation-${name}`,
	label: name
}));

/** Border-width recipes: no stroke, and the 1-2-4 scale the contract documents. */
const BORDER_PRESETS: Record<string, string[]> = {
	none: ["0", "0", "0"],
	"1-2-4": ["1px", "2px", "4px"]
};

const ELEVATION_PRESETS: Record<string, string[]> = {
	flat: ["none", "none", "none"],
	paper: [
		"0 1px 2px rgb(0 0 0 / 6%)",
		"0 4px 12px rgb(0 0 0 / 10%)",
		"0 12px 32px rgb(0 0 0 / 16%)"
	],
	brutal: [
		"2px 2px 0 var(--color-text)",
		"4px 4px 0 var(--color-text)",
		"6px 6px 0 var(--color-text)"
	]
};

type ShapeTab = "radius" | "border" | "elevation";

/** The settings cog's title per Shapes tab. */
const SHAPE_COG_LABELS: Record<ShapeTab, string> = {
	radius: "Radius Steps",
	border: "Border Widths",
	elevation: "Elevation Levels"
};

/**
 * Shapes: Border radius, Border width, and Elevation tabs, with one settings cog per tab.
 *
 * @returns The rendered element.
 */
export const ShapesSection: React.FC = () => {
	const { values, update } = useAppState();
	const [tab, setTab] = useState<ShapeTab>("radius");

	const applyBorderPreset = (name: string): void => {
		const preset = BORDER_PRESETS[name];

		if (!preset) {
			return;
		}
		BORDER_STEPS.forEach((step, index) => {
			update(step.variable, preset[index] ?? "0");
		});
	};
	const applyElevationPreset = (name: string): void => {
		const preset = ELEVATION_PRESETS[name];

		if (!preset) {
			return;
		}
		ELEVATION_STEPS.forEach((step, index) => {
			update(step.variable, preset[index] ?? "none");
		});
	};

	return (
		<section id="shapes" className="vz-section">
			<SectionHeader index="04" title="Shapes" />
			<Tabs
				tabs={[
					{ key: "radius", label: "Border Radius" },
					{ key: "border", label: "Border Width" },
					{ key: "elevation", label: "Elevation" }
				]}
				active={tab}
				onChange={(key) => setTab(key as ShapeTab)}
			/>
			<MetaRow cogLabel={SHAPE_COG_LABELS[tab]}>
				{tab === "radius" ? (
					ROUNDED_STEPS.map((step) =>
						FIXED_RADIUS_STEPS.has(step.variable) ? (
							<FixedField
								key={step.variable}
								label={step.label}
								value={read(values, step.variable)}
							/>
						) : (
							<NumberField
								key={step.variable}
								label={step.label}
								suffix="rem"
								min={0}
								step={0.0625}
								value={rem(values, step.variable)}
								onChange={(value) => update(step.variable, formatRem(value * 16))}
							/>
						)
					)
				) : tab === "border" ? (
					<>
						{BORDER_STEPS.map((step) => (
							<NumberField
								key={step.variable}
								label={step.label}
								suffix="px"
								min={0}
								value={px(values, step.variable)}
								onChange={(value) => update(step.variable, `${value}px`)}
							/>
						))}
						<div className="vz-presets">
							{Object.keys(BORDER_PRESETS).map((name) => (
								<Button
									key={name}
									label={name}
									size="sm"
									variant="secondary"
									onClick={() => applyBorderPreset(name)}
								/>
							))}
						</div>
					</>
				) : (
					<>
						{ELEVATION_STEPS.map((step) => (
							<TextInput
								key={step.variable}
								label={step.label}
								value={read(values, step.variable)}
								onChange={(value) => update(step.variable, value)}
							/>
						))}
						<div className="vz-presets">
							{Object.keys(ELEVATION_PRESETS).map((name) => (
								<Button
									key={name}
									label={name}
									size="sm"
									variant="secondary"
									onClick={() => applyElevationPreset(name)}
								/>
							))}
						</div>
					</>
				)}
			</MetaRow>
			<div className="vz-panels">
				<TabPanel active={tab === "radius"}>
					<div className="vz-rounded">
						{ROUNDED_STEPS.map((step) => (
							<div className="vz-rounded__item" key={step.variable}>
								<div
									className="vz-rounded__tile"
									style={{ borderRadius: `var(${step.variable})` }}
								/>
								<span className="vz-swatch__name">{step.label}</span>
								<code className="vz-code">{read(values, step.variable)}</code>
							</div>
						))}
					</div>
				</TabPanel>
				<TabPanel active={tab === "border"}>
					<div className="vz-borders">
						{BORDER_STEPS.map((step) => (
							<div className="vz-border" key={step.variable}>
								<div
									className="vz-border__sample"
									style={{ borderWidth: `var(${step.variable})` }}
								/>
								<span className="vz-swatch__name">{step.label}</span>
								<code className="vz-code">{read(values, step.variable)}</code>
							</div>
						))}
					</div>
				</TabPanel>
				<TabPanel active={tab === "elevation"}>
					<div className="vz-elevations">
						{ELEVATION_STEPS.map((step) => (
							<div className="vz-elevation" key={step.variable}>
								<div
									className="vz-elevation__card"
									style={{ boxShadow: `var(${step.variable})` }}
								/>
								<code className="vz-code">{step.label}</code>
							</div>
						))}
					</div>
				</TabPanel>
			</div>
		</section>
	);
};

/* ── Components ──────────────────────────────────────────────────────────── */

/**
 * Components: Buttons / Containers / Cards tabs.
 *
 * @returns The rendered element.
 */
export const ComponentsSection: React.FC = () => {
	const [tab, setTab] = useState("buttons");
	const [field, setField] = useState("Design System");

	return (
		<section id="components" className="vz-section">
			<SectionHeader index="05" title="Components" />
			<Tabs
				tabs={[
					{ key: "buttons", label: "Buttons" },
					{ key: "containers", label: "Containers" },
					{ key: "cards", label: "Cards" }
				]}
				active={tab}
				onChange={setTab}
			/>
			<div className="vz-panels">
				<TabPanel active={tab === "buttons"}>
					<span className="vz-label">Variants</span>
					<div className="vz-row">
						<Button label="Primary" variant="primary" />
						<Button label="Accent" variant="accent" />
						<Button label="Secondary" variant="secondary" />
						<Button label="Ghost" variant="ghost" />
						<Button label="Success" variant="success" />
						<Button label="Warning" variant="warning" />
						<Button label="Danger" variant="danger" />
						<Button label="Info" variant="info" />
					</div>
					<span className="vz-label">Sizes</span>
					<div className="vz-row">
						<Button label="Small" size="sm" />
						<Button label="Default" />
						<Button label="Large" size="lg" />
					</div>
					<span className="vz-label">States</span>
					<div className="vz-row">
						<Button label="Default" />
						<Button label="Loading" loading />
						<Button label="Disabled" disabled />
					</div>
				</TabPanel>
				<TabPanel active={tab === "containers"}>
					<div className="vz-containers">
						<div className="vz-container">
							<Heading level={3} size="md">
								Container heading
							</Heading>
							<Text size="sm" tone="base">
								A text container establishes the reading column width, internal
								padding, and typographic rhythm. Good containers make content feel
								intentional and effortless to read.
							</Text>
							<Text size="xs" tone="muted">
								Design Systems · August 2026 · 4 min read
							</Text>
						</div>
						<div className="vz-container">
							<TextField
								id="vz-name"
								label="Project name"
								value={field}
								onChange={setField}
							/>
							<Button label="Save" variant="primary" />
						</div>
					</div>
				</TabPanel>
				<TabPanel active={tab === "cards"}>
					<div className="vz-cards">
						<div className="vz-card">
							<span className="vz-label">Article</span>
							<Heading level={3} size="md">
								The grid as structure
							</Heading>
							<Text size="sm">
								Invisible scaffolding that organizes every element into a coherent
								whole.
							</Text>
						</div>
						<div className="vz-card vz-card--alt">
							<span className="vz-label">Design tokens</span>
							<Heading level={3} size="xl" className="vz-stat">
								26
							</Heading>
							<Text size="sm">variables in the contract</Text>
						</div>
						<div className="vz-card vz-card--dark">
							<span className="vz-label">Spacing · Color · Type</span>
							<Heading level={3} size="md">
								Everything in its right place
							</Heading>
							<Text size="sm">
								A systematic approach keeps every decision intentional and every
								token purposeful.
							</Text>
						</div>
					</div>
				</TabPanel>
			</div>
		</section>
	);
};
