import { describe, expect, test } from "bun:test";
import { parseContract } from "./contract";
import { validateContract } from "./validate";

const readTheme = async (name: string): Promise<string> =>
	Bun.file(new URL(`../../${name}`, import.meta.url)).text();

const contract = await parseContract(
	await readTheme("DESIGN.md"),
	await readTheme("design-tokens.css")
);

describe("validateContract", () => {
	test("accepts the tool's own contract", () => {
		expect(validateContract(contract)).toEqual([]);
	});

	test("flags a missing token", () => {
		const cssValues = { ...contract.cssValues };
		delete cssValues["--space-md"];
		const issues = validateContract({ ...contract, cssValues });
		expect(
			issues.some((issue) => issue.code === "missing-token" && issue.target === "--space-md")
		).toBe(true);
	});

	test("flags an undocumented token", () => {
		const issues = validateContract({
			...contract,
			cssValues: { ...contract.cssValues, "--color-brand-extra": "#123456" }
		});
		expect(issues.some((issue) => issue.code === "undocumented-token")).toBe(true);
	});

	test("flags a front-matter / stylesheet mismatch", () => {
		const issues = validateContract({
			...contract,
			designValues: { ...contract.designValues, "--color-brand-accent": "#00ff00" }
		});
		expect(issues.some((issue) => issue.code === "value-mismatch")).toBe(true);
	});

	test("flags a wrong optional fallback", () => {
		const issues = validateContract({
			tokensCss: contract.tokensCss,
			designValues: {},
			declaredPaths: new Set<string>(),
			unknownPaths: [],
			cssValues: { ...contract.cssValues, "--color-surface-card": "#123456" }
		});
		expect(issues.some((issue) => issue.code === "optional-fallback")).toBe(true);
	});

	test("flags an undocumented front-matter path", () => {
		const issues = validateContract({ ...contract, unknownPaths: ["colors.brand.hologram"] });
		expect(issues.some((issue) => issue.code === "undocumented-path")).toBe(true);
	});

	test("flags a hosted web font with no stylesheet import", () => {
		const issues = validateContract({
			...contract,
			tokensCss: contract.tokensCss.replace(/^\s*@import[^\n]*\n?/m, "")
		});
		expect(
			issues.some(
				(issue) => issue.code === "missing-font-import" && issue.target === "--font-family-base"
			)
		).toBe(true);
	});

	test("accepts hosted web fonts when the stylesheet imports them", () => {
		expect(contract.tokensCss).toContain("@import");
		expect(validateContract(contract).some((issue) => issue.code === "missing-font-import")).toBe(
			false
		);
	});

	test("accepts a system-only theme with no import", () => {
		const issues = validateContract({
			...contract,
			tokensCss: ":root { --font-family-base: Georgia, serif; }",
			cssValues: {
				...contract.cssValues,
				"--font-family-base": "Georgia, serif",
				"--font-family-display": "Georgia, serif",
				"--font-family-mono": "Courier New, monospace"
			}
		});
		expect(issues.some((issue) => issue.code === "missing-font-import")).toBe(false);
	});

	test("flags a missing contrast token", () => {
		const cssValues = { ...contract.cssValues };
		delete cssValues["--color-on-primary"];
		const issues = validateContract({ ...contract, cssValues });
		expect(
			issues.some(
				(issue) => issue.code === "missing-token" && issue.target === "--color-on-primary"
			)
		).toBe(true);
	});

	test("flags a stale contrast token", () => {
		const issues = validateContract({
			...contract,
			cssValues: { ...contract.cssValues, "--color-on-primary": "#123456" }
		});
		expect(
			issues.some(
				(issue) => issue.code === "contrast-mismatch" && issue.target === "--color-on-primary"
			)
		).toBe(true);
	});

	test("flags a base text/surface pair below AA", () => {
		const issues = validateContract({
			...contract,
			cssValues: { ...contract.cssValues, "--color-surface": "#111111" }
		});
		expect(issues.some((issue) => issue.code === "text-surface-contrast")).toBe(true);
	});
});
