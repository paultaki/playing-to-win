# Changelog

All notable changes to the Playing to Win Claude Skill are documented in this
file. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

Nothing yet.

## [1.0.0] — 2026-05-14

Initial public release.

### Skill contract

- **Twelve-section Standard Output** grouped into four phases (Diagnosis,
  Cascade, Stress Test, Verdict), produced from a single user prompt.
- **Five-question P2W cascade** applied directly to a business idea, offer,
  market move, or running product. Refuses to teach the framework — applies
  it.
- **Quality Gate** that blocks output unless all eight discipline checks
  pass: real choices, Where Not to Play defined, specific advantage,
  alternatives named, FACTS separated from ASSUMPTIONS, biggest risk named,
  30-day test included, final verdict committed.
- **Evidence labels** on every non-trivial claim:
  `[FACT]` / `[INFERENCE]` / `[ASSUMPTION]` / `[SPECULATION]`.
- **Final verdict required**: PROCEED · NARROW · TEST MANUALLY · PARK · KILL.

### Visual format

- **Cascade waterfall** in Phase I Snapshot. Each cascade question renders
  as an outlined box with bi-directional connectors (▲│▼) between adjacent
  pairs, signaling that the cascade is iterative. *What Must Be True* sits
  as a parallel column on the right.
- **Mermaid flowchart** rendered immediately below the ASCII waterfall.
  Renders as polished SVG in GitHub, Obsidian, VS Code preview, and other
  modern Markdown viewers.
- **Editorial phase headers** at each phase boundary with a heavy ━ rule,
  phase label, and locked one-line framer text.
- **Banner callouts** with single ━ rule for Executive Verdict and each
  cascade question (① through ⑤).
- **Double-line recommendation banner** (╔╗╚╝) for the final verdict so it
  lands as the visual climax.
- **Bold kicker labels** above every table for visual context.
- **Standardized bullet glyphs**: `•` for content bullets in editorial
  callouts, `▸` for highlight or conclusion pointers.

### Persistent artifacts

- **Strategy file written** to `./strategy/playing-to-win-{slug}-{date}.md`
  with YAML frontmatter (subject, verdict, confidence, date, generated_by).
  The path is reported as the final line of every run.
- **Document conversion** via pandoc one-liners documented in SKILL.md and
  README — Word, PDF, or HTML from the same Markdown source.

### Repository scaffolding

- `LICENSE` — MIT.
- `THIRD_PARTY_NOTICES.md` — full attribution to Roger L. Martin and
  A.G. Lafley's *Playing to Win: How Strategy Really Works*.
- `CONTRIBUTING.md` — contribution scope, voice rules, release process.
- `evals/evals.json` — 8 trigger test prompts including 1 negative test.
- `examples/example-output.md` — full sample strategy run.
- `references/` — six on-demand reference files for quality rubric,
  example bank, assumption tests, positioning patterns, output style,
  and execution patterns.

[Unreleased]: https://github.com/paultaki/playing-to-win/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/paultaki/playing-to-win/releases/tag/v1.0.0
