# Playing to Win — Claude Skill

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](CHANGELOG.md)
[![Built for Claude Code](https://img.shields.io/badge/built%20for-Claude%20Code-orange.svg)](https://claude.com/code)

A Claude Code skill that pressure-tests a business idea, offer, or product
strategy through Roger Martin and A.G. Lafley's Playing to Win choice
cascade. Operator-built. Free. No teaching — direct application.

---

## What it does

When invoked, this skill:

1. **Frames the subject** — raw idea, existing offer, project codebase, or
   market move.
2. **Discovers context** — if invoked inside a codebase, reads the README,
   package files, marketing copy, pricing config, and analytics to extract
   current customer, positioning, and capabilities.
3. **Runs market research** — uses available web tools (Firecrawl, Exa,
   WebSearch) to find competitors, pricing, and category language. Labels
   every claim as FACT, INFERENCE, ASSUMPTION, or SPECULATION.
4. **Applies the cascade** — produces a 12-section Standard Output across
   four phases:
   - **Phase I — Diagnosis:** Snapshot, Executive Verdict
   - **Phase II — The Cascade:** Winning Aspiration ①, Where to Play ②,
     How to Win ③, Required Capabilities ④, Management Systems ⑤
   - **Phase III — Stress Test:** What Must Be True, Red-Team Pre-Mortem
   - **Phase IV — Verdict:** Sharpened Version, 30-Day Validation Plan,
     Presentation-Ready Summary, Recommendation
5. **Writes a strategy file** to `./strategy/playing-to-win-{slug}-{date}.md`
   with YAML frontmatter so the output persists beyond the conversation.
6. **Ends with a single verdict:** Proceed, Narrow, Test manually, Park,
   or Kill.

See [`examples/example-output.md`](examples/example-output.md) for a full
sample run on a real-shape idea.

---

## Install

### Claude Code (user-level — recommended)

```bash
git clone https://github.com/paultaki/playing-to-win.git
mkdir -p ~/.claude/skills
cp -r playing-to-win ~/.claude/skills/
```

Restart your Claude Code session. Then invoke from any project:

```
> Build me a Playing to Win framework around my new offer.
```

### Claude Code (project-level)

```bash
git clone https://github.com/paultaki/playing-to-win.git
mkdir -p ./.claude/skills
cp -r playing-to-win ./.claude/skills/
```

The skill is now scoped to this repository only.

### Codex

```bash
git clone https://github.com/paultaki/playing-to-win.git
mkdir -p ~/.agents/skills
cp -r playing-to-win ~/.agents/skills/
```

### Claude.ai (web)

Upload the folder as a custom skill via the Skills panel in your settings.
See [Anthropic's guide](https://support.claude.com/en/articles/12512180-using-skills-in-claude#h_a4222fa77b)
for the current upload flow.

### Claude API

Use the [Skills API Quickstart](https://docs.claude.com/en/api/skills-guide#creating-a-skill)
to register the skill folder against your API workspace.

---

## Use it

Inside any project or conversation, say things like:

- "Build me a Playing to Win framework around this project"
- "Pressure-test this idea: [your idea]"
- "Red-team this strategy"
- "Where should we play with [offer]?"
- "P2W cascade for [X]"
- "Should I proceed with [X]?"

The skill will not trigger on generic business advice or motivational
coaching prompts. The trigger phrases are deliberately specific.

---

## Convert the output to other formats

The strategy file is canonical Markdown. Convert via pandoc
([install once](https://pandoc.org/installing.html)):

```bash
# Word
pandoc ./strategy/playing-to-win-<slug>-<date>.md -o strategy.docx

# PDF (requires LaTeX or wkhtmltopdf)
pandoc ./strategy/playing-to-win-<slug>-<date>.md -o strategy.pdf

# HTML
pandoc ./strategy/playing-to-win-<slug>-<date>.md -o strategy.html --standalone
```

---

## Repository structure

```
playing-to-win/
├── SKILL.md                              # Skill contract (loaded by Claude)
├── README.md                             # This file
├── LICENSE                               # MIT
├── CHANGELOG.md                          # Versioned release notes
├── CONTRIBUTING.md                       # How to propose changes
├── THIRD_PARTY_NOTICES.md                # Martin/Lafley attribution
├── .gitignore
├── evals/
│   └── evals.json                        # Anthropic-format trigger tests
├── examples/
│   └── example-output.md                 # Full sample strategy output
└── references/
    ├── strategy_quality_rubric.md        # Verdict scale, quality gates
    ├── strategy_example_bank.md          # Weak / strong / sharpened pairs
    ├── assumption_test_bank.md           # Practical tests by type
    ├── positioning_patterns.md           # Strong / weak positioning
    ├── strategy_preferences.md           # Tone and style calibration
    └── execution_patterns.md             # Rollout and adoption patterns
```

---

## Voice rules

This skill enforces a specific voice on its output:

- Direct, skeptical, practical. Operator language.
- No em dashes (commas, semicolons, colons, periods only).
- No motivational filler. No "great idea!", no "amazing potential!".
- Imperative form throughout.
- Specific numbers, names, and dates over vague descriptions.
- Every non-trivial claim labeled FACT, INFERENCE, ASSUMPTION, or
  SPECULATION.

---

## Why this skill exists

Playing to Win was rolled out across twelve teams during the author's
twenty years at Verizon. All twelve hit their goals. It is the only
strategy framework worth running on a Tuesday morning when you need
a real verdict by Wednesday.

The problem with most strategy work is that it lives in slides. You write
a deck, present it, and three months later nobody can remember the
choices it asked you to make. This skill turns the cascade into a
callable function and a written artifact.

---

## Attribution

Playing to Win is the strategy framework developed by Roger L. Martin and
A.G. Lafley, documented in *Playing to Win: How Strategy Really Works*
(Harvard Business Review Press, 2013). This skill applies their cascade.
It does not replace the book. Read the original for the underlying theory.

See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) for full attribution.

---

## License

[MIT](LICENSE). Use freely. Adapt and improve. Pull requests welcome.
See [CONTRIBUTING.md](CONTRIBUTING.md) for what's in scope.

---

## Author

Built by [Paul Takisaki](https://www.paultakisaki.com). Former Fortune 50
operator turned strategic AI advisor. More skills and field notes at
[paultakisaki.com/skills](https://www.paultakisaki.com/skills/) and
[paultakisaki.com/insights](https://www.paultakisaki.com/insights/).
