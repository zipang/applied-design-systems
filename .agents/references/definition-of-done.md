# Definition of Done

The standing bar every task clears before it counts as done. Acceptance criteria are
per task; this file is project-wide. It is referenced by the
`planning-and-task-breakdown` skill.

## Every task

- The change matches the acceptance criteria of its Ticket (`roadmap/TXXXX/plan.md`).
- `bun run lint` passes.
- `bun run typecheck` passes when JavaScript or TypeScript is touched.
- `bun test` passes when behavior is touched.
- Any documentation the change invalidates is updated in the same commit.
- The working tree is focused: only the files the change concerns are staged.

## Design System changes

- `DESIGN.md` front matter and `design-tokens.css` hold identical values.
- No undocumented token is added.
- The validation rules in `skills/design-system-tokens/SKILL.md` section 10 are
  satisfied.

## Docs-only changes

- The `technical-writing` skill and the `README.md` glossary are applied.
- No rule is restated in two places; link to the canonical source instead.

## Commits

- Conventional commit with the emoji from the `git-commit` skill, imperative mood,
  first line under 72 characters.
