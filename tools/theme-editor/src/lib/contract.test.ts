import { describe, expect, test } from "bun:test";
import {
	mergeValues,
	normalizeValue,
	parseContract,
	parseDesignMd,
	parseTokensCss,
	scopeTokensCss,
	serializeDesignMd,
	serializeTokensCss
} from "./contract";
import { TOKENS, tokenByVariable } from "./design-system";

const readTheme = async (name: string): Promise<string> =>
	Bun.file(new URL(`../../${name}`, import.meta.url)).text();

describe("contract parsing", () => {
	test("round-trips the tool's own theme", async () => {
		const designMd = await readTheme("DESIGN.md");
		const tokensCss = await readTheme("design-tokens.css");
		const contract = parseContract(designMd, tokensCss);

		for (const token of TOKENS) {
			if (token.required) expect(contract.cssValues[token.variable]).toBeDefined();
		}
		expect(contract.unknownPaths).toEqual([]);
		expect(contract.designValues["--color-brand-accent"]).toBe("#2d2dff");
	});

	test("parses and writes typography style references", () => {
		const designMd =
			'---\ntypography:\n  base:\n    fontWeight: "var(--font-weight-regular)"\n    lineHeight: "var(--line-height-regular)"\n  display:\n    fontWeight: "var(--font-weight-bold)"\n---\n';
		const parsed = parseDesignMd(designMd);
		expect(parsed.typography.base?.fontWeight).toBe("--font-weight-regular");
		expect(parsed.typography.display?.fontWeight).toBe("--font-weight-bold");

		const next = serializeDesignMd({}, designMd, {
			base: { fontWeight: "--font-weight-bold", lineHeight: "--line-height-tight" }
		});
		const reparsed = parseDesignMd(next);
		expect(reparsed.typography.base?.fontWeight).toBe("--font-weight-bold");
		expect(reparsed.typography.base?.lineHeight).toBe("--line-height-tight");
		expect(reparsed.typography.display?.fontWeight).toBe("--font-weight-bold");
	});

	test("serializeTokensCss then parseTokensCss is value-stable", async () => {
		const tokensCss = await readTheme("design-tokens.css");
		const values = parseTokensCss(tokensCss);
		const reparsed = parseTokensCss(serializeTokensCss(values));
		expect(reparsed).toEqual(values);
	});

	test("serializeTokensCss imports the theme's Google fonts", async () => {
		const values = parseTokensCss(await readTheme("design-tokens.css"));
		const css = serializeTokensCss(values);
		expect(css.startsWith('@import url("https://fonts.googleapis.com/css2?')).toBe(true);
		expect(css).toContain("family=Plus+Jakarta+Sans");
		expect(css).toContain("family=DM+Serif+Display");
		expect(css).toContain("family=JetBrains+Mono");
	});

	test("serializeTokensCss omits the import for a system-only theme", async () => {
		const values = {
			...parseTokensCss(await readTheme("design-tokens.css")),
			"--font-family-base": "Georgia, serif",
			"--font-family-display": "Georgia, serif",
			"--font-family-mono": "Courier New, monospace"
		};
		const css = serializeTokensCss(values);
		expect(css.startsWith("@import")).toBe(false);
		expect(css.startsWith(":root {")).toBe(true);
	});

	test("serializeDesignMd then parseDesignMd keeps declared values", async () => {
		const designMd = await readTheme("DESIGN.md");
		const contract = parseContract(designMd, await readTheme("design-tokens.css"));
		const next = parseDesignMd(serializeDesignMd(mergeValues(contract), designMd));

		for (const [variable, value] of Object.entries(contract.designValues)) {
			const token = tokenByVariable(variable);
			const omittedOptional =
				token &&
				!token.required &&
				token.fallback !== undefined &&
				normalizeValue(value) === normalizeValue(token.fallback);
			if (omittedOptional) continue;
			expect(next.values[variable]).toBe(value);
		}
	});

	test("optional tokens equal to their fallback are omitted from the front matter", async () => {
		const designMd = await readTheme("DESIGN.md");
		const contract = parseContract(designMd, await readTheme("design-tokens.css"));
		const merged = mergeValues({ ...contract, designValues: {} });
		merged["--color-surface-card"] = "var(--color-surface)";
		const next = parseDesignMd(serializeDesignMd(merged, designMd));
		expect(next.declaredPaths.has("colors.surface.card")).toBe(false);
	});

	test("scopeTokensCss rewrites the root selector", () => {
		expect(scopeTokensCss(":root {\n\t--x: 1;\n}", "[data-ds-preview]")).toBe(
			"[data-ds-preview] {\n\t--x: 1;\n}"
		);
	});
});
