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
      <a class="p2w-how" href="#">Test: survey 30 brands in DTC Slack.</a></span>
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
