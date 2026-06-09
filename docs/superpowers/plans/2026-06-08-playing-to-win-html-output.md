# Playing to Win — HTML Strategy Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When the skill produces a strategy, render it as a self-contained, interactive, Swiss-design HTML page (alongside the existing markdown) instead of dumping all 12 sections to the terminal.

**Architecture:** Ship a locked, self-contained `strategy-template.html` (all Swiss CSS + progressive-enhancement JS + replacement markers) in the repo. At runtime the skill generates the 12 sections as semantic HTML following a documented component contract, string-replaces the markers, writes one self-contained `.html` plus the `.md`, and opens the page. No server, bundler, or runtime dependency — injection is a plain string replace the model performs while writing the file.

**Tech Stack:** Static HTML5, hand-written CSS (Swiss/International, system font stack, no external assets), vanilla JS (IIFE, IntersectionObserver). Node (built-ins only) for a dev-time verifier. Optional Playwright MCP for the interactive smoke test.

**Source of truth for decisions:** `docs/superpowers/specs/2026-06-08-playing-to-win-html-output-design.md`.

> **Git note:** The user's environment commits only on request and we start on `main`. Task 0 branches first. If the user prefers to keep the `docs/superpowers/` spec+plan local (this is a public repo), `git rm --cached` them before the first push — does not affect implementation.

---

## File Structure

**Create:**
- `references/strategy-template.html` — locked Swiss shell: design tokens, layout, masthead, JS-built rail, all `p2w-*` component CSS, enhancement JS, print CSS, neutral footer credit, `{{TOKENS}}` + `<!-- P2W:BODY -->` marker. One self-contained file (intentional exception to the small-file guideline).
- `references/html_render_contract.md` — the component vocabulary the model must emit so the template's CSS/JS work. Loaded on demand at write time.
- `examples/example-output.html` — the Northwind example rendered through the template. Doubles as the verification fixture and the public sample.
- `scripts/verify-output.mjs` — dependency-free static verifier (Node built-ins only) asserting the statically-checkable acceptance criteria against a generated HTML file.

**Modify:**
- `SKILL.md` — terminal output becomes a briefing; add the HTML render/write step; reference the contract; bump frontmatter `version` to `1.1.0`.
- `README.md` — add an "HTML output" subsection; update the repository-structure block; bump the version badge.
- `CHANGELOG.md` — add the `1.1.0` entry.

**Locked identifiers (used consistently across template, contract, example, verifier):**
- Tokens: `{{SUBJECT}}`, `{{VERDICT}}`, `{{CONFIDENCE}}`, `{{DATE}}`, `{{YEAR}}`. Body marker: `<!-- P2W:BODY -->`.
- Section slugs (`data-section`, in order), with phase (`data-phase`):
  `snapshot`(1), `executive-verdict`(1), `aspiration`(2), `where-to-play`(2), `how-to-win`(2), `capabilities`(2), `management`(2), `what-must-be-true`(3), `premortem`(3), `sharpened`(4), `validation-plan`(4), `summary`(4), `recommendation`(4).
- Cascade node keys (`data-node`): `aspiration`, `where-to-play`, `how-to-win`, `capabilities`, `management`. Assumptions reference these via `data-relates`.
- Component classes: `p2w-masthead`, `p2w-kicker`, `p2w-title`, `p2w-chip`, `p2w-progress`/`p2w-progress-fill`, `p2w-layout`, `p2w-rail`/`p2w-rail-phase`/`p2w-rail-item`, `p2w-main`, `p2w-section`, `p2w-cascade`/`p2w-node`/`p2w-node-head`/`p2w-num`/`p2w-node-detail`, `p2w-assumptions`/`p2w-conf`, `p2w-exclude`, `p2w-table`, `p2w-ev`, `p2w-verdict-plate`/`p2w-verdict-word`/`p2w-verdict-rationale`, `p2w-footer`. Toggle id: `p2w-spotlight-toggle`. Body state: `p2w-spotlight`.

---

## Task 0: Branch

- [ ] **Step 1: Create the feature branch**

Run:
```bash
cd /path/to/playing-to-win
git checkout -b feature/html-strategy-output
```
Expected: `Switched to a new branch 'feature/html-strategy-output'`

---

## Task 1: Dependency-free static verifier (the failing test)

**Files:**
- Create: `scripts/verify-output.mjs`

- [ ] **Step 1: Write the verifier**

Create `scripts/verify-output.mjs`:
```js
#!/usr/bin/env node
// Dependency-free static verifier for Playing to Win HTML output.
// Usage: node scripts/verify-output.mjs <path-to-html>
// Asserts the statically-checkable acceptance criteria. Exit 0 = pass.
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/verify-output.mjs <file.html>');
  process.exit(2);
}
const html = readFileSync(file, 'utf8');
const checks = [];
const ok = (name, cond) => checks.push({ name, pass: !!cond });
const has = (re) => re.test(html);

// Self-contained + clean injection
ok('no unreplaced {{TOKENS}}', !has(/\{\{[A-Z_]+\}\}/));
ok('body marker replaced', !html.includes('<!-- P2W:BODY -->'));
ok('no external http(s) asset links', !has(/(href|src)\s*=\s*["']https?:\/\//i) ||
   // allow the footer credit anchor only
   (html.match(/(href|src)\s*=\s*["']https?:\/\//gi) || []).every(m => /href/i.test(m)));
ok('no remote font imports', !has(/@import|fonts\.googleapis|fonts\.gstatic/i));

// All 13 sections present, in document
const sections = ['snapshot','executive-verdict','aspiration','where-to-play','how-to-win',
  'capabilities','management','what-must-be-true','premortem','sharpened','validation-plan',
  'summary','recommendation'];
for (const s of sections) ok(`section: ${s}`, has(new RegExp(`data-section=["']${s}["']`)));

// Cascade: exactly 5 nodes with the right keys
// NB: match the exact class to avoid also matching p2w-node-head / p2w-node-detail
ok('cascade has 5 nodes', (html.match(/class=["']p2w-node["']/g) || []).length === 5);
for (const n of ['aspiration','where-to-play','how-to-win','capabilities','management'])
  ok(`node: ${n}`, has(new RegExp(`data-node=["']${n}["']`)));

// Interactive contract hooks present
ok('assumptions cross-link (data-relates)', has(/class=["']p2w-assumptions["']/) && has(/data-relates=/));
ok('confidence pills', has(/class=["']p2w-conf["']/) && has(/data-level=/));
ok('evidence labels', has(/class=["']p2w-ev["']/) && has(/data-kind=/));
ok('exclusions (where not to play)', has(/class=["']p2w-exclude["']/));
ok('verdict plate', has(/class=["']p2w-verdict-plate["']/) && has(/data-verdict=/));
ok('spotlight toggle', has(/id=["']p2w-spotlight-toggle["']/));

// Accessibility + print + motion
ok('print stylesheet', has(/@media\s+print/));
ok('reduced-motion guard', has(/prefers-reduced-motion/));
ok('lang attribute', has(/<html[^>]*\slang=/i));

let failed = 0;
for (const c of checks) { if (!c.pass) failed++; console.log(`${c.pass ? 'PASS' : 'FAIL'}  ${c.name}`); }
console.log(`\n${checks.length - failed}/${checks.length} checks passed`);
process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: Run it against nothing to prove it guards**

Run: `node scripts/verify-output.mjs examples/example-output.html`
Expected: FAIL — `ENOENT` / file not found (the example does not exist yet). This confirms the verifier actually reads the target.

- [ ] **Step 3: Commit**

```bash
git add scripts/verify-output.mjs
git commit -m "test: add dependency-free verifier for HTML strategy output"
```

---

## Task 2: Component render contract

**Files:**
- Create: `references/html_render_contract.md`

- [ ] **Step 1: Write the contract**

Create `references/html_render_contract.md`:
````markdown
# HTML Render Contract

The skill injects generated section HTML into `references/strategy-template.html` by
replacing `<!-- P2W:BODY -->`. The template's CSS and JS depend on the exact structures
below. Emit them verbatim (only the human content varies). Content is real HTML — the
page reads and prints with JavaScript disabled; JS only enhances.

## Metadata tokens (replace in the template)

| Token | Value |
|---|---|
| `{{SUBJECT}}` | One-line subject (masthead headline + `<title>`) |
| `{{VERDICT}}` | `PROCEED` \| `NARROW` \| `TEST MANUALLY` \| `PARK` \| `KILL` |
| `{{CONFIDENCE}}` | `Low` \| `Medium` \| `High` |
| `{{DATE}}` | ISO date, e.g. `2026-05-14` |
| `{{YEAR}}` | Four-digit year for the footer |

## Section wrapper (every one of the 13 sections)

```html
<section class="p2w-section" id="where-to-play" data-phase="2"
         data-section="where-to-play" data-label="Where to Play">
  <h2><span class="p2w-section-no">04</span> Where to Play</h2>
  <!-- section body -->
</section>
```
- `data-phase`: `1` Diagnosis · `2` The Cascade · `3` Stress Test · `4` Verdict.
- `data-section`: the fixed slug (see list below). `data-label`: rail text.
- The JS builds the left rail and scrollspy from these attributes — do not hand-author the rail.

### The 13 sections, in order

| # | `data-section` | phase | `data-label` | Primary component |
|---|---|---|---|---|
| 1 | `snapshot` | 1 | Snapshot | `p2w-cascade` + `p2w-exclude` |
| 2 | `executive-verdict` | 1 | Executive Verdict | prose with `p2w-ev` labels |
| 3 | `aspiration` | 2 | Winning Aspiration | prose |
| 4 | `where-to-play` | 2 | Where to Play | `p2w-table` + `p2w-exclude` |
| 5 | `how-to-win` | 2 | How to Win | `p2w-table` + closing line |
| 6 | `capabilities` | 2 | Required Capabilities | `p2w-table` + closing line |
| 7 | `management` | 2 | Management Systems | `p2w-table` + kill-rule line |
| 8 | `what-must-be-true` | 3 | What Must Be True | `p2w-assumptions` |
| 9 | `premortem` | 3 | Red-Team Pre-Mortem | list + `p2w-table` |
| 10 | `sharpened` | 4 | Sharpened Version | definition list |
| 11 | `validation-plan` | 4 | 30-Day Plan | week list |
| 12 | `summary` | 4 | Presentation Summary | definition list |
| 13 | `recommendation` | 4 | Recommendation | `p2w-verdict-plate` |

## The cascade (section 1 `snapshot`)

Exactly five nodes, keys in this order. Content closed by default; JS expands on click.

```html
<ol class="p2w-cascade">
  <li class="p2w-node" data-node="aspiration">
    <button class="p2w-node-head" type="button">
      <span class="p2w-num">01</span> Winning Aspiration
    </button>
    <div class="p2w-node-detail"><div class="p2w-node-detail-inner">
      Become the default monthly bookkeeping for single-channel Shopify DTC brands ($500K–$3M GMV).
    </div></div>
  </li>
  <li class="p2w-node" data-node="where-to-play"> … 02 Where to Play … </li>
  <li class="p2w-node" data-node="how-to-win"> … 03 How to Win … </li>
  <li class="p2w-node" data-node="capabilities"> … 04 Required Capabilities … </li>
  <li class="p2w-node" data-node="management"> … 05 Management Systems … </li>
</ol>
```

## Where NOT to Play (sections 1 and 4)

```html
<h3 class="p2w-subhead">Where not to play</h3>
<ul class="p2w-exclude">
  <li>Multi-channel brands (Shopify + Amazon + retail)</li>
  <li>Service-based small businesses</li>
</ul>
```

## What Must Be True (section 8) — cross-linked to cascade nodes

`data-relates` lists one or more cascade node keys (space-separated). `data-confidence`
and the `p2w-conf` `data-level` must match.

```html
<ul class="p2w-assumptions">
  <li data-relates="where-to-play" data-confidence="medium">
    <span class="p2w-conf" data-level="medium">Medium</span>
    <span>$500K–$3M Shopify brands feel monthly bookkeeping pain.
      <span class="p2w-how">Test: survey 30 brands in DTC Slack.</span></span>
  </li>
  <li data-relates="how-to-win" data-confidence="low">
    <span class="p2w-conf" data-level="low">Low</span>
    <span>Founders will pay $499/month flat.</span>
  </li>
</ul>
```
Allowed `data-level` / `data-confidence`: `high`, `medium`, `low`, `unknown`.

## Tables (sections 4–9)

```html
<table class="p2w-table">
  <thead><tr><th>Choice</th><th>Recommendation</th></tr></thead>
  <tbody>
    <tr><td>Primary customer</td><td>Shopify DTC founder, $500K–$3M GMV</td></tr>
  </tbody>
</table>
```

## Evidence labels (inline, anywhere)

```html
<span class="p2w-ev" data-kind="assumption">ASSUMPTION</span>
```
`data-kind`: `fact` (filled black) · `inference` (outline) · `assumption` (red) · `speculation` (dashed).

## Closing pointer lines (sections 5, 6, 7)

```html
<p class="p2w-pointer">▸ We win by … because … .</p>
```

## Recommendation plate (section 13)

```html
<aside class="p2w-verdict-plate" data-verdict="narrow">
  <p class="p2w-verdict-word">▸ NARROW</p>
  <p class="p2w-verdict-rationale">One sentence tied to the strongest fact or assumption.</p>
</aside>
```
`data-verdict`: `proceed` \| `narrow` \| `test-manually` \| `park` \| `kill`. The plate is
always red; the word carries the meaning (Swiss discipline — no per-verdict palette).

## Definition lists (sections 10, 12)

```html
<dl class="p2w-defs">
  <dt>Original idea</dt><dd>"Bookkeeping for DTC brands."</dd>
  <dt>Sharper version</dt><dd>Flat-fee monthly bookkeeping for single-channel Shopify…</dd>
</dl>
```
````

- [ ] **Step 2: Commit**

```bash
git add references/html_render_contract.md
git commit -m "docs: add HTML render contract (component vocabulary)"
```

---

## Task 3: The locked Swiss template

**Files:**
- Create: `references/strategy-template.html`

- [ ] **Step 1: Write the template — document skeleton, tokens, and markers**

Create `references/strategy-template.html` with this exact structure (CSS and JS bodies filled in the next steps go inside the marked blocks):
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{SUBJECT}} — Playing to Win</title>
<style>
/* ===== STYLE BLOCK — paste Step 2 here ===== */
</style>
</head>
<body>
<header class="p2w-masthead">
  <p class="p2w-kicker">Playing to Win · Strategy Dossier</p>
  <h1 class="p2w-title">{{SUBJECT}}</h1>
  <p class="p2w-meta">
    <span class="p2w-chip">{{VERDICT}}</span>
    <span class="p2w-confidence">{{CONFIDENCE}} confidence</span>
    <span class="p2w-date">{{DATE}}</span>
  </p>
  <button id="p2w-spotlight-toggle" type="button" aria-pressed="false">Spotlight assumptions</button>
</header>

<div class="p2w-progress" aria-hidden="true"><div class="p2w-progress-fill"></div></div>

<div class="p2w-layout">
  <nav class="p2w-rail" aria-label="Strategy sections"><!-- built by JS --></nav>
  <main class="p2w-main">
<!-- P2W:BODY -->
  </main>
</div>

<footer class="p2w-footer">
  <p>Generated {{YEAR}} with the <a href="https://github.com/paultaki/playing-to-win">Playing to Win</a>
  strategy skill. Framework © Roger L. Martin &amp; A.G. Lafley,
  <em>Playing to Win</em> (HBR Press, 2013).</p>
</footer>

<script>
/* ===== SCRIPT BLOCK — paste Step 3 here ===== */
</script>
</body>
</html>
```

- [ ] **Step 2: Fill the STYLE block**

Replace the `/* ===== STYLE BLOCK ... ===== */` comment with:
```css
:root{
  --ink:#111;--paper:#fff;--red:#e2231a;
  --gray-1:#666;--gray-2:#999;--line:#e3e3e3;--bg-soft:#fafafa;
  --rail-w:280px;--content-max:760px;
  --mono:'SF Mono',ui-monospace,Menlo,Consolas,monospace;
  --sans:'Helvetica Neue',Arial,'Segoe UI',Roboto,system-ui,sans-serif;
  --space:clamp(2rem,4vw,4rem);--dur:200ms;--ease:cubic-bezier(.16,1,.3,1);
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--sans);
  font-size:16px;line-height:1.55;-webkit-font-smoothing:antialiased}
h2,h3{font-weight:800}
a{color:var(--ink);text-underline-offset:3px}

.p2w-masthead{max-width:calc(var(--rail-w) + var(--content-max));margin:0 auto;
  padding:var(--space) var(--space) 1.5rem;border-bottom:2px solid var(--ink)}
.p2w-kicker{font-family:var(--mono);font-size:11px;letter-spacing:.18em;
  text-transform:uppercase;color:var(--gray-1);margin:0 0 .75rem}
.p2w-title{font-size:clamp(32px,5vw,56px);font-weight:800;letter-spacing:-.02em;
  line-height:1.02;margin:0}
.p2w-meta{display:flex;flex-wrap:wrap;gap:.75rem;align-items:center;margin:1rem 0 0;
  font-size:13px;color:var(--gray-1)}
.p2w-chip{background:var(--red);color:#fff;font-weight:800;letter-spacing:.08em;
  font-size:12px;padding:.3em .7em}
#p2w-spotlight-toggle{margin-top:1.1rem;font:600 12px/1 var(--sans);letter-spacing:.04em;
  background:none;border:1px solid var(--ink);padding:.6em .95em;cursor:pointer}
#p2w-spotlight-toggle[aria-pressed="true"]{background:var(--ink);color:#fff}

.p2w-progress{position:sticky;top:0;height:3px;background:var(--line);z-index:20}
.p2w-progress-fill{height:100%;width:0;background:var(--red);transition:width var(--dur) var(--ease)}

.p2w-layout{max-width:calc(var(--rail-w) + var(--content-max));margin:0 auto;display:grid;
  grid-template-columns:var(--rail-w) 1fr;gap:var(--space);padding:0 var(--space)}
@media (max-width:880px){.p2w-layout{grid-template-columns:1fr;gap:0}}

.p2w-rail{position:sticky;top:2rem;align-self:start;height:max-content;padding:2rem 0;font-size:13px}
@media (max-width:880px){.p2w-rail{position:static;padding:1rem 0;border-bottom:1px solid var(--line)}}
.p2w-rail-phase{font-family:var(--mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;
  color:var(--ink);font-weight:700;margin:1.4rem 0 .4rem}
.p2w-rail-phase:first-child{margin-top:0}
.p2w-rail-item{display:block;color:var(--gray-1);text-decoration:none;padding:.3rem 0 .3rem .8rem;
  border-left:2px solid transparent;line-height:1.3}
.p2w-rail-item:hover{color:var(--ink)}
.p2w-rail-item.is-active{color:var(--ink);font-weight:700;border-left-color:var(--red)}

.p2w-main{min-width:0;max-width:var(--content-max);padding:2rem 0 6rem}
.p2w-section{padding:2.5rem 0;border-top:1px solid var(--line);scroll-margin-top:2rem}
.p2w-section:first-child{border-top:none;padding-top:1rem}
.p2w-section>h2{font-size:13px;font-family:var(--mono);letter-spacing:.12em;text-transform:uppercase;
  color:var(--gray-1);margin:0 0 1.2rem;display:flex;gap:.6rem;align-items:baseline}
.p2w-section-no{color:var(--red);font-weight:700}
.p2w-subhead{font-size:12px;font-family:var(--mono);letter-spacing:.1em;text-transform:uppercase;
  color:var(--gray-1);margin:1.6rem 0 .6rem}

.p2w-cascade{list-style:none;margin:0;padding:0;border-top:2px solid var(--ink)}
.p2w-node{border-bottom:1px solid var(--line)}
.p2w-node-head{display:flex;gap:1rem;align-items:baseline;width:100%;text-align:left;background:none;
  border:none;cursor:pointer;padding:1rem 0;font:800 18px/1.2 var(--sans);color:var(--ink)}
.p2w-node-head:hover{background:var(--bg-soft)}
.p2w-node-head:focus-visible{outline:2px solid var(--red);outline-offset:2px}
.p2w-num{font-size:28px;font-weight:800;line-height:1;min-width:1.6em;color:var(--gray-2)}
.p2w-node:first-child .p2w-num,.p2w-node.is-open .p2w-num{color:var(--red)}
.p2w-node-detail{max-height:0;overflow:hidden;transition:max-height var(--dur) var(--ease)}
.p2w-node.is-open .p2w-node-detail{max-height:640px}
.p2w-node-detail-inner{padding:0 0 1.2rem 3.4rem;font-size:15px}

.p2w-assumptions{list-style:none;margin:0;padding:0}
.p2w-assumptions li{display:flex;gap:.8rem;align-items:baseline;padding:.7rem 0;
  border-bottom:1px solid var(--line);cursor:pointer;transition:background var(--dur)}
.p2w-assumptions li.is-linked{background:#fff4f3;box-shadow:inset 3px 0 0 var(--red)}
.p2w-conf{font-family:var(--mono);font-size:11px;letter-spacing:.05em;text-transform:uppercase;
  padding:.2em .5em;border:1px solid var(--ink);min-width:5.5em;text-align:center}
.p2w-conf[data-level="low"]{color:var(--red);border-color:var(--red)}
.p2w-conf[data-level="unknown"]{border-style:dashed;color:var(--gray-1)}
.p2w-how{display:block;font-size:12px;color:var(--gray-1);margin-top:.2rem}

.p2w-exclude{list-style:none;margin:0;padding:0}
.p2w-exclude li{padding:.5rem 0 .5rem 1.6rem;position:relative;color:var(--gray-1);
  text-decoration:line-through;text-decoration-color:var(--red)}
.p2w-exclude li::before{content:"✕";position:absolute;left:0;color:var(--red);font-weight:700;
  text-decoration:none}

.p2w-table{width:100%;border-collapse:collapse;font-size:14px;margin:.5rem 0}
.p2w-table th{text-align:left;font-family:var(--mono);font-size:11px;letter-spacing:.08em;
  text-transform:uppercase;color:var(--gray-1);border-bottom:2px solid var(--ink);
  padding:.6rem .8rem .6rem 0;vertical-align:bottom}
.p2w-table td{border-bottom:1px solid var(--line);padding:.7rem .8rem .7rem 0;vertical-align:top}
.p2w-table tr:hover td{background:var(--bg-soft)}

.p2w-ev{font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.08em;
  padding:.15em .45em;white-space:nowrap}
.p2w-ev[data-kind="fact"]{background:var(--ink);color:#fff}
.p2w-ev[data-kind="inference"]{border:1px solid var(--ink)}
.p2w-ev[data-kind="assumption"]{background:var(--red);color:#fff}
.p2w-ev[data-kind="speculation"]{border:1px dashed var(--gray-1);color:var(--gray-1)}

.p2w-pointer{font-weight:700;border-left:3px solid var(--red);padding-left:1rem;margin:1.4rem 0}

.p2w-defs{margin:0}
.p2w-defs dt{font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;
  color:var(--gray-1);margin-top:1.1rem}
.p2w-defs dd{margin:.25rem 0 0}

.p2w-verdict-plate{background:var(--red);color:#fff;padding:var(--space);margin-top:2.5rem}
.p2w-verdict-word{font-size:clamp(28px,4vw,44px);font-weight:800;letter-spacing:.02em;margin:0}
.p2w-verdict-rationale{font-size:17px;line-height:1.5;margin:1rem 0 0;max-width:60ch}

.p2w-footer{max-width:calc(var(--rail-w) + var(--content-max));margin:0 auto;
  padding:2rem var(--space) 4rem;border-top:1px solid var(--line);font-size:12px;color:var(--gray-2)}
.p2w-footer a{color:var(--gray-1)}

body.p2w-spotlight .p2w-main>.p2w-section{opacity:.22;transition:opacity var(--dur)}
body.p2w-spotlight .p2w-section:has(.p2w-ev[data-kind="assumption"]),
body.p2w-spotlight .p2w-section:has(.p2w-conf[data-level="low"]),
body.p2w-spotlight .p2w-section:has(.p2w-conf[data-level="unknown"]){opacity:1}
body.p2w-spotlight .p2w-assumptions li{opacity:.22}
body.p2w-spotlight .p2w-assumptions li:has(.p2w-conf[data-level="low"]),
body.p2w-spotlight .p2w-assumptions li:has(.p2w-conf[data-level="unknown"]){opacity:1}

@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  *{transition:none!important}
}
@media print{
  .p2w-rail,.p2w-progress,#p2w-spotlight-toggle{display:none}
  .p2w-layout{display:block;max-width:none;padding:0}
  .p2w-main{max-width:none;padding:0}
  .p2w-node-detail{max-height:none!important;overflow:visible!important}
  .p2w-node-head{cursor:default}
  .p2w-section{break-inside:avoid}
  body{font-size:11pt}
}
```

- [ ] **Step 3: Fill the SCRIPT block**

Replace the `/* ===== SCRIPT BLOCK ... ===== */` comment with:
```js
(function(){
  var PHASES={'1':'I · Diagnosis','2':'II · The Cascade','3':'III · Stress Test','4':'IV · Verdict'};
  var sections=[].slice.call(document.querySelectorAll('.p2w-main .p2w-section'));
  var rail=document.querySelector('.p2w-rail');
  var itemById={};

  // 1. Build the rail grouped by phase
  var lastPhase=null;
  sections.forEach(function(sec){
    var phase=sec.getAttribute('data-phase');
    var label=sec.getAttribute('data-label')||sec.id;
    if(phase!==lastPhase){
      var h=document.createElement('p');
      h.className='p2w-rail-phase';
      h.textContent=PHASES[phase]||('Phase '+phase);
      rail.appendChild(h); lastPhase=phase;
    }
    var a=document.createElement('a');
    a.className='p2w-rail-item'; a.href='#'+sec.id; a.textContent=label;
    rail.appendChild(a); itemById[sec.id]=a;
  });

  // 2. Scrollspy + progress fill
  var fill=document.querySelector('.p2w-progress-fill');
  var activeId=null;
  function setActive(id){
    if(id===activeId)return; activeId=id;
    for(var k in itemById){itemById[k].classList.toggle('is-active',k===id);}
    var idx=sections.map(function(s){return s.id;}).indexOf(id);
    if(fill)fill.style.width=((idx+1)/sections.length*100)+'%';
  }
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){if(e.isIntersecting)setActive(e.target.id);});
    },{rootMargin:'-30% 0px -60% 0px',threshold:0});
    sections.forEach(function(s){io.observe(s);});
  }

  // 4. cross-highlight helper (defined before use in toggleNode)
  var assumptions=[].slice.call(document.querySelectorAll('.p2w-assumptions li'));
  function highlight(nodeKey){
    assumptions.forEach(function(li){
      var rel=(li.getAttribute('data-relates')||'').split(/\s+/);
      li.classList.toggle('is-linked',!!nodeKey&&rel.indexOf(nodeKey)>=0);
    });
  }

  // 3. Cascade expand/collapse (+ cross-highlight on open)
  function toggleNode(node){
    var open=node.classList.toggle('is-open');
    var head=node.querySelector('.p2w-node-head');
    if(head)head.setAttribute('aria-expanded',open?'true':'false');
    highlight(open?node.getAttribute('data-node'):null);
  }
  document.querySelectorAll('.p2w-node').forEach(function(node){
    var head=node.querySelector('.p2w-node-head');
    if(!head)return;
    head.setAttribute('aria-expanded','false');
    head.addEventListener('click',function(){toggleNode(node);});
  });

  // clicking an assumption opens + scrolls to its related node
  assumptions.forEach(function(li){
    li.addEventListener('click',function(){
      var rel=(li.getAttribute('data-relates')||'').split(/\s+/)[0];
      var node=document.querySelector('.p2w-node[data-node="'+rel+'"]');
      if(node){ if(!node.classList.contains('is-open'))toggleNode(node);
        node.scrollIntoView({block:'center'}); }
    });
  });

  // 5. Spotlight toggle
  var btn=document.getElementById('p2w-spotlight-toggle');
  if(btn)btn.addEventListener('click',function(){
    var on=document.body.classList.toggle('p2w-spotlight');
    btn.setAttribute('aria-pressed',on?'true':'false');
  });
})();
```

- [ ] **Step 4: Sanity-check the template is well-formed**

Run: `node -e "const h=require('fs').readFileSync('references/strategy-template.html','utf8'); for(const t of ['{{SUBJECT}}','{{VERDICT}}','{{CONFIDENCE}}','{{DATE}}','{{YEAR}}','<!-- P2W:BODY -->']){if(!h.includes(t))throw new Error('missing '+t)} if((h.match(/<style>/g)||[]).length!==1||(h.match(/<script>/g)||[]).length!==1)throw new Error('style/script count'); console.log('template OK')"`
Expected: `template OK`

- [ ] **Step 5: Commit**

```bash
git add references/strategy-template.html
git commit -m "feat: add locked Swiss HTML strategy template"
```

---

## Task 4: Rendered Northwind example (fixture + sample) — make the verifier pass

**Files:**
- Create: `examples/example-output.html`

- [ ] **Step 1: Render the example**

Create `examples/example-output.html` by copying `references/strategy-template.html`, then:
1. Replace tokens: `{{SUBJECT}}`→`Northwind Books — flat-fee bookkeeping for Shopify DTC brands`, `{{VERDICT}}`→`NARROW`, `{{CONFIDENCE}}`→`Medium`, `{{DATE}}`→`2026-05-14`, `{{YEAR}}`→`2026`.
2. Replace `<!-- P2W:BODY -->` with the 13 sections below, transcribing the content of `examples/example-output.md` into the components from `references/html_render_contract.md`. The interactive-critical sections (1 snapshot cascade, 8 assumptions cross-link, 13 verdict plate) are given in full; sections 2–7 and 9–12 transcribe the existing markdown content into the documented components (tables → `p2w-table`, "where not to play" → `p2w-exclude`, closing lines → `p2w-pointer`, sharpened/summary → `p2w-defs`).

Section 1 (snapshot) — paste verbatim:
```html
    <section class="p2w-section" id="snapshot" data-phase="1" data-section="snapshot" data-label="Snapshot">
      <h2><span class="p2w-section-no">01</span> P2W Snapshot</h2>
      <ol class="p2w-cascade">
        <li class="p2w-node" data-node="aspiration">
          <button class="p2w-node-head" type="button"><span class="p2w-num">01</span> Winning Aspiration</button>
          <div class="p2w-node-detail"><div class="p2w-node-detail-inner">
            Become the default monthly bookkeeping service for single-channel Shopify DTC brands ($500K–$3M GMV) who are too big for a spreadsheet and too small for a CFO.
          </div></div>
        </li>
        <li class="p2w-node" data-node="where-to-play">
          <button class="p2w-node-head" type="button"><span class="p2w-num">02</span> Where to Play</button>
          <div class="p2w-node-detail"><div class="p2w-node-detail-inner">
            Single-channel Shopify brands, $500K–$3M. DTC operator forums and agency referrals first.
          </div></div>
        </li>
        <li class="p2w-node" data-node="how-to-win">
          <button class="p2w-node-head" type="button"><span class="p2w-num">03</span> How to Win</button>
          <div class="p2w-node-detail"><div class="p2w-node-detail-inner">
            Flat $499/month, no tiers. DTC-native workflow (Shopify, A2X, inventory) built in, not bolted on. Books closed in 7 business days.
          </div></div>
        </li>
        <li class="p2w-node" data-node="capabilities">
          <button class="p2w-node-head" type="button"><span class="p2w-num">04</span> Required Capabilities</button>
          <div class="p2w-node-detail"><div class="p2w-node-detail-inner">
            DTC close playbook, A2X/inventory expertise, trained bookkeeper pool, DTC operator referral network.
          </div></div>
        </li>
        <li class="p2w-node" data-node="management">
          <button class="p2w-node-head" type="button"><span class="p2w-num">05</span> Management Systems</button>
          <div class="p2w-node-detail"><div class="p2w-node-detail-inner">
            Pipeline tracker, time-per-close, month-3 retention, NPS, referral attribution.
          </div></div>
        </li>
      </ol>
      <h3 class="p2w-subhead">Where not to play</h3>
      <ul class="p2w-exclude">
        <li>Multi-channel brands (Shopify + Amazon + retail)</li>
        <li>Service-based small businesses</li>
        <li>Brands under $500K GMV (price-sensitive, pain not acute)</li>
        <li>PE-backed or $10M+ brands (need fractional CFO, not bookkeeping)</li>
      </ul>
    </section>
```

Section 8 (what-must-be-true) — paste verbatim:
```html
    <section class="p2w-section" id="what-must-be-true" data-phase="3" data-section="what-must-be-true" data-label="What Must Be True">
      <h2><span class="p2w-section-no">08</span> What Must Be True</h2>
      <p>Click a row to jump to the choice it depends on.</p>
      <ul class="p2w-assumptions">
        <li data-relates="where-to-play" data-confidence="medium">
          <span class="p2w-conf" data-level="medium">Medium</span>
          <span>$500K–$3M Shopify brands feel monthly bookkeeping pain.
            <span class="p2w-how">Test: survey 30 brands in DTC Slack; ask what they do today and where it breaks.</span></span>
        </li>
        <li data-relates="how-to-win" data-confidence="low">
          <span class="p2w-conf" data-level="low">Low</span>
          <span>Founders will pay $499/month flat.
            <span class="p2w-how">Test: show pricing to 10 prospects with a real offer; measure trial signups.</span></span>
        </li>
        <li data-relates="capabilities" data-confidence="low">
          <span class="p2w-conf" data-level="low">Low</span>
          <span>Trained DTC bookkeepers can be hired in under 60 days.
            <span class="p2w-how">Test: post one job; measure qualified applicants per week.</span></span>
        </li>
        <li data-relates="where-to-play how-to-win" data-confidence="medium">
          <span class="p2w-conf" data-level="medium">Medium</span>
          <span>Single-channel Shopify positioning beats generic bookkeeping for SEO and referrals.
            <span class="p2w-how">Test: A/B landing copy; track time-on-page and conversion.</span></span>
        </li>
        <li data-relates="how-to-win management" data-confidence="medium">
          <span class="p2w-conf" data-level="medium">Medium</span>
          <span>Margin works at 35 minutes/week per client.
            <span class="p2w-how">Test: time-track 3 pilot closes; back into hourly margin at $499.</span></span>
        </li>
        <li data-relates="management" data-confidence="unknown">
          <span class="p2w-conf" data-level="unknown">Unknown</span>
          <span>Month-3 retention stays above 95%.
            <span class="p2w-how">Test: run pilots for 90+ days before scaling.</span></span>
        </li>
      </ul>
    </section>
```

Section 13 (recommendation) — paste verbatim:
```html
    <section class="p2w-section" id="recommendation" data-phase="4" data-section="recommendation" data-label="Recommendation">
      <h2>Recommendation</h2>
      <aside class="p2w-verdict-plate" data-verdict="narrow">
        <p class="p2w-verdict-word">▸ NARROW</p>
        <p class="p2w-verdict-rationale">The buying window is open and the DTC-native workflow is a real wedge, but "DTC" is still too broad. Cut to single-channel Shopify brands at $500K–$3M GMV, prove the close playbook on 3 pilots, build the bookkeeper hiring pipeline before the marketing pipeline, then expand.</p>
      </aside>
    </section>
```

Section 4 (where-to-play) — paste verbatim (the worked pattern for every table section):
```html
    <section class="p2w-section" id="where-to-play" data-phase="2" data-section="where-to-play" data-label="Where to Play">
      <h2><span class="p2w-section-no">04</span> Where to Play</h2>
      <table class="p2w-table">
        <thead><tr><th>Choice</th><th>Recommendation</th></tr></thead>
        <tbody>
          <tr><td>Primary customer</td><td>Shopify DTC founder, $500K–$3M GMV, no in-house finance hire</td></tr>
          <tr><td>End user</td><td>Same as primary (founder owns the books today)</td></tr>
          <tr><td>Use case</td><td>Monthly close, inventory accounting, sales-tax reconciliation, tax-ready books</td></tr>
          <tr><td>Market / category</td><td>"DTC bookkeeping" — adjacent to general SMB bookkeeping, narrower</td></tr>
          <tr><td>Channel</td><td>DTC operator Slack communities and newsletters; agency referrals after 10 case studies</td></tr>
          <tr><td>Price tier</td><td>Flat $499/month, no tiers, no hourly bolt-ons, no setup fee</td></tr>
          <tr><td>Timing trigger</td><td>Provider failure, tax season, first audit notice, $1M milestone, fundraise prep</td></tr>
        </tbody>
      </table>
      <h3 class="p2w-subhead">Where not to play</h3>
      <ul class="p2w-exclude">
        <li>Multi-channel brands (Amazon + Shopify + retail) — complexity breaks flat pricing</li>
        <li>Service-based small businesses (no inventory, wrong workflow)</li>
        <li>Brands under $500K GMV (price-sensitive, founder still doing it themselves)</li>
        <li>PE-backed or $10M+ brands (need fractional CFO, not bookkeeping)</li>
        <li>Selling through the Shopify App Store directly (noisy channel, wrong intent)</li>
      </ul>
    </section>
```

Sections 2, 3, 5–7 and 9–12: transcribe from `examples/example-output.md` into the contract components, using section 4 above as the worked pattern. Each must be a `<section class="p2w-section" id="<slug>" data-phase="<n>" data-section="<slug>" data-label="<label>">` with an `<h2>` using `p2w-section-no`, following the slug/phase/label table in the contract. Use `p2w-table` for the alternatives/capabilities/management/pre-mortem tables, `p2w-pointer` for the closing ▸ lines in sections 5–7, `p2w-ev` labels where the markdown marks `[FACT]`/`[INFERENCE]`/`[ASSUMPTION]` (section 2 has them), and `p2w-defs` for sections 10 and 12.

- [ ] **Step 2: Run the verifier — it must pass**

Run: `node scripts/verify-output.mjs examples/example-output.html`
Expected: every line prints `PASS` and the final summary line reads `N/N checks passed` (all checks; ~32), exit 0. If any line is `FAIL`, fix that section's markup to match the contract and re-run.

- [ ] **Step 3: Interactive smoke test in a browser**

Open the file and confirm the five interactive acceptance criteria by hand (or via the Playwright MCP):
```bash
open examples/example-output.html   # macOS
```
Confirm: (a) left rail lists all 4 phases / 13 sections and highlights the active one as you scroll, with the red progress bar advancing; (b) clicking a cascade node expands its detail; (c) opening a node tints its related rows in section 8; (d) the "Spotlight assumptions" button dims everything except low/unknown assumptions; (e) `Cmd/Ctrl+P` print preview shows the rail hidden and every cascade node expanded.

If using the Playwright MCP, assert programmatically:
```js
// after browser_navigate to the file:// URL
// 1 rail built:
document.querySelectorAll('.p2w-rail-item').length === 13
// 2 node closed initially, opens on click:
const n = document.querySelector('.p2w-node[data-node="where-to-play"]');
n.querySelector('.p2w-node-head').click();
n.classList.contains('is-open') === true &&
document.querySelector('.p2w-assumptions li[data-relates~="where-to-play"]').classList.contains('is-linked') === true
```

- [ ] **Step 4: Commit**

```bash
git add examples/example-output.html
git commit -m "feat: add rendered Northwind HTML example (verifier fixture)"
```

---

## Task 5: Wire the skill to produce the HTML

**Files:**
- Modify: `SKILL.md`

- [ ] **Step 1: Bump the version in frontmatter**

In `SKILL.md`, change line 4 from `version: 1.0.0` to `version: 1.1.0`.

- [ ] **Step 2: Replace the Step 6 heading/intro to cover both files**

Find (around lines 103–105):
```
### Step 6 — Write the Strategy File

After the in-conversation output is complete, write the full output to a persistent markdown file:
```
Replace with:
```
### Step 6 — Write the Strategy Files (Markdown + HTML)

After the analysis is complete, write the full output to BOTH a persistent markdown file and a self-contained interactive HTML page. Do not dump all 12 sections into the terminal; the terminal gets a short briefing instead (see the Standard Output section below).
```

- [ ] **Step 3: Add the HTML render step after the markdown frontmatter block**

In `SKILL.md`, immediately after the markdown-file instructions (after the line `Then write the full editorial output below the frontmatter.` near line 123), insert:
```
#### HTML page

Also write a self-contained interactive HTML page next to the markdown file:

- Path: `./strategy/playing-to-win-{slug}-{date}.html` (same slug and date as the markdown).
- Read `references/strategy-template.html`. Replace the tokens `{{SUBJECT}}`, `{{VERDICT}}`, `{{CONFIDENCE}}`, `{{DATE}}`, `{{YEAR}}`, then replace the `<!-- P2W:BODY -->` marker with the 13 sections rendered as semantic HTML.
- Follow `references/html_render_contract.md` exactly for the component structure (load it now). The template's CSS and JS depend on those classes and data attributes.
- Generate all 13 sections in order: snapshot (with the 5-node cascade and "where not to play"), executive-verdict, the five cascade sections, what-must-be-true (assumptions cross-linked to cascade nodes via `data-relates`), premortem, sharpened, validation-plan, summary, recommendation (verdict plate).
- Write the result as one file. It must be fully self-contained: no external fonts, scripts, or styles.
- After writing, open it in the default browser (best effort): run `open "<path>"` on macOS, `xdg-open "<path>"` on Linux, or `start "" "<path>"` on Windows. If opening fails or the environment is headless, just report the path.

See `examples/example-output.html` for a complete rendered reference.
```

- [ ] **Step 4: Make the terminal output a briefing**

In `SKILL.md`, find the start of the `## Standard Output (Editorial Format)` section (around line 127) and insert this paragraph directly beneath the heading, before "Render the 12 sections...":
```
**Terminal vs. files.** The full 12-section editorial format below is the content of the **markdown file**. In the terminal (chat) do NOT print all 12 sections. Print a short briefing only: the verdict and confidence; the strongest part, weakest part, biggest risk, and fastest improvement; the single first move from the 30-day plan; and the two file paths (`.html` and `.md`). The HTML page is the primary deliverable to read.
```

- [ ] **Step 5: Update the Step 5 quality gate to mention both files**

In `SKILL.md`, in the "Step 5 — Quality Gate" list, change the line `- Strategy file path reported (see Step 6)` to:
```
- Both strategy file paths reported: `.html` (primary) and `.md` (see Step 6)
```

- [ ] **Step 6: Add the contract to the References list**

In `SKILL.md`, under `## References`, add this bullet:
```
- `references/html_render_contract.md` — component vocabulary for rendering the HTML page (load at write time, Step 6)
```
And note the template is not a loadable reference but an asset: add:
```
- `references/strategy-template.html` — locked self-contained HTML shell injected at write time (asset, not prose)
```

- [ ] **Step 7: Verify SKILL.md still parses and references resolve**

Run: `node -e "const fs=require('fs');const s=fs.readFileSync('SKILL.md','utf8');if(!s.includes('version: 1.1.0'))throw new Error('version');if(!s.includes('strategy-template.html'))throw new Error('template ref');if(!s.includes('html_render_contract.md'))throw new Error('contract ref');if(!s.includes('do NOT print all 12 sections')&&!s.includes('do NOT print all 12'))throw new Error('briefing');console.log('SKILL.md OK')"`
Expected: `SKILL.md OK`

- [ ] **Step 8: Commit**

```bash
git add SKILL.md
git commit -m "feat: render strategy as interactive HTML page; terminal shows briefing (v1.1.0)"
```

---

## Task 6: Documentation

**Files:**
- Modify: `README.md`, `CHANGELOG.md`

- [ ] **Step 1: Add the HTML output note to README's "What it does"**

In `README.md`, in the numbered "What it does" list, change item 5 (the "Writes a strategy file" item) to read:
```
5. **Writes the strategy as two files** to `./strategy/`:
   - `playing-to-win-{slug}-{date}.html` — a self-contained, interactive Swiss-design
     page (left phase rail, click-to-expand cascade, assumption cross-highlighting,
     print mode). Opens by double-click; no server or build step. This is the primary
     deliverable, and it opens automatically.
   - `playing-to-win-{slug}-{date}.md` — the canonical markdown source (pandoc-convertible).
```

- [ ] **Step 2: Add an "HTML output" subsection to README**

In `README.md`, immediately before the `## Convert the output to other formats` section, insert:
```
## HTML output

Every run produces a self-contained interactive HTML page alongside the markdown. It is
a single file with all CSS and JavaScript inlined and **no external assets** — it works
offline, opens by double-click, and prints to a clean handout. Navigation is a sticky
left phase rail; the cascade nodes expand on click and cross-highlight their related
assumptions; a "spotlight" toggle dims everything except the unproven assumptions.

The design is brand-neutral (Swiss/International) so anyone can use it. See
[`examples/example-output.html`](examples/example-output.html) for a full sample.

```

- [ ] **Step 3: Update the repository-structure block in README**

In `README.md`'s repository-structure code block, add these entries under the right folders:
```
├── examples/
│   ├── example-output.md                 # Full sample strategy output (markdown)
│   └── example-output.html               # Same sample, rendered interactive page
├── references/
│   ├── strategy-template.html            # Locked self-contained HTML shell
│   ├── html_render_contract.md           # Component vocabulary for the HTML page
```
(Keep the existing reference entries; add the two new lines.)

- [ ] **Step 4: Bump the README version badge**

In `README.md`, change the version badge `version-1.0.0-green` to `version-1.1.0-green`.

- [ ] **Step 5: Add the CHANGELOG entry**

In `CHANGELOG.md`, add a new entry above the existing `1.0.0` entry, matching the file's existing style:
```
## [1.1.0] — 2026-06-08

### Added
- Self-contained interactive HTML strategy page generated on every run, written next to
  the markdown file at `./strategy/playing-to-win-{slug}-{date}.html` and opened
  automatically. Swiss/International design: sticky left phase rail with scrollspy and
  progress, click-to-expand cascade nodes, choice⇄assumption cross-highlighting, an
  "assumption spotlight" toggle, ghosted "where not to play" exclusions, a red verdict
  plate, and a print stylesheet. No server, build step, or external assets.
- `references/strategy-template.html` — the locked, self-contained page template.
- `references/html_render_contract.md` — the component vocabulary the skill follows when
  rendering the page.
- `examples/example-output.html` — the Northwind example rendered as a page.
- `scripts/verify-output.mjs` — dependency-free verifier for generated HTML.

### Changed
- The terminal output is now a short briefing (verdict, strongest/weakest/risk/fastest
  improvement, first 30-day move, file paths) instead of the full 12-section dump. The
  full editorial format remains the content of the markdown file.
```

- [ ] **Step 6: Commit**

```bash
git add README.md CHANGELOG.md
git commit -m "docs: document HTML output and bump to v1.1.0"
```

---

## Task 7: Final acceptance pass

- [ ] **Step 1: Re-run the verifier on the example**

Run: `node scripts/verify-output.mjs examples/example-output.html`
Expected: all checks `PASS`, exit 0.

- [ ] **Step 2: Confirm no stray external requests in the generated file**

Run: `grep -nE "https?://" examples/example-output.html | grep -vE "github.com/paultaki|w3.org" || echo "no external asset URLs"`
Expected: `no external asset URLs` (only the footer credit link and any `xmlns` may appear; no font/script/style URLs).

- [ ] **Step 3: Confirm the markdown path is unchanged**

Run: `git diff --name-only main -- examples/example-output.md`
Expected: empty (the markdown sample was not modified).

- [ ] **Step 4: Review the diff against the spec acceptance criteria**

Open `docs/superpowers/specs/2026-06-08-playing-to-win-html-output-design.md` §11 and confirm each of the 10 acceptance criteria is satisfied by the work in Tasks 1–6. Note any gaps; if found, fix before finishing.

- [ ] **Step 5: Finish the branch**

Invoke the `superpowers:finishing-a-development-branch` skill to choose how to integrate (merge, PR, or keep). Respect the user's git preferences and the public-repo note about the `docs/superpowers/` files.

---

## Acceptance Criteria (from the spec)

1. Running the skill writes both `.html` and `.md`. _(Task 5)_
2. The `.html` opens by double-click — no server, network, or runtime. _(Tasks 3, 4, 7)_
3. Left rail lists 4 phases / all sections, scrollspy highlight, click-to-jump. _(Task 3 JS, Task 4 smoke)_
4. Clicking a cascade node expands detail + cross-highlights related assumptions. _(Task 3 JS, Task 4 smoke)_
5. Assumption-spotlight toggle dims non-assumption content. _(Task 3 CSS/JS)_
6. JS-disabled content still present and readable; print = clean linear handout. _(Task 3 print CSS, progressive enhancement)_
7. Terminal shows briefing only. _(Task 5 Step 4)_
8. `examples/example-output.html` matches live output structure. _(Task 4)_
9. AA contrast; cascade keyboard-operable. _(Task 3: real buttons, focus-visible, white/ink/red contrast)_
10. No external font/asset requests. _(Task 1 verifier, Task 7 Step 2)_
