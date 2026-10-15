# @applied-design-systems/design-tokens

The pure core behind the Applied Design Systems dual-file contract. It holds the fixed token
registry and parses and serializes `DESIGN.md` + `design-tokens.css`. It also validates the
pair against the skill's section 10 rules and derives the `--color-on-*` contrast tokens with
WCAG 2.1.

The package imports no React, no DOM, and no filesystem. It runs wherever Bun runs.

## Install

```sh
bun add @applied-design-systems/design-tokens
```

## Use

```ts
import {
	parseContract,
	updateThemeContrastTokens,
	validateContract
} from "@applied-design-systems/design-tokens";

const contract = parseContract(designMd, tokensCss);
const issues = validateContract(contract);
const withContrast = updateThemeContrastTokens(contract.cssValues);
```

## Public API

- **Token registry** — `TOKENS`, `tokenByVariable`, `tokenByPath`, `groupTokens`,
  `TokenValues`, `TokenDef`, and the group/kind types.
- **Contract** — `parseDesignMd`, `parseTokensCss`, `parseContract`, `serializeDesignMd`,
  `serializeTokensCss`, `Contract`, `ParsedDesignMd`.
- **Validation** — `validateContract`, `Issue`, `ValidationInput`.
- **Contrast** — `parseHex`, `contrastRatio`, `relativeLuminance`, `updateThemeContrastTokens`,
  `CONTRAST_TOKENS`, and `AA_NORMAL`. The hex-string helpers are exported as
  `hexContrastRatio` / `hexRelativeLuminance` because the Rgb pair owns the plain names.
- **Type scale and spacing** — `typeScaleRem`, `linearSpacingScaleRem`,
  `geometricSpacingScaleRem`.
- **Fonts** — the catalog and the `fontStackFamilies`, `googleFontName`, `googleFontImport`
  helpers.

Run `bun test` from this directory for the suite.

## Publish

The publish order and the npm scope prerequisite are in `packages/README.md`. This package is
published before the Theme Editor, and both share one version.
