/**
 * Local Oxlint rules that fill gaps in Oxlint's native rule set.
 *
 * Oxlint implements ESLint's plugin API, so these rules are also valid
 * ESLint rules. They are intentionally dependency-free.
 *
 * - `require-exported-jsdoc`: every exported function must carry a complete
 *   JSDoc block (description, `@param` for each parameter, `@returns` when a
 *   value is returned).
 * - `padding-before-statements`: require a blank line before `return`, `if`,
 *   and loop statements, except when they open a block.
 */

const FUNCTION_TYPES = new Set([
	"FunctionDeclaration",
	"FunctionExpression",
	"ArrowFunctionExpression"
]);

const PADDED_TYPES = {
	ReturnStatement: "return",
	IfStatement: "if",
	ForStatement: "for",
	ForInStatement: "for",
	ForOfStatement: "for",
	WhileStatement: "while",
	DoWhileStatement: "while",
	SwitchStatement: "switch",
	TryStatement: "try"
};

const isFunction = (node) => node != null && FUNCTION_TYPES.has(node.type);

const returnedFromBody = (body) => {
	if (!body) return false;
	if (body.type !== "BlockStatement") return true;
	const stack = [body];
	while (stack.length > 0) {
		const node = stack.pop();
		if (!node || typeof node !== "object") continue;
		if (node.type === "ReturnStatement") {
			if (node.argument) return true;
			continue;
		}
		if (node !== body && isFunction(node)) continue;
		for (const key of Object.keys(node)) {
			if (
				key === "parent" ||
				key === "loc" ||
				key === "range" ||
				key === "tokens" ||
				key === "comments"
			)
				continue;
			const value = node[key];
			if (Array.isArray(value)) {
				for (const child of value) {
					if (child && typeof child === "object" && child.type) stack.push(child);
				}
			} else if (value && typeof value === "object" && value.type) {
				stack.push(value);
			}
		}
	}
	return false;
};

const parseJsdoc = (value) => {
	const lines = value
		.replace(/^\*/, "")
		.split("\n")
		.map((line) => line.replace(/^\s*\*\s?/, "").trim());
	const tagIndex = lines.findIndex((line) => line.startsWith("@"));
	const description = lines
		.slice(0, tagIndex === -1 ? lines.length : tagIndex)
		.join(" ")
		.trim();
	const tags = tagIndex === -1 ? [] : lines.slice(tagIndex);
	return {
		description,
		params: tags.filter((line) => /^@param\b/.test(line)).length,
		returns: tags.some((line) => /^@returns?\b/.test(line))
	};
};

const exportedTargets = (node) => {
	const targets = [];
	const declaration = node.declaration;
	if (!declaration) return targets;
	if (declaration.type === "FunctionDeclaration") {
		targets.push(declaration);
	} else if (declaration.type === "VariableDeclaration") {
		for (const declarator of declaration.declarations) {
			if (isFunction(declarator.init)) targets.push(declarator.init);
		}
	} else if (isFunction(declaration)) {
		targets.push(declaration);
	}
	return targets;
};

const requireExportedJsdoc = {
	meta: {
		type: "suggestion",
		docs: {
			description: "Require a complete JSDoc block on exported functions"
		},
		messages: {
			missing: "Exported function must have a JSDoc block.",
			description: "JSDoc block must start with a description.",
			param: "JSDoc block must document every parameter with @param.",
			returns: "JSDoc block must document the returned value with @returns."
		},
		schema: []
	},
	create(context) {
		const sourceCode = context.sourceCode ?? context.getSourceCode();
		const check = (exportNode, fn) => {
			const comments = sourceCode.getCommentsBefore(exportNode);
			const jsdoc = [...comments]
				.reverse()
				.find((comment) => comment.type === "Block" && comment.value.startsWith("*"));
			if (!jsdoc) {
				context.report({
					node: exportNode,
					messageId: "missing"
				});
				return;
			}
			const parsed = parseJsdoc(jsdoc.value);
			if (!parsed.description) {
				context.report({ node: jsdoc, messageId: "description" });
			}
			if (fn.params.length > parsed.params) {
				context.report({ node: jsdoc, messageId: "param" });
			}
			if (returnedFromBody(fn.body) && !parsed.returns) {
				context.report({ node: jsdoc, messageId: "returns" });
			}
		};
		const visit = (node) => {
			for (const fn of exportedTargets(node)) check(node, fn);
		};
		return {
			ExportNamedDeclaration: visit,
			ExportDefaultDeclaration: visit
		};
	}
};

const paddingBeforeStatements = {
	meta: {
		type: "layout",
		fixable: "whitespace",
		docs: {
			description: "Require a blank line before control-flow statements"
		},
		messages: {
			padding: "Expected a blank line before this {{name}} statement."
		},
		schema: []
	},
	create(context) {
		const sourceCode = context.sourceCode ?? context.getSourceCode();
		const check = (node) => {
			const parent = node.parent;
			if (!parent) return;
			const list = parent.type === "SwitchCase" ? parent.consequent : parent.body;
			if (!Array.isArray(list)) return;
			const index = list.indexOf(node);
			if (index <= 0) return;
			if (
				node.type === "IfStatement" &&
				parent.type === "IfStatement" &&
				parent.alternate === node
			)
				return;
			const previous = list[index - 1];
			if (!previous) return;
			const leading = sourceCode
				.getCommentsBefore(node)
				.filter((comment) => comment.loc.start.line > previous.loc.end.line);
			const anchor = leading.length > 0 ? leading[0] : node;
			if (anchor.loc.start.line - previous.loc.end.line > 1) return;
			context.report({
				node,
				messageId: "padding",
				data: { name: PADDED_TYPES[node.type] },
				fix: (fixer) => {
					const text = sourceCode.text;
					const lineStart = text.lastIndexOf("\n", anchor.range[0] - 1) + 1;
					return fixer.insertTextBeforeRange([lineStart, lineStart], "\n");
				}
			});
		};
		const visitors = {};
		for (const type of Object.keys(PADDED_TYPES)) visitors[type] = check;
		return visitors;
	}
};

export default {
	meta: { name: "code-quality" },
	rules: {
		"require-exported-jsdoc": requireExportedJsdoc,
		"padding-before-statements": paddingBeforeStatements
	}
};
