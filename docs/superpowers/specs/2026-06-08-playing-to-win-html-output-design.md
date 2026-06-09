# Design Spec — HTML Strategy Page for Playing to Win

- **Date:** 2026-06-08
- **Skill:** `playing-to-win` (public, MIT, currently v1.0.0)
- **Status:** Approved design, ready for implementation planning
- **Author:** Paul Takisaki (design decisions captured via brainstorming session)

---

## 1. Problem & Goal

The skill currently renders its full 12-section, four-phase strategy output as
Unicode box-art in the terminal **and** writes a markdown file. The terminal dump
is long and hard to navigate, and it undersells the quality of the analysis.

**Goal:** When a Plan to Win strategy is produced, deliver it as a **self-contained,
interactive, agency-quality HTML page** instead of a terminal dump. The page must be
easy to navigate, visually premium, and carry a signature cascade interaction unique
to this framework.

**Non-goal:** Changing the *content* logic of the cascade (rubric, example bank,
evidence rules, verdict scale). This is a presentation/output change only.

---

## 2. Approved Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Visual direction | **Swiss / International** | Stark white, hard grid, neo-grotesk type, oversized numerals, one signal-red accent. The framework is about forcing hard exclusive choices; Swiss is the visual language of rigor and decisiveness. |
| Cascade behavior | **Interactive Map** | Click a node to expand its detail in place; selecting a choice cross-highlights its related "What Must Be True" assumptions. Reframes the artifact from a document into a tool. |
| Navigation | **Left Phase Rail** | Sticky vertical rail: 4 phases, 12 sections nested, thin red progress fill, active-section highlight, click-to-jump. Makes a long dossier feel short. |
| Rendering | **Locked template + content injection** | Design authored once and shipped in-repo; runtime only injects content. Consistent, low-token, no runtime dependency. |
| Markdown file | **Keep both** | HTML is the interactive deliverable; markdown stays canonical, printable, pandoc-convertible, git-diffable. |
| Branding | **Neutral + subtle credit** | Brand-neutral Swiss design anyone can adopt; small footer credit/link. Best for open-source adoption. |
| Auto-open | **Yes** | Run OS `open` after writing; fall back to printing the path. |

---

## 3. Behavior Change

**Before:** terminal prints all 12 sections (Unicode art) + writes `.md`.

**After:**
1. **Terminal → briefing only.** Verdict + confidence, strongest / weakest / biggest-risk /
   fastest-improvement, the first 30-day move, and clickable paths to both files.
   No full-section dump.
2. **HTML page** = the full interactive artifact (Swiss · Interactive · Left Rail).
3. **Markdown file** = unchanged from today (same editorial format), kept as canonical source.

The existing Unicode editorial format is **retained in the markdown file**. It is simply
no longer dumped to the terminal. This keeps the change additive and low-risk.

---

## 4. Architecture

```
references/strategy-template.html        (shipped once: Swiss CSS + enhancement JS + markers)
        │
        │   runtime: Claude generates the 12 sections as semantic HTML
        │   using the documented component vocabulary (§6)
        ▼
   read template → replace {{META}} tokens + <!-- P2W:BODY --> with content
        ▼
   write ./strategy/playing-to-win-{slug}-{date}.html   (single self-contained file)
   write ./strategy/playing-to-win-{slug}-{date}.md      (as today)
        ▼
   `open` the .html (best-effort) → else print the path
```

**Core properties:**
- **No runtime dependency.** Injection is a string replacement Claude performs while
  writing the file. No Node, Python, pandoc, or build step required. Works in Claude Code,
  Codex, Claude.ai web, and the API — anywhere a file can be written.
- **Progressive enhancement.** All strategy content is real HTML present in the page.
  JavaScript only *enhances* (rail, scrollspy, node expand, cross-highlight, spotlight).
  With JS disabled the page still reads and prints fully.
- **Fully offline & self-contained.** All CSS and JS inlined; **no external fonts or
  assets** (system neo-grotesk stack). The output file works forever, offline, by
  double-click.

---

## 5. Template Contract (`references/strategy-template.html`)

A single self-contained HTML file containing all CSS (`<style>`), all enhancement JS
(`<script>`), the page chrome (masthead, rail container, footer credit), and these
replacement markers:

**Metadata tokens** (simple string replace):
- `{{SUBJECT}}` — one-line subject (masthead headline + `<title>`)
- `{{VERDICT}}` — `PROCEED | NARROW | TEST MANUALLY | PARK | KILL`
- `{{CONFIDENCE}}` — `Low | Medium | High`
- `{{DATE}}` — ISO date
- `{{SLUG}}` — used in `<title>`/metadata only

**Body marker** (single injection region):
- `<!-- P2W:BODY -->` — replaced with the concatenated section HTML (§6)

The left rail is **not** hand-authored — JS builds it from the injected `<section>`
elements at load. Claude only supplies sections with the right attributes.

> Note: this template is an intentional exception to the repo's "small files" guideline —
> it is a single shippable self-contained artifact. Swiss minimalism keeps the CSS lean.

---

## 6. Component Vocabulary (the generation contract)

Claude emits the body using these fixed structures so the shipped CSS/JS work. Full
detail lives in a new `references/html_render_contract.md`, loaded on demand during the
write step. Summary:

**Section wrapper** (drives rail + scrollspy):
```html
<section class="p2w-section" id="where-to-play" data-phase="2"
         data-section="where-to-play" data-label="Where to Play">
  …
</section>
```
`data-phase` ∈ {1,2,3,4}; `data-section` is a stable slug; `data-label` is the rail text.

**Cascade** (Phase I snapshot centerpiece):
```html
<ol class="p2w-cascade">
  <li class="p2w-node" data-node="aspiration">
    <button class="p2w-node-head" aria-expanded="false">
      <span class="p2w-num">01</span> Winning Aspiration
    </button>
    <div class="p2w-node-detail">…full content…</div>
  </li>
  …05…
</ol>
```

**What Must Be True** (cross-linked to nodes):
```html
<ul class="p2w-assumptions">
  <li data-relates="where-to-play how-to-win" data-confidence="low">
    <span class="p2w-conf" data-level="low">Low</span> $499/mo is the right price
  </li>
</ul>
```
Cross-highlight links node ↔ assumptions via `data-node` ↔ `data-relates`.

**Where NOT to Play** (visible exclusions):
```html
<ul class="p2w-exclude"><li>Multi-channel brands</li>…</ul>
```
Styled as ghosted, struck red items.

**Tables** (choices, alternatives, capabilities, management, assumptions):
```html
<table class="p2w-table">…</table>
```

**Evidence labels** (within one-red discipline):
```html
<span class="p2w-ev" data-kind="assumption">ASSUMPTION</span>
```
`fact` = filled black · `inference` = outline · `assumption` = red · `speculation` = dashed.

**Recommendation plate** (climax):
```html
<aside class="p2w-verdict-plate" data-verdict="narrow">
  <p class="p2w-verdict-word">▸ NARROW</p>
  <p class="p2w-verdict-rationale">…one sentence…</p>
</aside>
```
Verdict chip/plate is always red; the **word** carries the meaning (keeps Swiss discipline).

---

## 7. JavaScript Behaviors (in template; progressive enhancement)

1. **Build rail** from `section[data-section]`, grouped by `data-phase`; smooth-scroll to section on click.
2. **Scrollspy** via `IntersectionObserver` → set active rail item + advance the red progress fill.
3. **Cascade expand/collapse** on click + Enter/Space; toggle `aria-expanded`.
4. **Cross-highlight** — activating a node highlights `.p2w-assumptions [data-relates~="<node>"]`, and vice versa.
5. **Assumption spotlight toggle** — one control toggles `body.p2w-spotlight`; CSS dims everything except `assumption` / `unknown`-labeled items.
6. **Reduced motion** — honor `prefers-reduced-motion`; disable smooth-scroll and transitions.

---

## 8. Print & Accessibility

- **`@media print`:** hide rail/chrome, force every `.p2w-node-detail` open, linearize to a clean one-flow handout.
- **Accessibility:** semantic landmarks (`header`/`nav`/`main`/`footer`), cascade heads are real `<button>`s, `aria-expanded`, visible focus rings, AA contrast (white/ink/red passes), keyboard-navigable rail.
- **Performance:** single file, no render-blocking external resources, system fonts, compositor-friendly transitions only — consistent with the project's web performance rules.

---

## 9. Signature Touches (unique to this project)

1. Choice ⇄ assumption **cross-highlight** — makes the cascade's interdependence tangible.
2. **Assumption spotlight** toggle — instantly see everything still unproven.
3. **"Where NOT to Play"** rendered as ghosted/struck exclusions — strategy as saying no, shown literally.
4. **Verdict plate** — full-bleed red Swiss climax, successor to the Unicode double-line banner.
5. **Print mode** — agency handout from the same file.

---

## 10. Repo Changes

**New files:**
- `references/strategy-template.html` — the locked Swiss shell (CSS + JS + markers).
- `references/html_render_contract.md` — the component vocabulary Claude follows when generating the body.
- `examples/example-output.html` — Northwind example, fully rendered (parallels `examples/example-output.md`).

**Edited:**
- `SKILL.md` —
  - Terminal output becomes the **briefing** (not the full dump).
  - New write step: produce body HTML per the contract, inject into the template, write `.html` **and** `.md`, then `open` the `.html`.
  - Point to `references/html_render_contract.md` (load on demand at write time).
  - Keep all existing content/rubric/evidence logic.
- `README.md` — add an "HTML output" subsection + note the `.html` deliverable.
- `CHANGELOG.md` — new entry.
- `SKILL.md` frontmatter `version` and README badge: **1.0.0 → 1.1.0**.

**Unaffected:**
- `references/strategy_quality_rubric.md`, `strategy_example_bank.md`, `assumption_test_bank.md`, `positioning_patterns.md`, `strategy_preferences.md`, `execution_patterns.md`.
- `evals/evals.json` (triggers unchanged).
- The markdown output format.

---

## 11. Acceptance Criteria

1. Running the skill writes both `./strategy/playing-to-win-{slug}-{date}.html` and `.md`.
2. The `.html` opens by double-click with **no server, no network, no runtime**, and renders the full Swiss page.
3. Left rail lists all 4 phases / 12 sections, highlights the active section on scroll, and jumps on click.
4. Clicking a cascade node expands its detail and cross-highlights its related assumptions.
5. The assumption-spotlight toggle dims all non-assumption content.
6. With JavaScript disabled, all content is still present and readable; printing produces a clean linear handout.
7. Terminal shows only the briefing + both file paths, not the full 12 sections.
8. `examples/example-output.html` is the rendered Northwind example and matches the live output structure.
9. AA color contrast holds; cascade is keyboard-operable.
10. No external font/asset requests in the generated file.

---

## 12. Out of Scope

- No server, framework, bundler, or build tooling.
- No theming system beyond the neutral Swiss design (+ subtle credit).
- No change to cascade content logic, rubric, evidence rules, or verdict scale.
- No change to the markdown format.
- Multi-strategy index/dashboard pages (possible future work, not now).
