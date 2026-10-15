# Tools

Developer tooling that is not published. The published packages live in
[`../packages/`](../packages/README.md).

## `oxlint/code-quality.ts`

Two local oxlint rules that fill gaps in oxlint's built-in rule set. Oxlint implements
ESLint's plugin API, so the file is also a valid ESLint plugin. It is dependency-free.

- `require-exported-jsdoc` — every exported function must carry a complete JSDoc block: a
  description, one `@param` per parameter, and `@returns` when it returns a value.
- `padding-before-statements` — a blank line must precede `return`, `if`, and loop
  statements, except when they open a block.

`.oxlintrc.json` loads the file through `jsPlugins`. Two consequences follow:

- `tools/**` is in the linter's `ignorePatterns`, so oxlint does not lint the plugin
  itself.
- `tools` is in the root `tsconfig.json` `exclude`, so `bun run typecheck` does not check
  it. The plugin manipulates untyped ESLint AST nodes.

A rule that fits and covers most cases belongs upstream in oxlint. Add a rule here only for
a gap that oxlint leaves open. See the root `AGENTS.md` for the lint and format
commands.
