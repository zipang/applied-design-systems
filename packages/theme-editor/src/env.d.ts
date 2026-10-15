/** CSS imported with `with { type: "text" }` yields its source as a string. */
declare module "*.css" {
	const content: string;
	export default content;
}

/** SVG files imported with `with { type: "text" }` yield their markup as a string. */
declare module "*.svg" {
	const content: string;
	export default content;
}

/** Markdown files imported with `with { type: "text" }` yield their source as a string. */
declare module "*.md" {
	const content: string;
	export default content;
}
