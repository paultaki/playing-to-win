# Contributing

Thanks for considering a contribution. This skill is opinionated by design,
but improvements that sharpen the cascade, fix bugs in the trigger logic, or
expand the reference banks are welcome.

## What's in scope

- **Bug fixes** to the SKILL.md instructions (a section that does not render
  cleanly, a missing edge case, a broken reference link).
- **New examples** added to `references/strategy_example_bank.md` —
  particularly weak-to-sharpened pairs that calibrate the model.
- **New assumption tests** in `references/assumption_test_bank.md`.
- **New positioning patterns** in `references/positioning_patterns.md`.
- **New evals** in `evals/evals.json` that catch regressions or improve
  trigger reliability.
- **README improvements** — clearer install paths, better examples,
  platform-specific notes (Codex, Cursor, etc.).

## What's out of scope

- Rewrites of the core 12-section output contract. That contract is the
  product. Propose those as an issue first.
- Changes that soften the verdict language (Proceed / Narrow / Test /
  Park / Kill). The bluntness is the point.
- New frameworks bundled into this skill. Build a separate skill instead.
- Anything that violates the Martin/Lafley attribution requirements in
  `THIRD_PARTY_NOTICES.md`.

## Voice rules

- **No em dashes.** Use commas, semicolons, colons, or periods.
- **Imperative form.** Verb-first instructions. ("Read the README" not
  "You should read the README.")
- **No fake encouragement.** No "great point!", no "excellent idea!".
- **Specific over vague.** Numbers, names, dates, or concrete examples.

## Process

1. Open an issue first if the change is non-trivial. Describe the problem
   and the proposed fix.
2. Fork the repo.
3. Make the change. Run the evals locally if you have access to Claude Code:
   ```bash
   # Place the modified skill in your skills directory
   cp -r playing-to-win ~/.claude/skills/
   # Then in Claude Code, try each prompt in evals/evals.json
   # and confirm the skill triggers and produces the expected sections.
   ```
4. Update `CHANGELOG.md` under an `[Unreleased]` section.
5. Open a pull request with a tight description: what changed, why, what
   you tested.

## Releases

This project uses [Semantic Versioning](https://semver.org/):

- **MAJOR** — breaking changes to the SKILL.md contract (rare).
- **MINOR** — new sections, new references, new features (Step 6 etc.).
- **PATCH** — bug fixes, typo corrections, reference improvements.

Releases are tagged in git (e.g. `v1.1.0`) and noted in `CHANGELOG.md`.

## License

By submitting a contribution, you agree that your contribution is licensed
under the same MIT License that covers the rest of the project. See
[LICENSE](LICENSE).
