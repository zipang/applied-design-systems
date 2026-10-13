import { IssuesPanel } from "@components/editor/IssuesPanel";
import { LoadThemeDialog } from "@components/editor/LoadThemeDialog";
import { ThemeLibrary } from "@components/editor/ThemeLibrary";
import { TokenReference } from "@components/editor/TokenReference";
import { Toolbar } from "@components/editor/Toolbar";
import {
	ColorsSection,
	ComponentsSection,
	ShapesSection,
	SpacingSection,
	TypographySection
} from "@components/preview/Preview";
import { Pill } from "@components/ui/Pill";
import { useAppState } from "@lib/app-state";
import { previewStylesheet } from "@lib/apply-preview";
import { clsx } from "@lib/clsx";
import type * as React from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import "./App.css";

const SECTIONS = [
	{ id: "typography", label: "Type" },
	{ id: "colors", label: "Color" },
	{ id: "spacing", label: "Spacing" },
	{ id: "shapes", label: "Shapes" },
	{ id: "components", label: "Components" }
];

/**
 * The theme editor shell. Edits the Design System contract, previews it in a scoped
 * subtree (so the tool's chrome keeps its own tokens), and saves it through the API.
 * The theme and host state live in {@link useAppState}; sections read them directly.
 */
export const App: React.FC = () => {
	const { values, saveDialogOpen, loadDialogOpen } = useAppState();
	const [active, setActive] = useState("typography");
	const [showReference, setShowReference] = useState(false);
	const previewCss = previewStylesheet(values);

	// The scoped preview stylesheet is injected into <head>, never rendered inline.
	useLayoutEffect(() => {
		const elt = document.createElement("style");
		elt.dataset.dsPreviewStyle = "true";
		document.head.append(elt);
		return () => {
			elt.remove();
		};
	}, []);

	useEffect(() => {
		const elt = document.querySelector<HTMLStyleElement>("style[data-ds-preview-style]");
		if (elt) elt.textContent = previewCss;
	}, [previewCss]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible[0]) setActive(visible[0].target.id);
			},
			{ threshold: 0.2 }
		);
		for (const section of SECTIONS) {
			const elt = document.getElementById(section.id);
			if (elt) observer.observe(elt);
		}
		return () => observer.disconnect();
	}, []);

	return (
		<div className="app">
			<Toolbar onShowReference={() => setShowReference(true)} />
			<nav className="app__nav" aria-label="Sections">
				{SECTIONS.map((section) => (
					<button
						key={section.id}
						type="button"
						className={clsx("app__nav-item", { "is-active": active === section.id })}
						onClick={() =>
							document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" })
						}
					>
						<Pill
							tone={active === section.id ? "accent" : "neutral"}
							active={active === section.id}
						/>
						<span className="app__nav-label">{section.label}</span>
					</button>
				))}
			</nav>
			<main className="app__container">
				<IssuesPanel onShowReference={() => setShowReference(true)} />
				<TypographySection />
				<ColorsSection />
				<SpacingSection />
				<ShapesSection />
				<ComponentsSection />
			</main>
			<footer className="app__footer">
				<span>Click a swatch to edit · every value consumes a design token</span>
				<button
					type="button"
					className="app__top"
					onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
				>
					Back to top
				</button>
			</footer>
			{showReference ? <TokenReference onClose={() => setShowReference(false)} /> : null}
			{saveDialogOpen ? <ThemeLibrary /> : null}
			{loadDialogOpen ? <LoadThemeDialog /> : null}
		</div>
	);
};
